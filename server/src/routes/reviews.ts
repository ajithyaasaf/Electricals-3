import type { Express } from "express";
import { storage } from "../../storage";
import { isAuthenticated } from "../../firebaseAuth";
import { CreateReviewSchema } from "@shared/types";

export function registerReviewRoutes(app: Express) {
  // Get reviews
  app.get("/api/reviews", async (req, res) => {
    try {
      const { productId, serviceId } = req.query;
      
      let reviews;
      if (productId) {
        reviews = await storage.getProductReviews(productId as string);
      } else if (serviceId) {
        reviews = await storage.getServiceReviews(serviceId as string);
      } else {
        return res.status(400).json({ message: "productId or serviceId required" });
      }
      
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Create review
  app.post("/api/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const reviewData = { ...CreateReviewSchema.parse(req.body), userId };
      
      const reviewId = await storage.createReview(reviewData);
      const review = await storage.getReviewById(reviewId);
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });
}