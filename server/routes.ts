import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupFirebaseAuth, isAuthenticated } from "./firebaseAuth";
import { registerSeedRoute } from "./routes/seedRoute";
import { 
  CreateProductSchema, 
  CreateServiceSchema, 
  CreateCategorySchema,
  CreateCartItemSchema,
  CreateOrderSchema,
  CreateOrderItemSchema,
  CreateServiceBookingSchema,
  CreateReviewSchema,
  CreateWishlistItemSchema
} from "@shared/types";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Firebase Auth middleware
  await setupFirebaseAuth(app);

  // Register seeding routes
  registerSeedRoute(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const user = await storage.getUserById(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.getCategoryById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

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
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

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

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { categoryId, search, featured, limit = 20, offset = 0 } = req.query;
      
      let products;
      if (featured === "true") {
        products = await storage.getFeaturedProducts();
      } else if (categoryId) {
        products = await storage.getProductsByCategory(categoryId as string);
      } else if (search) {
        products = await storage.searchProducts(search as string);
      } else {
        products = await storage.getAllProducts();
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

  // Service routes
  app.get("/api/services", async (req, res) => {
    try {
      const { categoryId } = req.query;
      
      let services;
      if (categoryId) {
        services = await storage.getServicesByCategory(categoryId as string);
      } else {
        services = await storage.getAllServices();
      }

      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get("/api/services/:id", async (req, res) => {
    try {
      const service = await storage.getServiceById(req.params.id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      console.error("Error fetching service:", error);
      res.status(500).json({ message: "Failed to fetch service" });
    }
  });

  app.post("/api/services", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const user = await storage.getUserById(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const serviceData = CreateServiceSchema.parse(req.body);
      const serviceId = await storage.createService(serviceData);
      const service = await storage.getServiceById(serviceId);
      res.json(service);
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  // Cart routes
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

  // Authenticated cart endpoint for logged-in users
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

  // Order routes
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

  app.get("/api/orders/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const user = await storage.getUserById(userId);
      const order = await storage.getOrderById(req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (!user?.isAdmin && order.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const orderItems = await storage.getOrderItems(order.id);
      res.json({ ...order, items: orderItems });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const orderData = { ...CreateOrderSchema.parse(req.body), userId };
      
      const orderId = await storage.createOrder(orderData);
      const order = await storage.getOrderById(orderId);
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Review routes
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

  // Wishlist routes
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

  // Service Booking routes
  app.get("/api/bookings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const user = await storage.getUserById(userId);
      
      let bookings;
      if (user?.isAdmin) {
        bookings = await storage.getAllServiceBookings();
      } else {
        bookings = await storage.getUserServiceBookings(userId);
      }
      
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post("/api/bookings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const bookingData = { ...CreateServiceBookingSchema.parse(req.body), userId };
      
      const bookingId = await storage.createServiceBooking(bookingData);
      const booking = await storage.getServiceBookingById(bookingId);
      res.json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}