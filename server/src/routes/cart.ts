import type { Express } from "express";
import { storage } from "../../storage";
import { isAuthenticated } from "../../firebaseAuth";
import { CreateCartItemSchema } from "@shared/types";

export function registerCartRoutes(app: Express) {
  // Get user cart
  app.get("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const cartItems = await storage.getUserCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  // Guest cart endpoint - no authentication required for adding to cart
  app.post("/api/cart/guest", async (req, res) => {
    try {
      const { items } = req.body; // Array of cart items from frontend
      
      // For guest users, just return the items with product/service details
      const enrichedItems = [];
      
      for (const item of items) {
        let enrichedItem = { ...item };
        
        if (item.productId) {
          const product = await storage.getProductById(item.productId);
          enrichedItem.product = product;
        }
        
        if (item.serviceId) {
          const service = await storage.getServiceById(item.serviceId);
          enrichedItem.service = service;
        }
        
        enrichedItems.push(enrichedItem);
      }
      
      res.json(enrichedItems);
    } catch (error) {
      console.error("Error processing guest cart:", error);
      res.status(500).json({ message: "Failed to process guest cart" });
    }
  });

  // Add to cart (authenticated users)
  app.post("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const { productId, serviceId, quantity = 1 } = req.body;
      
      const cartItemId = await storage.addToCart(userId, productId, serviceId, quantity);
      const cartItem = await storage.getCartItemById(cartItemId);
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  // Update cart item
  app.put("/api/cart/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const cartItem = await storage.getCartItemById(req.params.id);
      
      if (!cartItem || cartItem.userId !== userId) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      const { quantity } = req.body;
      await storage.updateCartItem(req.params.id, { quantity });
      const updatedItem = await storage.getCartItemById(req.params.id);
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  // Remove from cart
  app.delete("/api/cart/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const cartItem = await storage.getCartItemById(req.params.id);
      
      if (!cartItem || cartItem.userId !== userId) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      await storage.deleteCartItem(req.params.id);
      res.json({ message: "Cart item removed successfully" });
    } catch (error) {
      console.error("Error removing cart item:", error);
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });
}