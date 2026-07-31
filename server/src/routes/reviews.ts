import type { Express } from "express";
import { storage } from "../../storage";
import { isAuthenticated } from "../../firebaseAuth";
import { CreateReviewSchema } from "@shared/types";
import { cache, CacheTTL } from "../lib/cache";

export function registerReviewRoutes(app: Express) {
  // Get reviews (cached 2 mins)
  app.get("/api/reviews", async (req, res) => {
    try {
      const { productId, serviceId } = req.query;

      if (!productId && !serviceId) {
        return res.status(400).json({ message: "productId or serviceId required" });
      }

      const cacheKey = `reviews:${productId ? `product:${productId}` : `service:${serviceId}`}`;
      const cached = cache.get<any[]>(cacheKey);
      if (cached) return res.json(cached);

      let reviews;
      if (productId) {
        reviews = await storage.getProductReviews(productId as string);
      } else {
        reviews = await storage.getServiceReviews(serviceId as string);
      }

      cache.set(cacheKey, reviews, CacheTTL.PRODUCTS_LIST);
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

      cache.invalidateByPrefix("reviews");
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });
}