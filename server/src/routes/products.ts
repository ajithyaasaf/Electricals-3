import type { Express } from "express";
import { storage } from "../../storage";
import { isAuthenticated } from "../../firebaseAuth";
import { CreateProductSchema } from "@shared/types";

export function registerProductRoutes(app: Express) {
  // Get all products with filtering and pagination
  app.get("/api/products", async (req, res) => {
    try {
      const { categoryId, category, search, featured, bestsellers, new: isNew, trending, minPrice, maxPrice, sortBy = "newest", sortOrder = "desc", limit = 20, offset = 0 } = req.query;

      let products: any[] = [];
      if (featured === "true") {
        products = await storage.getFeaturedProducts();
      } else if (categoryId || category) {
        const catTarget = (categoryId || category) as string;
        products = await storage.getProductsByCategory(catTarget);
      } else if (search) {
        products = await storage.searchProducts(search as string);
      } else {
        products = await storage.getAllProducts();
      }

      // Apply discount filtering
      if (req.query.hasDiscount === "true") {
        products = products.filter(p => p.originalPrice && p.originalPrice > p.price);
      }

      // Handle specific section query parameters for diversity on homepage
      if (bestsellers === "true") {
        // Best Sellers: Sort by rating (highest rating & review count first)
        products = [...products].sort((a, b) => {
          const ratingDiff = (b.rating || 0) - (a.rating || 0);
          if (Math.abs(ratingDiff) > 0.01) return ratingDiff;
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        });
      } else if (isNew === "true") {
        // New Arrivals: Sort by ascending ID order (prod-001, prod-002...)
        products = [...products].sort((a, b) => a.id.localeCompare(b.id));
      } else if (trending === "true") {
        // Trending Now: Sort by highest percentage discount & featured state
        products = [...products].sort((a, b) => {
          const discA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
          const discB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
          return discB - discA;
        });
      }

      // Apply price filtering
      if (minPrice || maxPrice) {
        const minPriceNum = minPrice ? parseFloat(minPrice as string) : 0;
        const maxPriceNum = maxPrice ? parseFloat(maxPrice as string) : Infinity;

        const originalCount = products.length;
        products = products.filter(product => {
          const price = parseFloat(product.price.toString());
          return price >= minPriceNum && price <= maxPriceNum;
        });
      }

      // Apply sorting if explicit sortBy is passed and not handled above
      if (!bestsellers && !isNew && !trending) {
        products = products.sort((a, b) => {
          let comparison = 0;

          switch (sortBy) {
            case "featured":
              const aFeatured = a.isFeatured ? 1 : 0;
              const bFeatured = b.isFeatured ? 1 : 0;
              comparison = aFeatured - bFeatured;
              break;

            case "name":
              comparison = a.name.localeCompare(b.name);
              break;

            case "price":
              const priceA = parseFloat(a.price?.toString() || "0") || 0;
              const priceB = parseFloat(b.price?.toString() || "0") || 0;
              comparison = priceA - priceB;
              break;

            case "rating":
              const ratingA = a.rating || 0;
              const ratingB = b.rating || 0;
              comparison = ratingA - ratingB;
              break;

            case "newest":
            default:
              comparison = 0;
              break;
          }

          const result = sortOrder === "desc" ? -comparison : comparison;
          if (result === 0) {
            return b.id.localeCompare(a.id);
          }

          return result;
        });
      }

      // Apply pagination
      const limitNum = parseInt(limit as string);
      const offsetNum = parseInt(offset as string);
      const paginatedProducts = products.slice(offsetNum, offsetNum + limitNum);

      res.json({
        products: paginatedProducts,
        total: products.length,
        limit: limitNum,
        offset: offsetNum
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get product by slug
  app.get("/api/products/slug/:slug", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      const product = products.find(p => p.slug === req.params.slug);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product by slug:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Get product by ID
  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Create product (Admin only)
  app.post("/api/products", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const user = await storage.getUserById(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const productData = CreateProductSchema.parse(req.body);
      const productId = await storage.createProduct(productData);
      const product = await storage.getProductById(productId);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Update product (Admin only)
  app.put("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const user = await storage.getUserById(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const productData = CreateProductSchema.partial().parse(req.body);
      await storage.updateProduct(req.params.id, productData);
      const product = await storage.getProductById(req.params.id);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  // Delete product (Admin only)
  app.delete("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const user = await storage.getUserById(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteProduct(req.params.id);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });
}