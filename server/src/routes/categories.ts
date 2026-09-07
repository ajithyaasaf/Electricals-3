import type { Express } from "express";
import { storage } from "../../storage";
import { isAuthenticated } from "../../firebaseAuth";
import { CreateCategorySchema } from "@shared/types";
import { cache, CacheTTL } from "../lib/cache";

export function registerCategoryRoutes(app: Express) {
  // Get all categories with real product counts and dynamic images (cached 2 mins)
  app.get("/api/categories", async (req, res) => {
    try {
      const cacheKey = "categories:all";
      const cached = cache.get<any[]>(cacheKey);
      if (cached) return res.json(cached);

      const [categories, products] = await Promise.all([
        storage.getAllCategories(),
        storage.getAllProducts(),
      ]);

      // Calculate real product count and top product image for each category
      const enrichedCategories = categories.map((cat) => {
        const catProducts = products.filter(
          (p) => p.categoryId === cat.id || p.categoryId === cat.slug || p.category === cat.slug
        );
        const count = catProducts.length;

        // Find real product image from this category (prioritizing Cloudinary product photos)
        const productWithImage = catProducts.find(
          (p) => p.imageUrls && p.imageUrls.length > 0 && p.imageUrls[0]
        );
        const realProductImage = productWithImage?.imageUrls?.[0];

        // If category has a custom uploaded image (not generic stock placeholder from initial seed), use it;
        // otherwise, use the real product photo from Cloudinary
        const isDefaultPlaceholder = !cat.imageUrl || cat.imageUrl.includes("images.unsplash.com");
        const effectiveImage = isDefaultPlaceholder ? (realProductImage || cat.imageUrl) : cat.imageUrl;

        return {
          ...cat,
          productCount: count,
          imageUrl: effectiveImage,
        };
      });

      cache.set(cacheKey, enrichedCategories, CacheTTL.CATEGORIES);
      res.json(enrichedCategories);
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
      
      // Check for duplicate slug
      const existing = await storage.getCategoryBySlug(categoryData.slug);
      if (existing) {
        return res.status(400).json({ message: `A category with slug "${categoryData.slug}" already exists.` });
      }

      const categoryId = await storage.createCategory(categoryData);
      const category = await storage.getCategoryById(categoryId);

      cache.invalidateByPrefix("categories");
      res.json(category);
    } catch (error: any) {
      console.error("Error creating category:", error);
      const errMsg = error?.errors?.[0]?.message || error?.message || "Failed to create category";
      res.status(400).json({ message: errMsg });
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
      
      cache.invalidateByPrefix("categories");
      res.json(category);
    } catch (error: any) {
      console.error("Error updating category:", error);
      const errMsg = error?.errors?.[0]?.message || error?.message || "Failed to update category";
      res.status(400).json({ message: errMsg });
    }
  });

  // Delete category (Admin only with product cascade protection)
  app.delete("/api/categories/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const user = await storage.getUserById(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const category = await storage.getCategoryById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      // Safeguard: Check if any products are assigned to this category
      const allProducts = await storage.getAllProducts();
      const linkedProducts = allProducts.filter(
        (p) => p.categoryId === req.params.id || (p.category && p.category.toLowerCase() === category.name.toLowerCase())
      );

      if (linkedProducts.length > 0) {
        return res.status(400).json({
          message: `Cannot delete category "${category.name}". There are ${linkedProducts.length} product(s) assigned to this category. Please reassign or remove the products first.`
        });
      }

      await storage.deleteCategory(req.params.id);
      cache.invalidateByPrefix("categories");
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });
}