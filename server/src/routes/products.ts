import type { Express } from "express";
import { storage } from "../../storage";
import { isAuthenticated } from "../../firebaseAuth";
import { CreateProductSchema } from "@shared/types";
import { cache, CacheTTL, CacheKeys } from "../lib/cache";

export function registerProductRoutes(app: Express) {
  // ─── Public: Get all products with filtering and pagination ──────────────
  app.get("/api/products", async (req, res) => {
    try {
      const {
        categoryId, category, search, featured,
        bestsellers, new: isNew, trending,
        minPrice, maxPrice,
        sortBy = "newest", sortOrder = "desc",
        limit = 20, offset = 0,
        hasDiscount,
      } = req.query;

      // Build a deterministic cache key from all query params so that every
      // unique filter combination has its own cache slot.
      const queryKey = CacheKeys.products.all(JSON.stringify(req.query));
      const cached = cache.get<{ products: any[]; total: number; limit: number; offset: number }>(queryKey);
      if (cached) {
        return res.json(cached);
      }

      // ── Fetch base dataset ──────────────────────────────────────────────
      let products: any[];
      if (featured === "true") {
        const featKey = CacheKeys.products.featured();
        products = cache.get<any[]>(featKey) ?? await storage.getFeaturedProducts();
        cache.set(featKey, products, CacheTTL.PRODUCTS_LIST);
      } else if (categoryId || category) {
        const catTarget = (categoryId || category) as string;
        const catKey = CacheKeys.products.byCategory(catTarget);
        products = cache.get<any[]>(catKey) ?? await storage.getProductsByCategory(catTarget);
        cache.set(catKey, products, CacheTTL.PRODUCTS_LIST);
      } else if (search) {
        // Search results are intentionally NOT cached — queries are too varied
        products = await storage.searchProducts(search as string);
      } else {
        // Full product list — safe to cache
        const allKey = CacheKeys.products.all("__all__");
        products = cache.get<any[]>(allKey) ?? await storage.getAllProducts();
        cache.set(allKey, products, CacheTTL.PRODUCTS_LIST);
      }

      // ── In-memory filtering (fast — no extra DB round-trip) ────────────
      if (hasDiscount === "true") {
        products = products.filter(p => p.originalPrice && p.originalPrice > p.price);
      }

      if (minPrice || maxPrice) {
        const minPriceNum = minPrice ? parseFloat(minPrice as string) : 0;
        const maxPriceNum = maxPrice ? parseFloat(maxPrice as string) : Infinity;
        products = products.filter(product => {
          const price = parseFloat(product.price.toString());
          return price >= minPriceNum && price <= maxPriceNum;
        });
      }

      // ── Sorting ─────────────────────────────────────────────────────────
      if (bestsellers === "true") {
        products = [...products].sort((a, b) => {
          const diff = (b.rating || 0) - (a.rating || 0);
          return Math.abs(diff) > 0.01 ? diff : (b.reviewCount || 0) - (a.reviewCount || 0);
        });
      } else if (isNew === "true") {
        products = [...products].sort((a, b) => a.id.localeCompare(b.id));
      } else if (trending === "true") {
        products = [...products].sort((a, b) => {
          const discA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
          const discB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
          return discB - discA;
        });
      } else {
        products = products.sort((a, b) => {
          let comparison = 0;
          switch (sortBy) {
            case "featured":
              comparison = (a.isFeatured ? 1 : 0) - (b.isFeatured ? 1 : 0);
              break;
            case "name":
              comparison = a.name.localeCompare(b.name);
              break;
            case "price":
              comparison = (parseFloat(a.price?.toString() || "0") || 0) -
                           (parseFloat(b.price?.toString() || "0") || 0);
              break;
            case "rating":
              comparison = (a.rating || 0) - (b.rating || 0);
              break;
            case "newest":
            default:
              comparison = 0;
              break;
          }
          const result = sortOrder === "desc" ? -comparison : comparison;
          return result === 0 ? b.id.localeCompare(a.id) : result;
        });
      }

      // ── Pagination ───────────────────────────────────────────────────────
      const limitNum = parseInt(limit as string);
      const offsetNum = parseInt(offset as string);
      const paginatedProducts = products.slice(offsetNum, offsetNum + limitNum);

      const responseBody = { products: paginatedProducts, total: products.length, limit: limitNum, offset: offsetNum };

      // Cache the fully-computed response so the next identical request is instant
      cache.set(queryKey, responseBody, CacheTTL.PRODUCTS_LIST);

      res.json(responseBody);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // ─── Public: Get product by slug ─────────────────────────────────────────
  app.get("/api/products/slug/:slug", async (req, res) => {
    try {
      const cacheKey = CacheKeys.products.bySlug(req.params.slug);
      const cached = cache.get<any>(cacheKey);
      if (cached) return res.json(cached);

      const products = await storage.getAllProducts();
      const product = products.find(p => p.slug === req.params.slug);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      cache.set(cacheKey, product, CacheTTL.PRODUCT_DETAIL);
      res.json(product);
    } catch (error) {
      console.error("Error fetching product by slug:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // ─── Public: Get product by ID ───────────────────────────────────────────
  app.get("/api/products/:id", async (req, res) => {
    try {
      const cacheKey = CacheKeys.products.byId(req.params.id);
      const cached = cache.get<any>(cacheKey);
      if (cached) return res.json(cached);

      const product = await storage.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      cache.set(cacheKey, product, CacheTTL.PRODUCT_DETAIL);
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // ─── Admin: Create product ───────────────────────────────────────────────
  app.post("/api/products", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUserById(req.user.uid);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const productData = CreateProductSchema.parse(req.body);
      const productId = await storage.createProduct(productData);
      const product = await storage.getProductById(productId);

      // Invalidate product-list cache so the new item appears immediately
      cache.invalidateByPrefix("products");

      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // ─── Admin: Update product ───────────────────────────────────────────────
  app.put("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUserById(req.user.uid);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const productData = CreateProductSchema.partial().parse(req.body);
      await storage.updateProduct(req.params.id, productData);
      const product = await storage.getProductById(req.params.id);

      // Invalidate stale entries for this product and all list views
      cache.invalidateByPrefix("products");

      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  // ─── Admin: Delete product ───────────────────────────────────────────────
  app.delete("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUserById(req.user.uid);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteProduct(req.params.id);

      // Invalidate all product-related cache entries
      cache.invalidateByPrefix("products");

      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });
}