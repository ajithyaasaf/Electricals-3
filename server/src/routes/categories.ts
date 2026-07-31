import type { Express } from "express";
import { storage } from "../../storage";
import { isAuthenticated } from "../../firebaseAuth";
import { CreateCategorySchema } from "@shared/types";
import { cache, CacheTTL } from "../lib/cache";

export function registerCategoryRoutes(app: Express) {
  // Get all categories (cached 2 mins)
  app.get("/api/categories", async (req, res) => {
    try {
      const cacheKey = "categories:all";
      const cached = cache.get<any[]>(cacheKey);
      if (cached) return res.json(cached);

      const categories = await storage.getAllCategories();
      cache.set(cacheKey, categories, CacheTTL.CATEGORIES);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get single category by ID (cached 2 mins)
  app.get("/api/categories/:id", async (req, res) => {
    try {
      const cacheKey = `categories:id:${req.params.id}`;
      const cached = cache.get<any>(cacheKey);
      if (cached) return res.json(cached);

      const category = await storage.getCategoryById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      cache.set(cacheKey, category, CacheTTL.CATEGORIES);
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Create category (Admin only)
  app.post("/api/categories", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const user = await storage.getUserById(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const categoryData = CreateCategorySchema.parse(req.body);
      const categoryId = await storage.createCategory(categoryData);
      const category = await storage.getCategoryById(categoryId);

      cache.invalidateByPrefix("categories");
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Update category (Admin only)
  app.put("/api/categories/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const user = await storage.getUserById(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const categoryData = CreateCategorySchema.partial().parse(req.body);
      await storage.updateCategory(req.params.id, categoryData);
      const category = await storage.getCategoryById(req.params.id);
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  // Delete category (Admin only)
  app.delete("/api/categories/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const user = await storage.getUserById(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteCategory(req.params.id);
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });
}