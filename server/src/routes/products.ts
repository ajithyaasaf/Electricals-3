import type { Express } from "express";
import { storage } from "../../storage";
import { isAuthenticated } from "../../firebaseAuth";
import { CreateProductSchema } from "@shared/types";

export function registerProductRoutes(app: Express) {
  // Get all products with filtering and pagination
  app.get("/api/products", async (req, res) => {
    try {
      const { categoryId, category, search, featured, minPrice, maxPrice, sortBy = "newest", sortOrder = "desc", limit = 20, offset = 0 } = req.query;

      let products: any[] = [];
      if (featured === "true") {
        products = await storage.getFeaturedProducts();
      } else if (categoryId) {
        products = await storage.getProductsByCategory(categoryId as string);
      } else if (category) {
        // Handle category slug - find category by slug first, then get products
        const categories = await storage.getAllCategories();
        const foundCategory = categories.find(cat => cat.slug === category);
        if (foundCategory) {
          products = await storage.getProductsByCategory(foundCategory.id);
        } else {
          products = [];
        }
      } else if (search) {
        products = await storage.searchProducts(search as string);
      } else {
        products = await storage.getAllProducts();
      }

      // Apply discount filtering
      if (req.query.hasDiscount === "true") {
        products = products.filter(p => p.originalPrice && p.originalPrice > p.price);
      }

      // Apply price filtering
      if (minPrice || maxPrice) {
        const minPriceNum = minPrice ? parseFloat(minPrice as string) : 0;
        const maxPriceNum = maxPrice ? parseFloat(maxPrice as string) : Infinity;

        console.log(`🔍 Price filtering: min=${minPriceNum}, max=${maxPriceNum}`);

        const originalCount = products.length;
        products = products.filter(product => {
          const price = parseFloat(product.price.toString());
          const withinRange = price >= minPriceNum && price <= maxPriceNum;
          if (!withinRange) {
            console.log(`🚫 Product ${product.name} (₹${price}) excluded from range ₹${minPriceNum}-₹${maxPriceNum}`);
          }
          return withinRange;
        });

        console.log(`📊 Price filtering: ${originalCount} → ${products.length} products`);
      }

      // Apply sorting
      products = products.sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
          case "name":
            comparison = a.name.localeCompare(b.name);
            break;
          case "price":
            comparison = parseFloat(a.price.toString()) - parseFloat(b.price.toString());
            break;
          case "rating":
            comparison = (a.rating || 0) - (b.rating || 0);
            break;
          case "newest":
          default:
            // For newest, we'll use the product id or creation time if available
            comparison = a.id.localeCompare(b.id);
            break;
        }

        return sortOrder === "desc" ? -comparison : comparison;
      });

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