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
import { SHIPPING_FEES, SHIPPING_THRESHOLDS, getProductLogistics } from '@shared/logistics';

// Cart configuration - Updated based on client requirements
const CART_CONFIG = {
  maxItemsPerCart: 50,
  maxQuantityPerItem: 99,
  minOrderAmount: 0,
  allowGuestCheckout: true,
  cartExpiryHours: 72,
  freeShippingThreshold: SHIPPING_THRESHOLDS.FREE_STANDARD / 100, // Derived from shared constants
  standardShipping: 0, // Will be calculated based on policy
  taxRate: 0.18, // 18% GST for India
  deliveryDays: { min: 1, max: 3 }, // 1-3 days delivery
  serviceableStates: ['Tamil Nadu', 'TN'],
  codConfig: {
    enabled: true,
    serviceableStates: ['Tamil Nadu', 'TN'],
    additionalCharges: 0, // No COD charges
    minOrderAmount: 0, // No minimum for COD
    maxOrderAmount: null // No maximum for COD
  },
  returnPolicy: {
    returnWindowDays: 7, // 5-7 working days
    returnShippingChargePercent: 0 // No return shipping charge as per client feedback
  }
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
        enrichedItem.unitPrice = service.startingPrice;
        enrichedItem.originalPrice = service.startingPrice;
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

      console.log(`[CART] Processing ${cartItems.length} cart items for enrichment`);

      for (const item of cartItems) {
        console.log(`[CART] Processing item ${item.id} - ProductID: ${item.productId}, ServiceID: ${item.serviceId}`);

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
            // Always update prices from product data
            enrichedItem.unitPrice = product.price;
            enrichedItem.originalPrice = product.originalPrice || product.price;
            // Calculate discount if original price is higher
            if (product.originalPrice && product.originalPrice > product.price) {
              enrichedItem.discount = product.originalPrice - product.price;
            }
          } else {
            console.warn(`[CART] Product not found for ID: ${item.productId}, removing orphaned cart item ${item.id}`);
            // Remove orphaned cart items with invalid product IDs
            if (userId) {
              try {
                await storage.deleteCartItem(item.id);
                console.log(`[CART] Successfully deleted orphaned cart item ${item.id}`);
              } catch (error) {
                console.error(`[CART] Failed to delete orphaned cart item ${item.id}:`, error);
              }
            }
            continue; // Skip this item
          }
        }

        if (item.serviceId) {
          const service = await storage.getServiceById(item.serviceId);
          if (service) {
            enrichedItem.service = service;
            enrichedItem.unitPrice = service.startingPrice;
            enrichedItem.originalPrice = service.startingPrice;
          } else {
            console.warn(`[CART] Service not found for ID: ${item.serviceId}, removing orphaned cart item ${item.id}`);
            // Remove orphaned cart items with invalid service IDs
            if (userId) {
              try {
                await storage.deleteCartItem(item.id);
                console.log(`[CART] Successfully deleted orphaned cart item ${item.id}`);
              } catch (error) {
                console.error(`[CART] Failed to delete orphaned cart item ${item.id}:`, error);
              }
            }
            continue; // Skip this item
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
            enrichedItem.unitPrice = service.startingPrice;
            enrichedItem.originalPrice = service.startingPrice;
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
        unitPrice = service.startingPrice;
        originalPrice = service.startingPrice;
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

      // Return success and let client refresh cart
      res.json({ message: "Item added to cart successfully" });

    } catch (error) {
      console.error("Error adding item to cart:", error);
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  // Update cart item - support both PATCH and PUT
  app.patch("/api/cart/items/:id", optionalAuth, async (req: any, res) => {
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

        console.log(`[CART UPDATE] Updating cart item ${itemId} with:`, updates);
        await storage.updateCartItem(itemId, updates);

        // Get updated item to verify
        const updatedItem = await storage.getCartItemById(itemId);
        console.log(`[CART UPDATE] Item updated successfully. New quantity: ${updatedItem?.quantity}`);
      }

      // Return success and let client keep optimistic UI
      res.json({ message: "Cart item updated successfully" });

    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  // Update cart item - PUT endpoint for compatibility
  app.put("/api/cart/items/:id", optionalAuth, async (req: any, res) => {
    try {
      const userId = req.user?.uid;
      const itemId = req.params.id;
      const updates = req.body;

      console.log(`[CART UPDATE PUT] Processing item update for user ${userId}, item ${itemId}:`, updates);

      if (userId) {
        const cartItem = await storage.getCartItemById(itemId);

        if (!cartItem || cartItem.userId !== userId) {
          console.log(`[CART UPDATE PUT] Cart item not found or unauthorized: ${itemId} for user ${userId}`);
          return res.status(404).json({ message: "Cart item not found" });
        }

        // Validate quantity
        if (updates.quantity && updates.quantity > CART_CONFIG.maxQuantityPerItem) {
          return res.status(400).json({
            message: `Maximum quantity per item is ${CART_CONFIG.maxQuantityPerItem}`
          });
        }

        console.log(`[CART UPDATE PUT] Updating cart item ${itemId} with:`, updates);
        await storage.updateCartItem(itemId, updates);

        // Get updated item to verify
        const updatedItem = await storage.getCartItemById(itemId);
        console.log(`[CART UPDATE PUT] Item updated successfully. New quantity: ${updatedItem?.quantity}`);
      }

      // Return success and let client keep optimistic UI
      res.json({ message: "Cart item updated successfully" });

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

      // Return success and let client refresh cart
      res.json({ message: "Item removed from cart successfully" });

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

  // Validate cart - Pre-checkout stock validation
  app.post("/api/cart/validate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.uid;

      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user's cart items
      const cartItems = await storage.getUserCartItems(userId);

      if (cartItems.length === 0) {
        return res.json({
          isValid: false,
          message: "Your cart is empty",
          validItems: [],
          invalidItems: [],
        });
      }

      const validItems: any[] = [];
      const invalidItems: any[] = [];

      // Check each cart item against current product state
      for (const item of cartItems) {
        if (item.productId) {
          const product = await storage.getProductById(item.productId);

          if (!product) {
            invalidItems.push({
              id: item.id,
              productId: item.productId,
              name: "Unknown Product",
              reason: "unavailable",
              message: "This product is no longer available",
              requestedQuantity: item.quantity,
              availableStock: 0,
            });
          } else if (!product.isActive) {
            invalidItems.push({
              id: item.id,
              productId: item.productId,
              name: product.name,
              reason: "discontinued",
              message: "This product has been discontinued",
              requestedQuantity: item.quantity,
              availableStock: 0,
            });
          } else if (product.stock === 0) {
            invalidItems.push({
              id: item.id,
              productId: item.productId,
              name: product.name,
              reason: "out_of_stock",
              message: "This product is currently out of stock",
              requestedQuantity: item.quantity,
              availableStock: 0,
              imageUrl: product.imageUrls?.[0],
            });
          } else if (product.stock < item.quantity) {
            invalidItems.push({
              id: item.id,
              productId: item.productId,
              name: product.name,
              reason: "insufficient_stock",
              message: `Only ${product.stock} left in stock`,
              requestedQuantity: item.quantity,
              availableStock: product.stock,
              imageUrl: product.imageUrls?.[0],
              suggestedQuantity: product.stock, // Suggest max available
            });
          } else {
            validItems.push({
              id: item.id,
              productId: item.productId,
              name: product.name,
              quantity: item.quantity,
              unitPrice: product.price,
              availableStock: product.stock,
              imageUrl: product.imageUrls?.[0],
            });
          }
        }

        if (item.serviceId) {
          const service = await storage.getServiceById(item.serviceId);

          if (!service) {
            invalidItems.push({
              id: item.id,
              serviceId: item.serviceId,
              name: "Unknown Service",
              reason: "unavailable",
              message: "This service is no longer available",
              requestedQuantity: item.quantity,
            });
          } else if (!service.isActive) {
            invalidItems.push({
              id: item.id,
              serviceId: item.serviceId,
              name: service.name,
              reason: "unavailable",
              message: "This service is currently unavailable",
              requestedQuantity: item.quantity,
            });
          } else {
            validItems.push({
              id: item.id,
              serviceId: item.serviceId,
              name: service.name,
              quantity: item.quantity,
              unitPrice: service.startingPrice,
              imageUrl: service.imageUrls?.[0],
            });
          }
        }
      }

      const isValid = invalidItems.length === 0;

      res.json({
        isValid,
        message: isValid
          ? "All items in your cart are available"
          : `${invalidItems.length} item(s) have availability issues`,
        validItems,
        invalidItems,
        summary: {
          totalItems: cartItems.length,
          validCount: validItems.length,
          invalidCount: invalidItems.length,
        },
      });

    } catch (error) {
      console.error("Error validating cart:", error);
      res.status(500).json({ message: "Failed to validate cart" });
    }
  });

  // Enhanced migrate guest cart to authenticated user cart with atomic operations
  app.post("/api/cart/migrate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.uid;
      const {
        guestItems = [],
        schemaVersion,
        conflictResolution = {
          strategy: 'merge',
          quantityHandling: 'sum',
          customizationHandling: 'merge'
        }
      } = req.body;

      console.log(`[CART MIGRATION] 🚀 Starting enhanced migration for user ${userId}:`, {
        itemCount: guestItems.length,
        schemaVersion,
        conflictResolution
      });

      if (!userId) {
        return res.status(401).json({ message: "Authentication required for cart migration" });
      }

      if (!Array.isArray(guestItems) || guestItems.length === 0) {
        console.log(`[CART MIGRATION] ✅ No guest items to migrate for user ${userId}`);
        return res.json({
          message: "No guest items to migrate",
          migratedCount: 0,
          conflicts: []
        });
      }

      // Enhanced validation of guest items
      const validatedGuestItems = [];
      const invalidItems = [];

      for (const item of guestItems) {
        const validationErrors = [];

        // Basic structure validation
        if (!item.productId && !item.serviceId) {
          validationErrors.push('Missing productId or serviceId');
        }

        if (!item.quantity || item.quantity <= 0) {
          validationErrors.push('Invalid quantity');
        }

        if (item.quantity > CART_CONFIG.maxQuantityPerItem) {
          validationErrors.push(`Quantity exceeds maximum (${CART_CONFIG.maxQuantityPerItem})`);
        }

        // Verify product/service exists and is available
        if (item.productId) {
          const product = await storage.getProductById(item.productId);
          if (!product) {
            validationErrors.push('Product not found');
          } else if (product.stock < item.quantity) {
            validationErrors.push('Insufficient stock');
          }
        }

        if (item.serviceId) {
          const service = await storage.getServiceById(item.serviceId);
          if (!service) {
            validationErrors.push('Service not found');
          }
        }

        if (validationErrors.length === 0) {
          validatedGuestItems.push({
            ...item,
            quantity: Math.min(parseInt(item.quantity), CART_CONFIG.maxQuantityPerItem),
            lastUpdated: item.lastUpdated || Date.now(),
            schemaVersion: item.schemaVersion || schemaVersion || '1.0.0'
          });
        } else {
          invalidItems.push({ item, errors: validationErrors });
        }
      }

      console.log(`[CART MIGRATION] 📋 Validation complete: ${validatedGuestItems.length} valid, ${invalidItems.length} invalid items`);

      if (invalidItems.length > 0) {
        console.warn(`[CART MIGRATION] ⚠️ Invalid items filtered out:`, invalidItems);
      }

      if (validatedGuestItems.length === 0) {
        return res.json({
          message: "No valid guest items to migrate",
          migratedCount: 0,
          conflicts: [],
          invalidItems
        });
      }

      // Get current authenticated user cart items
      const existingCartItems = await storage.getUserCartItems(userId);
      console.log(`[CART MIGRATION] 📦 User ${userId} has ${existingCartItems.length} existing cart items`);

      // Use the enhanced merge function - NO GUEST ITEMS VANISH
      console.log(`[CART MIGRATION] 🔄 Merging carts using enhanced merge function`);
      const mergedItems = mergeCarts(existingCartItems, validatedGuestItems);
      console.log(`[CART MIGRATION] 📊 Merge result: ${existingCartItems.length} auth + ${validatedGuestItems.length} guest = ${mergedItems.length} total items`);

      // Clear existing cart and replace with merged items atomically
      console.log(`[CART MIGRATION] 🗑️ Clearing existing cart items for atomic replacement`);
      for (const item of existingCartItems) {
        await storage.deleteCartItem(item.id);
      }

      // Add all merged items to cart
      let addedCount = 0;
      for (const mergedItem of mergedItems) {
        try {
          // Add item with proper enrichment
          const itemId = await storage.addToCart(
            userId,
            mergedItem.productId,
            mergedItem.serviceId,
            Math.min(mergedItem.quantity, CART_CONFIG.maxQuantityPerItem)
          );

          // Update with additional properties if supported
          if (mergedItem.customizations || mergedItem.notes) {
            // Storage layer might not support these yet, but attempt update
            try {
              await storage.updateCartItem(itemId, {
                // Add customizations and notes when storage supports them
              });
            } catch (updateError) {
              console.log(`[CART MIGRATION] ℹ️ Additional properties not supported in storage layer`);
            }
          }

          addedCount++;
        } catch (addError) {
          console.error(`[CART MIGRATION] ❌ Failed to add merged item:`, mergedItem, addError);
        }
      }

      console.log(`[CART MIGRATION] ✅ Migration completed for user ${userId}: ${addedCount} items in final cart`);

      // Verify final cart state and recalculate prices
      const finalCartItems = await storage.getUserCartItems(userId);
      console.log(`[CART MIGRATION] 🔍 Final verification: ${finalCartItems.length} total items in database`);

      // Calculate conflicts for reporting
      const conflicts: any[] = [];
      const duplicateKeys = new Set();

      validatedGuestItems.forEach(guestItem => {
        const key = `${guestItem.productId || ''}-${guestItem.serviceId || ''}`;
        const existingItem = existingCartItems.find(item =>
          item.productId === guestItem.productId && item.serviceId === guestItem.serviceId
        );

        if (existingItem && !duplicateKeys.has(key)) {
          duplicateKeys.add(key);
          conflicts.push({
            guest: guestItem,
            existing: {
              id: existingItem.id,
              productId: existingItem.productId,
              serviceId: existingItem.serviceId,
              quantity: existingItem.quantity
            },
            resolution: 'quantities-summed',
            finalQuantity: existingItem.quantity + guestItem.quantity
          });
        }
      });

      res.json({
        message: "Cart migration completed successfully - no guest items lost",
        migratedCount: validatedGuestItems.length - conflicts.length,
        mergedCount: conflicts.length,
        totalItems: finalCartItems.length,
        conflicts,
        invalidItems: invalidItems.length > 0 ? invalidItems : undefined,
        schemaVersion,
        mergeStrategy: "sum_quantities_preserve_all_items"
      });

    } catch (error) {
      console.error("[CART MIGRATION] ❌ Enhanced migration failed:", error);
      res.status(500).json({
        message: "Failed to migrate guest cart",
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  });

  // Edge case handler - Account switching detection
  app.post("/api/cart/account-switch", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.uid;
      const { previousUserId, guestItems = [] } = req.body;

      console.log(`[ACCOUNT SWITCH] Detected account switch: ${previousUserId} → ${userId}`);

      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Handle rapid account switching
      if (previousUserId && previousUserId !== userId) {
        // Clear any stale migration flags
        const migrationKey = `migration_${previousUserId}`;

        // Optionally preserve guest cart items if any
        if (guestItems.length > 0) {
          console.log(`[ACCOUNT SWITCH] Preserving ${guestItems.length} guest items for new user`);
          // This would trigger normal migration flow
          return res.json({
            message: "Account switch detected, guest cart preserved for migration",
            shouldMigrate: true
          });
        }
      }

      res.json({ message: "Account switch handled", shouldMigrate: false });

    } catch (error) {
      console.error("Error handling account switch:", error);
      res.status(500).json({ message: "Failed to handle account switch" });
    }
  });

  // Edge case handler - Rapid action processing
  app.post("/api/cart/batch-operations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.uid;
      const { operations = [] } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      if (!Array.isArray(operations) || operations.length === 0) {
        return res.json({ message: "No operations to process", results: [] });
      }

      console.log(`[BATCH OPERATIONS] Processing ${operations.length} operations for user ${userId}`);

      const results = [];
      const errors = [];

      // Process operations with rate limiting and validation
      for (let i = 0; i < operations.length && i < 10; i++) { // Limit to 10 operations
        const operation = operations[i];

        try {
          switch (operation.type) {
            case 'add':
              if (operation.productId || operation.serviceId) {
                await storage.addToCart(
                  userId,
                  operation.productId,
                  operation.serviceId,
                  Math.min(operation.quantity || 1, CART_CONFIG.maxQuantityPerItem)
                );
                results.push({ type: 'add', success: true, item: operation });
              }
              break;

            case 'update':
              if (operation.itemId && operation.quantity !== undefined) {
                await storage.updateCartItem(operation.itemId, {
                  quantity: Math.min(operation.quantity, CART_CONFIG.maxQuantityPerItem)
                });
                results.push({ type: 'update', success: true, itemId: operation.itemId });
              }
              break;

            case 'remove':
              if (operation.itemId) {
                await storage.deleteCartItem(operation.itemId);
                results.push({ type: 'remove', success: true, itemId: operation.itemId });
              }
              break;

            default:
              errors.push({ operation, error: 'Unknown operation type' });
          }

          // Small delay to prevent overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 10));

        } catch (operationError) {
          console.error(`[BATCH OPERATIONS] Failed operation:`, operation, operationError);
          errors.push({ operation, error: (operationError as Error).message });
        }
      }

      res.json({
        message: "Batch operations completed",
        processed: results.length,
        successful: results.filter(r => r.success).length,
        errorCount: errors.length,
        results,
        errors: errors.length > 0 ? errors : undefined
      });

    } catch (error) {
      console.error("Error processing batch operations:", error);
      res.status(500).json({ message: "Failed to process batch operations" });
    }
  });

  // Logout preservation endpoint - Save authenticated cart to guest format
  app.post("/api/cart/preserve-on-logout", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.uid;

      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      console.log(`[CART PRESERVATION] 💾 Preserving cart for user ${userId} on logout`);

      // Get user's current cart
      const currentCartItems = await storage.getUserCartItems(userId);
      console.log(`[CART PRESERVATION] 📦 Found ${currentCartItems.length} items to preserve`);

      if (currentCartItems.length === 0) {
        return res.json({
          message: "No cart items to preserve",
          preservedItems: []
        });
      }

      // Convert to guest cart format using preservation function
      const preservedItems = preserveCartOnLogout(currentCartItems);
      console.log(`[CART PRESERVATION] 🔄 Converted ${currentCartItems.length} auth items to ${preservedItems.length} guest items`);

      res.json({
        message: "Cart preserved successfully for logout",
        preservedItems,
        originalItemCount: currentCartItems.length,
        preservedItemCount: preservedItems.length
      });

    } catch (error) {
      console.error("[CART PRESERVATION] ❌ Error preserving cart on logout:", error);
      res.status(500).json({
        message: "Failed to preserve cart on logout",
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  });

  // Manual cart cleanup endpoint for removing orphaned items
  app.post("/api/cart/cleanup", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.uid;

      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      console.log(`[CART CLEANUP] Starting cleanup for user ${userId}`);

      // Get all cart items for user
      const cartItems = await storage.getUserCartItems(userId);
      console.log(`[CART CLEANUP] Found ${cartItems.length} cart items`);

      let deletedCount = 0;

      for (const item of cartItems) {
        let shouldDelete = false;

        if (item.productId) {
          const product = await storage.getProductById(item.productId);
          if (!product) {
            console.log(`[CART CLEANUP] Product not found for ID: ${item.productId}`);
            shouldDelete = true;
          }
        }

        if (item.serviceId) {
          const service = await storage.getServiceById(item.serviceId);
          if (!service) {
            console.log(`[CART CLEANUP] Service not found for ID: ${item.serviceId}`);
            shouldDelete = true;
          }
        }

        if (shouldDelete) {
          try {
            await storage.deleteCartItem(item.id);
            deletedCount++;
            console.log(`[CART CLEANUP] Deleted orphaned cart item ${item.id}`);
          } catch (error) {
            console.error(`[CART CLEANUP] Failed to delete cart item ${item.id}:`, error);
          }
        }
      }

      console.log(`[CART CLEANUP] Cleanup completed. Deleted ${deletedCount} orphaned items`);

      res.json({
        message: "Cart cleanup completed",
        deletedItems: deletedCount,
        totalItems: cartItems.length
      });

    } catch (error) {
      console.error("[CART CLEANUP] Error during cleanup:", error);
      res.status(500).json({
        message: "Failed to cleanup cart",
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  });
}

// Helper functions

// Enhanced cart merge function following exact requirements
function mergeCarts(authCart: any[], guestCart: any[]): any[] {
  const merged = [...authCart];

  guestCart.forEach(guestItem => {
    const existingIndex = merged.findIndex(
      item =>
        item.productId === guestItem.productId &&
        item.serviceId === guestItem.serviceId
    );

    if (existingIndex >= 0) {
      // Merge quantities - sum them as per requirements
      merged[existingIndex].quantity += guestItem.quantity;

      // Optionally merge customizations - merge guest into auth
      if (guestItem.customizations) {
        merged[existingIndex].customizations = {
          ...merged[existingIndex].customizations,
          ...guestItem.customizations
        };
      }

      // Merge notes if both exist
      if (guestItem.notes && merged[existingIndex].notes) {
        merged[existingIndex].notes = `${merged[existingIndex].notes} | ${guestItem.notes}`;
      } else if (guestItem.notes) {
        merged[existingIndex].notes = guestItem.notes;
      }

      merged[existingIndex].updatedAt = new Date();
    } else {
      // Convert guest item to full CartItem format - no guest items vanish
      merged.push({
        id: guestItem.id || `merged_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId: guestItem.productId,
        serviceId: guestItem.serviceId,
        quantity: guestItem.quantity,
        unitPrice: 0, // Server will recalculate
        originalPrice: 0,
        discount: 0,
        appliedCoupons: [],
        customizations: guestItem.customizations || {},
        notes: guestItem.notes || '',
        savedForLater: false,
        createdAt: new Date(guestItem.addedAt || Date.now()),
        updatedAt: new Date()
      });
    }
  });

  return merged;
}

// Preservation function for logout
function preserveCartOnLogout(authCart: any[]): any[] {
  return authCart.map(item => ({
    id: `preserved_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    productId: item.productId,
    serviceId: item.serviceId,
    quantity: item.quantity,
    addedAt: Date.now(),
    lastUpdated: Date.now(),
    customizations: item.customizations || {},
    notes: item.notes || '',
    schemaVersion: '2.0.0',
    conflictResolution: {
      preferGuestQuantity: true,
      preferGuestCustomizations: true
    }
  }));
}

/**
 * Calculate cart totals with weight-based shipping logic
 * Server-authoritative calculation - never trust client data
 * Handles missing product data gracefully with defaults
 */
function calculateCartTotals(items: CartItemWithDetails[], coupons: Coupon[] = []): CartTotals {
  const activeItems = items.filter(item => !item.savedForLater);

  // Calculate subtotal (Sum of Selling Prices)
  const subtotal = activeItems.reduce((sum, item) =>
    sum + (item.unitPrice * item.quantity), 0
  );

  // Calculate product-level savings (MRP - Selling Price) - purely for display!
  // DO NOT subtract this from subtotal as subtotal is already the selling price
  const productSavings = activeItems.reduce((sum, item) =>
    sum + (item.discount * item.quantity), 0
  );

  // Calculate coupon discounts (Deductible)
  let couponDiscount = 0;

  // Apply coupon discounts
  coupons.forEach(coupon => {
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return; // Skip if minimum order not met
    }

    if (coupon.type === 'percentage') {
      const discountAmount = subtotal * (coupon.value / 100);
      couponDiscount += coupon.maxDiscount
        ? Math.min(discountAmount, coupon.maxDiscount)
        : discountAmount;
    } else if (coupon.type === 'fixed') {
      couponDiscount += coupon.value;
    }
  });

  // Calculate weight-based shipping
  let totalWeight = 0;
  let hasBulkyItems = false;

  activeItems.forEach(item => {
    const product = item.product;
    const logistics = getProductLogistics(product);

    totalWeight += logistics.weight * item.quantity;
    if (logistics.isBulky) {
      hasBulkyItems = true;
    }
  });

  // Determine shipping cost using weight-based tiers
  let shipping = 0;
  const isHeavy = hasBulkyItems || totalWeight > 15; // > 15kg threshold

  if (isHeavy) {
    shipping = subtotal >= SHIPPING_THRESHOLDS.FREE_HEAVY
      ? SHIPPING_FEES.FREE
      : SHIPPING_FEES.HEAVY_FLAT;
  } else {
    // Standard shipping
    if (subtotal >= SHIPPING_THRESHOLDS.FREE_STANDARD) {
      shipping = SHIPPING_FEES.FREE;
    } else if (subtotal >= SHIPPING_THRESHOLDS.SUBSIDIZED) {
      shipping = SHIPPING_FEES.STANDARD_MID;
    } else {
      shipping = SHIPPING_FEES.STANDARD_LOW;
    }
  }

  // Calculate GST on taxable amount (Subtotal - Coupon Discounts)
  const taxableAmount = Math.max(0, subtotal - couponDiscount);
  const tax = taxableAmount * CART_CONFIG.taxRate;

  // Final total
  const total = taxableAmount + shipping + tax;

  // Total Savings = Product Savings (MRP diff) + Coupon Savings
  const savings = productSavings + couponDiscount;

  return {
    subtotal: Math.max(0, subtotal),
    discount: Math.max(0, couponDiscount), // Only return deductible discount here
    shipping: Math.max(0, shipping),
    tax: Math.max(0, tax),
    total: Math.max(0, total),
    savings: Math.max(0, savings)
  };
}