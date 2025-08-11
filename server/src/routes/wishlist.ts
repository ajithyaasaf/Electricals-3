import type { Express } from "express";
import { storage } from "../../storage";
import { isAuthenticated } from "../../firebaseAuth";
import { CreateWishlistItemSchema } from "@shared/types";

export function registerWishlistRoutes(app: Express) {
  // Get user wishlist
  app.get("/api/wishlist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const wishlist = await storage.getUserWishlist(userId);
      res.json(wishlist);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  // Add to wishlist
  app.post("/api/wishlist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const wishlistData = { ...CreateWishlistItemSchema.parse(req.body), userId };
      
      const wishlistId = await storage.createWishlistItem(wishlistData);
      const wishlistItem = await storage.getWishlistItemById(wishlistId);
      res.json(wishlistItem);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      res.status(500).json({ message: "Failed to add to wishlist" });
    }
  });

  // Remove from wishlist
  app.delete("/api/wishlist/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const wishlistItem = await storage.getWishlistItemById(req.params.id);
      
      if (!wishlistItem || wishlistItem.userId !== userId) {
        return res.status(404).json({ message: "Wishlist item not found" });
      }

      await storage.deleteWishlistItem(req.params.id);
      res.json({ message: "Item removed from wishlist successfully" });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  });
}