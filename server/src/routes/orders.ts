/**
 * Order Routes
 * 
 * Handles all order-related API endpoints including:
 * - Order creation with atomic stock validation
 * - Order listing with filtering and pagination
 * - Order status updates with state machine validation
 * - Order details with items and history
 * - Customer order cancellation
 */

import type { Express, Request, Response } from "express";
import { storage } from "../../storage";
import { isAuthenticated } from "../../firebaseAuth";
import { z } from "zod";
import { OrderStatus, ORDER_STATUSES, ShippingAddressSchema } from "@shared/types";
import { isServiceable, getServiceabilityMessage } from "@shared/delivery-zones";
import {
  createOrderWithTransaction,
  updateOrderStatusWithTransaction,
  getOrderDetails,
  approveBankTransferPayment,
  expireUnpaidOrders,
  AdminOrderQueries,
  AdminCartQueries,
} from "../../adminFirestoreService";
import {
  canCustomerCancel,
  STATUS_LABELS,
  VALID_TRANSITIONS,
} from "../../lib/orderStateMachine";

// ═══════════════════════════════════════════════════════════════════════════
// REQUEST SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

const CreateOrderRequestSchema = z.object({
  shippingAddress: ShippingAddressSchema,
});

const UpdateStatusRequestSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  reason: z.string().optional(),
});

const CancelOrderRequestSchema = z.object({
  reason: z.string().optional(),
});

// ═══════════════════════════════════════════════════════════════════════════
// ROUTE HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

export function registerOrderRoutes(app: Express) {

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/orders - List orders (paginated, filterable for admins)
  // ─────────────────────────────────────────────────────────────────────────
  app.get("/api/orders", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.uid;
      const user = await storage.getUserById(userId);

      // Parse query params
      const status = req.query.status as string | undefined;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      let orders;

      if (user?.isAdmin) {
        // Admin: Get filtered orders with pagination
        orders = await AdminOrderQueries.getOrdersWithFilters({
          status,
          startDate,
          endDate,
          limit,
          offset,
        });
      } else {
        // Customer: Get only their orders
        orders = await storage.getUserOrders(userId);
      }

      // Return with pagination info
      res.json({
        orders,
        pagination: {
          limit,
          offset,
          hasMore: orders.length === limit,
        },
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      // Return specific error message (e.g. valid Firestore index link)
      res.status(500).json({ message: "Failed to fetch orders", error: (error as Error).message });
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/orders/stats - Order counts by status (Admin only)
  // ─────────────────────────────────────────────────────────────────────────
  app.get("/api/orders/stats", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.uid;
      const user = await storage.getUserById(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await AdminOrderQueries.getOrderStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching order stats:", error);
      res.status(500).json({ message: "Failed to fetch order stats" });
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // POST /api/orders - Create new order (transactional)
  // ─────────────────────────────────────────────────────────────────────────
  app.post("/api/orders", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.uid;

      // Validate request
      const validationResult = CreateOrderRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid request data",
          errors: validationResult.error.flatten().fieldErrors,
        });
      }

      const { shippingAddress } = validationResult.data;

      // ═══════════════════════════════════════════════════════════════════
      // DELIVERY ZONE GATEKEEPER - Madurai Only (Phase 1)
      // ═══════════════════════════════════════════════════════════════════
      const pincode = shippingAddress.zipCode;
      if (!isServiceable(pincode)) {
        return res.status(400).json({
          message: "Delivery not available in your area",
          details: getServiceabilityMessage(pincode),
          code: "DELIVERY_NOT_SERVICEABLE",
          pincode,
        });
      }

      // Get user info for denormalization
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const customerName = `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        user.email?.split("@")[0] || "Customer";

      // Get cart items
      const cartItems = await storage.getUserCartItems(userId);
      if (cartItems.length === 0) {
        return res.status(400).json({
          message: "Your cart is empty. Add items before placing an order.",
          code: "CART_EMPTY",
        });
      }

      // Enrich cart items with product data
      const enrichedItems = await Promise.all(
        cartItems.map(async (item) => {
          if (!item.productId) {
            throw new Error("Cart item missing productId");
          }
          const product = await storage.getProductById(item.productId);
          if (!product) {
            throw new Error(`Product "${item.productId}" not found`);
          }
          return {
            productId: item.productId,
            productName: product.name,
            productSku: product.sku,
            productImageUrl: product.imageUrls?.[0],
            unitPrice: product.price,
            quantity: item.quantity,
          };
        })
      );

      // Create order with atomic stock validation
      const { orderId, orderNumber } = await createOrderWithTransaction({
        userId,
        customerName,
        customerEmail: user.email || "",
        customerPhone: shippingAddress.phone,
        shippingAddress,
        items: enrichedItems,
      });

      // Clear the user's cart after successful order creation
      try {
        await AdminCartQueries.clearCart(userId);
      } catch (error) {
        console.error("Failed to clear cart after order creation:", error);
        // Don't fail the request, as the order was already created
      }

      // Fetch the created order
      const order = await storage.getOrderById(orderId);

      res.status(201).json({
        message: "Order placed successfully!",
        order: {
          ...order,
          orderNumber,
        },
      });
    } catch (error: any) {
      console.error("Error creating order:", error);

      // Handle specific error types
      if (error.message.includes("Insufficient stock")) {
        return res.status(400).json({
          message: error.message,
          code: "INSUFFICIENT_STOCK",
        });
      }

      if (error.message.includes("no longer exists")) {
        return res.status(400).json({
          message: error.message,
          code: "PRODUCT_NOT_FOUND",
        });
      }

      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/orders/:id - Get single order
  // ─────────────────────────────────────────────────────────────────────────
  app.get("/api/orders/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.uid;
      const orderId = req.params.id;

      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const user = await storage.getUserById(userId);

      // Only owner or admin can view
      if (!user?.isAdmin && order.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/orders/:id/details - Get order with items and history (Admin)
  // ─────────────────────────────────────────────────────────────────────────
  app.get("/api/orders/:id/details", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.uid;
      const orderId = req.params.id;

      const user = await storage.getUserById(userId);

      // Get order first to check ownership
      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Admin or owner can view details
      if (!user?.isAdmin && order.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const details = await getOrderDetails(orderId);
      if (!details) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(details);
    } catch (error) {
      console.error("Error fetching order details:", error);
      res.status(500).json({ message: "Failed to fetch order details" });
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/orders/:id/history - Get order status timeline
  // ─────────────────────────────────────────────────────────────────────────
  app.get("/api/orders/:id/history", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.uid;
      const orderId = req.params.id;

      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const user = await storage.getUserById(userId);

      // Admin or owner can view history
      if (!user?.isAdmin && order.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const history = await AdminOrderQueries.getOrderHistory(orderId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching order history:", error);
      res.status(500).json({ message: "Failed to fetch order history" });
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // PUT /api/orders/:id/status - Update order status (Admin only)
  // ─────────────────────────────────────────────────────────────────────────
  app.put("/api/orders/:id/status", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.uid;
      const orderId = req.params.id;

      const user = await storage.getUserById(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Validate request
      const validationResult = UpdateStatusRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid request data",
          errors: validationResult.error.flatten().fieldErrors,
        });
      }

      const { status, reason } = validationResult.data;

      // Get current order to check existing status
      const currentOrder = await storage.getOrderById(orderId);
      if (!currentOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Get valid next statuses for helpful error message
      const currentStatus = currentOrder.status as OrderStatus;
      const validNextStatuses = VALID_TRANSITIONS[currentStatus] || [];

      // Update status with transaction
      const updatedOrder = await updateOrderStatusWithTransaction(
        orderId,
        status,
        {
          userId,
          email: user.email,
          role: "admin",
        },
        reason
      );

      res.json({
        message: `Order status updated to "${STATUS_LABELS[status]}"`,
        order: updatedOrder,
      });
    } catch (error: any) {
      console.error("Error updating order status:", error);

      // Handle state machine errors
      if (
        error.message.includes("Invalid status transition") ||
        error.message.includes("already cancelled") ||
        error.message.includes("cannot be modified") ||
        error.message.includes("terminal state")
      ) {
        return res.status(400).json({
          message: error.message,
          code: "INVALID_TRANSITION",
        });
      }

      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // POST /api/orders/:id/cancel - Customer self-cancel order
  // ─────────────────────────────────────────────────────────────────────────
  app.post("/api/orders/:id/cancel", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.uid;
      const orderId = req.params.id;

      // Validate request
      const validationResult = CancelOrderRequestSchema.safeParse(req.body);
      const reason = validationResult.success ? validationResult.data.reason : undefined;

      // Get order
      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Only owner can cancel their own order
      if (order.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Check if order can be cancelled by customer
      const currentStatus = order.status as OrderStatus;
      if (!canCustomerCancel(currentStatus)) {
        return res.status(400).json({
          message: `Orders in "${STATUS_LABELS[currentStatus]}" status cannot be cancelled by customers. Please contact support.`,
          code: "CANNOT_CANCEL",
          currentStatus,
        });
      }

      // Get user info
      const user = await storage.getUserById(userId);

      // Cancel order
      const updatedOrder = await updateOrderStatusWithTransaction(
        orderId,
        "cancelled",
        {
          userId,
          email: user?.email,
          role: "customer",
        },
        reason || "Cancelled by customer"
      );

      res.json({
        message: "Order cancelled successfully. Stock has been restored.",
        order: updatedOrder,
      });
    } catch (error: any) {
      console.error("Error cancelling order:", error);

      if (error.message.includes("already cancelled")) {
        return res.status(400).json({
          message: "Order is already cancelled.",
          code: "ALREADY_CANCELLED",
        });
      }

      res.status(500).json({ message: "Failed to cancel order" });
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // PUT /api/orders/:id/tracking - Add tracking info (Admin only)
  // ─────────────────────────────────────────────────────────────────────────
  app.put("/api/orders/:id/tracking", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.uid;
      const orderId = req.params.id;

      const user = await storage.getUserById(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { trackingNumber, trackingCarrier, trackingUrl } = req.body;

      if (!trackingNumber) {
        return res.status(400).json({ message: "Tracking number is required" });
      }

      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      await storage.updateOrder(orderId, {
        trackingNumber,
        trackingCarrier: trackingCarrier || null,
        trackingUrl: trackingUrl || null,
      });

      const updatedOrder = await storage.getOrderById(orderId);
      res.json({
        message: "Tracking information updated",
        order: updatedOrder,
      });
    } catch (error) {
      console.error("Error updating tracking:", error);
      res.status(500).json({ message: "Failed to update tracking information" });
    }
  });


  // ─────────────────────────────────────────────────────────────────────────
  // POST /api/orders/:id/confirm-payment - Submit payment proof
  // ─────────────────────────────────────────────────────────────────────────
  app.post("/api/orders/:id/confirm-payment", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.uid;
      const orderId = req.params.id;
      const { transactionId, paymentProofUrl } = req.body;

      if (!transactionId) {
        return res.status(400).json({ message: "Transaction ID is required" });
      }

      // Get order
      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Verify ownership
      if (order.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Idempotency & State Guard
      if (order.paymentStatus !== 'awaiting_payment') {
        // If already pending verification, just return success (idempotent)
        if (order.paymentStatus === 'verification_pending') {
          return res.status(200).json({
            message: "Payment proof already submitted",
            order
          });
        }

        return res.status(400).json({
          message: "Order is not awaiting payment",
          currentStatus: order.paymentStatus
        });
      }

      // Update order
      await storage.updateOrder(orderId, {
        transactionId,
        paymentProofUrl: paymentProofUrl || null,
        paymentStatus: 'verification_pending',
      });

      // Fetch updated order
      const updatedOrder = await storage.getOrderById(orderId);

      // TODO: Send email notification here

      res.json({
        message: "Payment proof submitted successfully. Verification pending.",
        order: updatedOrder,
      });
    } catch (error) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "Failed to submit payment proof" });
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // POST /api/orders/:id/approve-payment - Approve bank transfer (Admin only)
  // ─────────────────────────────────────────────────────────────────────────
  app.post("/api/orders/:id/approve-payment", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.uid;
      const orderId = req.params.id;

      const user = await storage.getUserById(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const updatedOrder = await approveBankTransferPayment(orderId, {
        userId,
        email: user.email,
        role: "admin",
      });

      res.json({
        message: "Payment approved and order processed successfully.",
        order: updatedOrder,
      });
    } catch (error: any) {
      console.error("Error approving payment:", error);

      if (error.message.includes("Insufficient stock")) {
        return res.status(400).json({
          message: error.message,
          code: "INSUFFICIENT_STOCK",
        });
      }

      if (error.message.includes("Only bank transfer")) {
        return res.status(400).json({ message: error.message });
      }

      res.status(500).json({ message: "Failed to approve payment" });
    }
  });

}