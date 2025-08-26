import type { Express } from "express";
import { storage } from "../../storage";
import { isAuthenticated } from "../../firebaseAuth";
import { CreateOrderSchema, CreateOrderItemSchema } from "@shared/types";

export function registerOrderRoutes(app: Express) {
  // Get user orders
  app.get("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const user = await storage.getUserById(userId);
      
      let orders;
      if (user?.isAdmin) {
        orders = await storage.getAllOrders();
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
}