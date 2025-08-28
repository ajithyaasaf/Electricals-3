import type { Express } from "express";
import { storage } from "../../storage";
import { isAuthenticated } from "../../firebaseAuth";
import { CreateOrderSchema, CreateOrderItemSchema } from "@shared/types";
import { z } from "zod";

export function registerOrderRoutes(app: Express) {
  // Get user orders
  app.get("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const user = await storage.getUserById(userId);
      
      let orders;
      if (user?.isAdmin) {
        orders = await storage.getAllOrders();
        // Enrich orders with customer information for admin view
        const enrichedOrders = await Promise.all(
          orders.map(async (order: any) => {
            try {
              const customer = await storage.getUserById(order.userId);
              let customerName = 'Unknown Customer';
              if (customer) {
                // Try to build a proper name
                const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
                if (fullName && fullName !== 'User') {
                  customerName = fullName;
                } else {
                  // Fall back to email username (part before @)
                  customerName = customer.email ? customer.email.split('@')[0] : 'Unknown Customer';
                }
              }
              return {
                ...order,
                customerName
              };
            } catch (error) {
              console.error(`Error fetching customer data for order ${order.id}:`, error);
              return {
                ...order,
                customerName: 'Unknown Customer'
              };
            }
          })
        );
        orders = enrichedOrders;
      } else {
        orders = await storage.getUserOrders(userId);
      }
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Create order
  app.post("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      console.log("[DEBUG] req.user:", req.user);
      const userId = req.user?.uid;
      console.log("[DEBUG] userId:", userId);
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      console.log("[DEBUG] Order request body:", req.body);
      const orderData = { ...req.body, userId };
      console.log("[DEBUG] Order data before validation:", orderData);
      
      const validatedOrderData = CreateOrderSchema.parse(orderData);
      
      const orderId = await storage.createOrder(validatedOrderData);
      const order = await storage.getOrderById(orderId);
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Get single order
  app.get("/api/orders/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const order = await storage.getOrderById(req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const user = await storage.getUserById(userId);
      if (!user?.isAdmin && order.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Update order status (Admin only)
  app.put("/api/orders/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const user = await storage.getUserById(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const order = await storage.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Validate status update
      const statusSchema = z.object({
        status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
      });

      const { status } = statusSchema.parse(req.body);

      await storage.updateOrder(req.params.id, { status });
      const updatedOrder = await storage.getOrderById(req.params.id);
      
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Get order details with customer contact info (Admin only)
  app.get("/api/orders/:id/details", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const user = await storage.getUserById(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const order = await storage.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Get customer information
      const customer = await storage.getUserById(order.userId);
      let customerName = 'Unknown Customer';
      if (customer) {
        const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
        if (fullName && fullName !== 'User') {
          customerName = fullName;
        } else {
          customerName = customer.email ? customer.email.split('@')[0] : 'Unknown Customer';
        }
      }

      // Get order items
      const orderItems = await storage.getOrderItems(order.id);

      // Enrich order items with product details
      const enrichedItems = await Promise.all(
        orderItems.map(async (item) => {
          if (item.productId) {
            const product = await storage.getProductById(item.productId);
            return {
              ...item,
              product: product
            };
          }
          return item;
        })
      );

      const orderDetails = {
        ...order,
        customerName,
        customerEmail: customer?.email || 'Unknown',
        customerPhone: 'Not provided', // Phone field not available in User schema
        items: enrichedItems,
        itemCount: enrichedItems.length
      };

      res.json(orderDetails);
    } catch (error) {
      console.error("Error fetching order details:", error);
      res.status(500).json({ message: "Failed to fetch order details" });
    }
  });
}