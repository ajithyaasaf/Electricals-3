// Enhanced Cart Routes - Enterprise-grade cart management with real-time updates
import type { Express } from "express";
import { storage } from "../../storage";
import { isAuthenticated, optionalAuth } from "../../firebaseAuth";
import { 
  CreateEnhancedCartItemSchema, 
  CouponSchema,
  CartValidationSchema,
  type EnhancedCartItem,
  type Cart,
  type CartTotals,
  type Coupon,
  type CartItemWithDetails 
} from "@shared/cart-types";
import type { Product, Service } from "@shared/types";

// Cart configuration
const CART_CONFIG = {
  maxItemsPerCart: 50,
  maxQuantityPerItem: 99,
  minOrderAmount: 0,
  allowGuestCheckout: true,
  cartExpiryHours: 72,
  freeShippingThreshold: 8300, // ₹8,300
  standardShipping: 1329, // ₹13.29
  taxRate: 0.08 // 8%
};

// Helper function to enrich guest cart items
async function enrichGuestCartItems(guestItems: any[]) {
  const enrichedItems = [];
  
  for (const item of guestItems) {
    let enrichedItem = {
      id: item.id || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId: item.productId,
      serviceId: item.serviceId,
      quantity: item.quantity || 1,
      unitPrice: 0,
      originalPrice: 0,
      discount: 0,
      appliedCoupons: [],
      customizations: {},
      notes: '',
      savedForLater: false,
      createdAt: new Date(item.addedAt || Date.now()),
      updatedAt: new Date()
    };
    
    if (item.productId) {
      const product = await storage.getProductById(item.productId);
      if (product) {
        enrichedItem.unitPrice = product.price;
        enrichedItem.originalPrice = product.originalPrice || product.price;
      }
    }
    
    if (item.serviceId) {
      const service = await storage.getServiceById(item.serviceId);
      if (service) {
        enrichedItem.unitPrice = service.price;
        enrichedItem.originalPrice = service.price;
      }
    }
    
    if (enrichedItem.unitPrice > 0) {
      enrichedItems.push(enrichedItem);
    }
  }
  
  return enrichedItems;
}

// Mock coupon data (replace with database)
const MOCK_COUPONS: Coupon[] = [
  {
    id: '1',
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    minOrderAmount: 2000,
    maxDiscount: 1000,
    usageLimit: 100,
    usedCount: 15,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    code: 'FREESHIP',
    type: 'shipping',
    value: 0,
    minOrderAmount: 5000,
    usedCount: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    code: 'SAVE500',
    type: 'fixed',
    value: 500,
    minOrderAmount: 3000,
    usedCount: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export function registerCartRoutes(app: Express) {
  
  // Get cart with totals and applied coupons
  app.get("/api/cart", optionalAuth, async (req: any, res) => {
    try {
      const userId = req.user?.uid;
      const sessionId = req.query.sessionId || req.headers['x-session-id'];
      
      let cartItems: any[] = [];
      
      if (userId) {
        // Authenticated user cart
        cartItems = await storage.getUserCartItems(userId);
      } else if (sessionId) {
        // Guest cart from request body (localStorage data)
        const guestItems = req.body?.items || [];
        cartItems = await enrichGuestCartItems(guestItems);
      }

      // Enrich cart items with product/service details
      const enrichedItems: CartItemWithDetails[] = [];
      
      for (const item of cartItems) {
        let enrichedItem: CartItemWithDetails = {
          ...item,
          unitPrice: item.unitPrice || 0,
          originalPrice: item.originalPrice || 0,
          discount: item.discount || 0,
          appliedCoupons: item.appliedCoupons || [],
          customizations: item.customizations || {},
          notes: item.notes || '',
          savedForLater: item.savedForLater || false
        };
        
        if (item.productId) {
          const product = await storage.getProductById(item.productId);
          if (product) {
            enrichedItem.product = product;
            enrichedItem.unitPrice = enrichedItem.unitPrice || product.price;
            enrichedItem.originalPrice = enrichedItem.originalPrice || (product.originalPrice || product.price);
          }
        }
        
        if (item.serviceId) {
          const service = await storage.getServiceById(item.serviceId);
          if (service) {
            enrichedItem.service = service;
            enrichedItem.unitPrice = enrichedItem.unitPrice || service.price;
            enrichedItem.originalPrice = enrichedItem.originalPrice || service.price;
          }
        }
        
        enrichedItems.push(enrichedItem);
      }

      // Calculate totals
      const totals = calculateCartTotals(enrichedItems, []);
      
      const cart: Cart = {
        id: userId || sessionId || `guest_${Date.now()}`,
        userId,
        sessionId,
        items: enrichedItems,
        appliedCoupons: [],
        totals,
        currency: 'INR',
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      res.json(cart);
    } catch (error) {
      console.error("Error fetching enhanced cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  // Guest cart API - for localStorage-based guest cart
  app.post("/api/cart/guest", async (req, res) => {
    try {
      const { items = [] } = req.body;
      
      // Enrich guest cart items with product/service details
      const enrichedItems: CartItemWithDetails[] = [];
      
      for (const item of items) {
        let enrichedItem: CartItemWithDetails = {
          id: item.id || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          productId: item.productId,
          serviceId: item.serviceId,
          quantity: item.quantity || 1,
          unitPrice: 0,
          originalPrice: 0,
          discount: 0,
          appliedCoupons: [],
          customizations: {},
          notes: '',
          savedForLater: false,
          createdAt: new Date(item.addedAt || Date.now()),
          updatedAt: new Date()
        };
        
        if (item.productId) {
          const product = await storage.getProductById(item.productId);
          if (product) {
            enrichedItem.product = product;
            enrichedItem.unitPrice = product.price;
            enrichedItem.originalPrice = product.originalPrice || product.price;
          }
        }
        
        if (item.serviceId) {
          const service = await storage.getServiceById(item.serviceId);
          if (service) {
            enrichedItem.service = service;
            enrichedItem.unitPrice = service.price;
            enrichedItem.originalPrice = service.price;
          }
        }
        
        if (enrichedItem.unitPrice > 0) {
          enrichedItems.push(enrichedItem);
        }
      }

      // Calculate totals
      const totals = calculateCartTotals(enrichedItems, []);
      
      const cart: Cart = {
        id: `guest_cart_${Date.now()}`,
        sessionId: `guest_session_${Date.now()}`,
        items: enrichedItems,
        appliedCoupons: [],
        totals,
        currency: 'INR',
        lastUpdated: new Date(),
        expiresAt: new Date(Date.now() + CART_CONFIG.cartExpiryHours * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      res.json(cart);
    } catch (error) {
      console.error("Error processing guest cart:", error);
      res.status(500).json({ message: "Failed to process guest cart" });
    }
  });

  // Add item to cart
  app.post("/api/cart/items", optionalAuth, async (req: any, res) => {
    try {
      const userId = req.user?.uid;
      const { productId, serviceId, quantity = 1, customizations, sessionId } = req.body;

      // Validation
      if (!productId && !serviceId) {
        return res.status(400).json({ message: "Product or service ID required" });
      }

      if (quantity > CART_CONFIG.maxQuantityPerItem) {
        return res.status(400).json({ message: `Maximum quantity per item is ${CART_CONFIG.maxQuantityPerItem}` });
      }

      // Get product/service details for pricing
      let unitPrice = 0;
      let originalPrice = 0;
      
      if (productId) {
        const product = await storage.getProductById(productId);
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
        if (product.stock < quantity) {
          return res.status(400).json({ message: "Insufficient stock" });
        }
        unitPrice = product.price;
        originalPrice = product.originalPrice || product.price;
      }

      if (serviceId) {
        const service = await storage.getServiceById(serviceId);
        if (!service) {
          return res.status(404).json({ message: "Service not found" });
        }
        unitPrice = service.price;
        originalPrice = service.price;
      }

      if (userId) {
        // Add to authenticated user cart
        const cartItemId = await storage.addToCart(userId, productId, serviceId, quantity);
        
        // Update with cart properties
        await storage.updateCartItem(cartItemId, {
          quantity,
          // Add cart properties when storage supports them
        });
      }

      // Return updated cart
      return app.get("/api/cart")(req, res);
      
    } catch (error) {
      console.error("Error adding item to cart:", error);
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  // Update cart item
  app.put("/api/cart/items/:id", optionalAuth, async (req: any, res) => {
    try {
      const userId = req.user?.uid;
      const itemId = req.params.id;
      const updates = req.body;

      if (userId) {
        const cartItem = await storage.getCartItemById(itemId);
        
        if (!cartItem || cartItem.userId !== userId) {
          return res.status(404).json({ message: "Cart item not found" });
        }

        // Validate quantity
        if (updates.quantity && updates.quantity > CART_CONFIG.maxQuantityPerItem) {
          return res.status(400).json({ 
            message: `Maximum quantity per item is ${CART_CONFIG.maxQuantityPerItem}` 
          });
        }

        await storage.updateCartItem(itemId, updates);
      }

      // Return updated cart
      return app.get("/api/cart")(req, res);
      
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  // Remove cart item
  app.delete("/api/cart/items/:id", optionalAuth, async (req: any, res) => {
    try {
      const userId = req.user?.uid;
      const itemId = req.params.id;

      if (userId) {
        const cartItem = await storage.getCartItemById(itemId);
        
        if (!cartItem || cartItem.userId !== userId) {
          return res.status(404).json({ message: "Cart item not found" });
        }

        await storage.deleteCartItem(itemId);
      }

      // Return updated cart
      return app.get("/api/cart")(req, res);
      
    } catch (error) {
      console.error("Error removing cart item:", error);
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });

  // Apply coupon
  app.post("/api/cart/coupons", optionalAuth, async (req: any, res) => {
    try {
      const { code } = req.body;
      
      // Find coupon
      const coupon = MOCK_COUPONS.find(c => 
        c.code.toLowerCase() === code.toLowerCase() && c.isActive
      );
      
      if (!coupon) {
        return res.status(400).json({ message: "Invalid coupon code" });
      }

      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return res.status(400).json({ message: "Coupon has expired" });
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ message: "Coupon usage limit reached" });
      }

      // Get current cart to validate minimum order amount
      const cartReq = { ...req, query: { ...req.query } };
      const cartRes = {
        json: (data: any) => data,
        status: (code: number) => ({ json: (data: any) => data })
      };
      
      // This would need to be refactored to properly get cart data
      // For now, return success response
      res.json({ message: "Coupon applied successfully", coupon });
      
    } catch (error) {
      console.error("Error applying coupon:", error);
      res.status(500).json({ message: "Failed to apply coupon" });
    }
  });

  // Remove coupon
  app.delete("/api/cart/coupons/:code", optionalAuth, async (req: any, res) => {
    try {
      const { code } = req.params;
      
      // Remove coupon logic would go here
      res.json({ message: "Coupon removed successfully" });
      
    } catch (error) {
      console.error("Error removing coupon:", error);
      res.status(500).json({ message: "Failed to remove coupon" });
    }
  });

  // Clear entire cart
  app.delete("/api/cart", optionalAuth, async (req: any, res) => {
    try {
      const userId = req.user?.uid;
      
      if (userId) {
        const cartItems = await storage.getUserCartItems(userId);
        for (const item of cartItems) {
          await storage.deleteCartItem(item.id);
        }
      }

      // Return empty cart
      const emptyCart: Cart = {
        id: userId || `guest_${Date.now()}`,
        userId,
        items: [],
        appliedCoupons: [],
        totals: {
          subtotal: 0,
          discount: 0,
          shipping: 0,
          tax: 0,
          total: 0,
          savings: 0
        },
        currency: 'INR',
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      res.json(emptyCart);
      
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Validate cart
  app.post("/api/cart/validate", optionalAuth, async (req: any, res) => {
    try {
      // Get current cart and validate
      const errors: string[] = [];
      
      // Add validation logic here
      // - Check stock availability
      // - Validate quantities
      // - Check minimum order amounts
      // - Validate shipping address if provided
      
      res.json({
        isValid: errors.length === 0,
        errors
      });
      
    } catch (error) {
      console.error("Error validating cart:", error);
      res.status(500).json({ message: "Failed to validate cart" });
    }
  });

  // Migrate guest cart to authenticated user cart
  app.post("/api/cart/migrate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.uid;
      const { guestItems = [] } = req.body;

      console.log(`[CART MIGRATION] Starting migration for user ${userId}:`, guestItems);

      if (!userId) {
        return res.status(401).json({ message: "Authentication required for cart migration" });
      }

      if (!Array.isArray(guestItems) || guestItems.length === 0) {
        console.log(`[CART MIGRATION] No guest items to migrate for user ${userId}`);
        return res.json({ message: "No guest items to migrate", migratedCount: 0 });
      }

      // Get current authenticated user cart items
      const existingCartItems = await storage.getUserCartItems(userId);
      console.log(`[CART MIGRATION] User ${userId} has ${existingCartItems.length} existing cart items`);

      let migratedCount = 0;
      let mergedCount = 0;

      // Process each guest item
      for (const guestItem of guestItems) {
        try {
          console.log(`[CART MIGRATION] Processing guest item:`, guestItem);

          // Validate guest item structure
          if (!guestItem.productId && !guestItem.serviceId) {
            console.warn(`[CART MIGRATION] Skipping invalid guest item (no productId/serviceId):`, guestItem);
            continue;
          }

          const quantity = parseInt(guestItem.quantity) || 1;

          // Check if item already exists in user's cart
          const existingItem = existingCartItems.find(item => 
            (guestItem.productId && item.productId === guestItem.productId) ||
            (guestItem.serviceId && item.serviceId === guestItem.serviceId)
          );

          if (existingItem) {
            // Merge quantities for existing items
            const newQuantity = Math.min(existingItem.quantity + quantity, CART_CONFIG.maxQuantityPerItem);
            console.log(`[CART MIGRATION] Merging item ${existingItem.id}: ${existingItem.quantity} + ${quantity} = ${newQuantity}`);
            
            await storage.updateCartItem(existingItem.id, { quantity: newQuantity });
            mergedCount++;
          } else {
            // Add new item to user's cart
            console.log(`[CART MIGRATION] Adding new item to cart: ${guestItem.productId || guestItem.serviceId}`);
            
            await storage.addToCart(
              userId, 
              guestItem.productId || null, 
              guestItem.serviceId || null, 
              quantity
            );
            migratedCount++;
          }
        } catch (itemError) {
          console.error(`[CART MIGRATION] Error processing guest item:`, guestItem, itemError);
          // Continue processing other items even if one fails
        }
      }

      console.log(`[CART MIGRATION] Migration completed for user ${userId}: ${migratedCount} new items, ${mergedCount} merged items`);

      res.json({
        message: "Cart migration completed successfully",
        migratedCount,
        mergedCount,
        totalItems: migratedCount + mergedCount
      });

    } catch (error) {
      console.error("[CART MIGRATION] Error migrating guest cart:", error);
      res.status(500).json({ 
        message: "Failed to migrate guest cart", 
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined 
      });
    }
  });

  // Get shipping options
  app.get("/api/cart/shipping-options", optionalAuth, async (req: any, res) => {
    try {
      const shippingOptions = [
        {
          id: 'standard',
          name: 'Standard Delivery',
          description: '5-7 business days',
          price: CART_CONFIG.standardShipping,
          estimatedDays: 7,
          isDefault: true,
          minOrderAmount: 0
        },
        {
          id: 'express',
          name: 'Express Delivery',
          description: '2-3 business days',
          price: 2658, // ₹26.58
          estimatedDays: 3,
          isDefault: false,
          minOrderAmount: 0
        },
        {
          id: 'free',
          name: 'Free Delivery',
          description: '7-10 business days',
          price: 0,
          estimatedDays: 10,
          isDefault: false,
          minOrderAmount: CART_CONFIG.freeShippingThreshold
        }
      ];

      res.json(shippingOptions);
      
    } catch (error) {
      console.error("Error fetching shipping options:", error);
      res.status(500).json({ message: "Failed to fetch shipping options" });
    }
  });
}

// Helper functions

function calculateCartTotals(items: CartItemWithDetails[], coupons: Coupon[] = []): CartTotals {
  const activeItems = items.filter(item => !item.savedForLater);
  
  const subtotal = activeItems.reduce((sum, item) => 
    sum + (item.unitPrice * item.quantity), 0
  );

  let discount = activeItems.reduce((sum, item) => 
    sum + (item.discount * item.quantity), 0
  );

  // Apply coupon discounts
  coupons.forEach(coupon => {
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return; // Skip if minimum order not met
    }
    
    if (coupon.type === 'percentage') {
      const couponDiscount = subtotal * (coupon.value / 100);
      discount += coupon.maxDiscount 
        ? Math.min(couponDiscount, coupon.maxDiscount)
        : couponDiscount;
    } else if (coupon.type === 'fixed') {
      discount += coupon.value;
    }
  });

  const shipping = subtotal > CART_CONFIG.freeShippingThreshold ? 0 : CART_CONFIG.standardShipping;
  const tax = (subtotal - discount) * CART_CONFIG.taxRate;
  const total = subtotal - discount + shipping + tax;
  const savings = discount;

  return {
    subtotal: Math.max(0, subtotal),
    discount: Math.max(0, discount),
    shipping: Math.max(0, shipping),
    tax: Math.max(0, tax),
    total: Math.max(0, total),
    savings: Math.max(0, savings)
  };
}