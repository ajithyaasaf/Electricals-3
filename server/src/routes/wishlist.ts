// Enhanced Wishlist Routes - Enterprise-grade wishlist management with advanced features
import type { Express } from "express";
import { storage } from "../../storage";
import { isAuthenticated, optionalAuth } from "../../firebaseAuth";
import { CreateEnhancedWishlistItemSchema, WishlistValidationSchema } from "@shared/wishlist-types";
import type { 
  EnhancedWishlistItem, 
  WishlistItemWithDetails, 
  WishlistOperationResult,
  GuestWishlistItem,
  WishlistAnalytics 
} from "@shared/wishlist-types";
import type { Product, Service } from "@shared/types";

// Wishlist configuration
const WISHLIST_CONFIG = {
  maxItemsPerWishlist: 500,
  maxWishlistsPerUser: 10,
  maxGuestItems: 50,
  guestExpiryHours: 168, // 7 days
  maxSharesPerWishlist: 5,
  shareExpiryDays: 30,
  priceTrackingDays: 90,
};

// Helper function to enrich wishlist items with product/service details
async function enrichWishlistItems(items: any[]): Promise<WishlistItemWithDetails[]> {
  const enrichedItems: WishlistItemWithDetails[] = [];
  
  for (const item of items) {
    let enrichedItem: WishlistItemWithDetails = { 
      ...item,
      priority: item.priority || 'medium',
      tags: item.tags || [],
      addedFrom: item.addedFrom || 'other',
      isPublic: item.isPublic || false,
      notes: item.notes || undefined,
      reminderDate: item.reminderDate || undefined,
      priceAlert: item.priceAlert || undefined,
      sessionId: item.sessionId || undefined,
    };
    
    if (item.productId) {
      const product = await storage.getProductById(item.productId);
      if (product) {
        enrichedItem.product = product;
        enrichedItem.currentPrice = product.price;
        enrichedItem.originalPrice = product.originalPrice || product.price;
        enrichedItem.isOnSale = product.originalPrice ? product.price < product.originalPrice : false;
        enrichedItem.stockStatus = product.stock > 0 ? 'in_stock' : 'out_of_stock';
        enrichedItem.priceDifference = enrichedItem.originalPrice - enrichedItem.currentPrice;
      }
    }
    
    if (item.serviceId) {
      const service = await storage.getServiceById(item.serviceId);
      if (service) {
        enrichedItem.service = service;
        enrichedItem.currentPrice = service.price;
        enrichedItem.originalPrice = service.price;
        enrichedItem.isOnSale = false;
        enrichedItem.stockStatus = 'in_stock'; // Services are always available
        enrichedItem.priceDifference = 0;
      }
    }
    
    if (enrichedItem.product || enrichedItem.service) {
      enrichedItems.push(enrichedItem);
    }
  }
  
  return enrichedItems;
}

// Helper function to enrich guest wishlist items
async function enrichGuestWishlistItems(guestItems: GuestWishlistItem[]): Promise<WishlistItemWithDetails[]> {
  const enrichedItems: WishlistItemWithDetails[] = [];
  
  for (const item of guestItems) {
    let enrichedItem: WishlistItemWithDetails = {
      id: item.id,
      productId: item.productId,
      serviceId: item.serviceId,
      notes: item.notes,
      priority: item.priority,
      tags: item.tags,
      addedFrom: item.addedFrom,
      isPublic: false,
      createdAt: new Date(item.addedAt),
      updatedAt: new Date(item.lastUpdated),
    };
    
    if (item.productId) {
      const product = await storage.getProductById(item.productId);
      if (product) {
        enrichedItem.product = product;
        enrichedItem.currentPrice = product.price;
        enrichedItem.originalPrice = product.originalPrice || product.price;
        enrichedItem.isOnSale = product.originalPrice ? product.price < product.originalPrice : false;
        enrichedItem.stockStatus = product.stock > 0 ? 'in_stock' : 'out_of_stock';
        enrichedItem.priceDifference = enrichedItem.originalPrice - enrichedItem.currentPrice;
      }
    }
    
    if (item.serviceId) {
      const service = await storage.getServiceById(item.serviceId);
      if (service) {
        enrichedItem.service = service;
        enrichedItem.currentPrice = service.price;
        enrichedItem.originalPrice = service.price;
        enrichedItem.isOnSale = false;
        enrichedItem.stockStatus = 'in_stock';
        enrichedItem.priceDifference = 0;
      }
    }
    
    if (enrichedItem.product || enrichedItem.service) {
      enrichedItems.push(enrichedItem);
    }
  }
  
  return enrichedItems;
}

// Generate wishlist analytics
function generateWishlistAnalytics(items: WishlistItemWithDetails[]): WishlistAnalytics {
  const totalItems = items.length;
  const totalValue = items.reduce((sum, item) => sum + (item.currentPrice || 0), 0);
  const averageItemPrice = totalItems > 0 ? totalValue / totalItems : 0;
  
  const categoryCounts = new Map<string, { count: number; value: number }>();
  let priceAlertsActive = 0;
  let priceAlertsTriggered = 0;
  
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  let addedThisWeek = 0;
  let addedThisMonth = 0;
  let oldestItem = now;
  let newestItem = new Date(0);
  
  items.forEach(item => {
    // Category analysis
    const categoryName = item.product?.categoryId || item.service?.categoryId || 'Uncategorized';
    const current = categoryCounts.get(categoryName) || { count: 0, value: 0 };
    categoryCounts.set(categoryName, {
      count: current.count + 1,
      value: current.value + (item.currentPrice || 0)
    });
    
    // Price alerts
    if (item.priceAlert?.enabled) priceAlertsActive++;
    if (item.priceAlert?.notificationSent) priceAlertsTriggered++;
    
    // Date analysis
    if (item.createdAt > oneWeekAgo) addedThisWeek++;
    if (item.createdAt > oneMonthAgo) addedThisMonth++;
    if (item.createdAt < oldestItem) oldestItem = item.createdAt;
    if (item.createdAt > newestItem) newestItem = item.createdAt;
  });
  
  const categories = Array.from(categoryCounts.entries()).map(([name, data]) => ({
    name,
    count: data.count,
    value: data.value,
  })).sort((a, b) => b.count - a.count);
  
  const mostWishedCategory = categories.length > 0 ? categories[0].name : 'None';
  
  return {
    totalItems,
    totalValue,
    averageItemPrice,
    priceAlerts: {
      active: priceAlertsActive,
      triggered: priceAlertsTriggered,
    },
    categories,
    addedThisWeek,
    addedThisMonth,
    mostWishedCategory,
    oldestItem: totalItems > 0 ? oldestItem : now,
    newestItem: totalItems > 0 ? newestItem : now,
  };
}

export function registerWishlistRoutes(app: Express) {
  // Get user wishlist with details and analytics
  app.get("/api/wishlist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const includeAnalytics = req.query.analytics === 'true';
      
      const wishlistItems = await storage.getUserWishlist(userId);
      const enrichedItems = await enrichWishlistItems(wishlistItems);
      
      const response: WishlistOperationResult = {
        success: true,
        items: enrichedItems,
        metadata: {
          totalItems: enrichedItems.length,
          totalValue: enrichedItems.reduce((sum, item) => sum + (item.currentPrice || 0), 0),
          syncStatus: 'synced',
        },
      };
      
      if (includeAnalytics) {
        response.analytics = generateWishlistAnalytics(enrichedItems);
      }
      
      res.json(response);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch wishlist",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get wishlist with guest support
  app.get("/api/wishlist/unified", optionalAuth, async (req: any, res) => {
    try {
      let wishlistItems: WishlistItemWithDetails[] = [];
      
      if (req.user) {
        // Authenticated user - get from database
        const items = await storage.getUserWishlist(req.user.uid);
        wishlistItems = await enrichWishlistItems(items);
      } else {
        // Guest user - parse from request body (sent as JSON in headers or body)
        const guestWishlist = req.body?.guestWishlist || [];
        if (Array.isArray(guestWishlist)) {
          wishlistItems = await enrichGuestWishlistItems(guestWishlist);
        }
      }
      
      const response: WishlistOperationResult = {
        success: true,
        items: wishlistItems,
        metadata: {
          totalItems: wishlistItems.length,
          totalValue: wishlistItems.reduce((sum, item) => sum + (item.currentPrice || 0), 0),
          syncStatus: req.user ? 'synced' : 'pending',
        },
      };
      
      res.json(response);
    } catch (error) {
      console.error("Error fetching unified wishlist:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch wishlist",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Add to wishlist with enhanced features
  app.post("/api/wishlist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      
      // Validate input
      const wishlistData = {
        ...CreateEnhancedWishlistItemSchema.parse(req.body),
        userId,
      };
      
      // Check if item already exists
      const existingItems = await storage.getUserWishlist(userId);
      const itemExists = existingItems.some(item => 
        (item.productId === wishlistData.productId && wishlistData.productId) ||
        (item.serviceId === wishlistData.serviceId && wishlistData.serviceId)
      );
      
      if (itemExists) {
        return res.status(409).json({
          success: false,
          message: "Item already in wishlist",
        });
      }
      
      // Check wishlist limits
      if (existingItems.length >= WISHLIST_CONFIG.maxItemsPerWishlist) {
        return res.status(400).json({
          success: false,
          message: `Wishlist limit reached (${WISHLIST_CONFIG.maxItemsPerWishlist} items)`,
        });
      }
      
      const wishlistId = await storage.createWishlistItem(wishlistData);
      const wishlistItem = await storage.getWishlistItemById(wishlistId);
      
      if (!wishlistItem) {
        throw new Error("Failed to retrieve created wishlist item");
      }
      
      const enrichedItems = await enrichWishlistItems([wishlistItem]);
      const enrichedItem = enrichedItems[0];
      
      const response: WishlistOperationResult = {
        success: true,
        message: "Item added to wishlist successfully",
        item: enrichedItem,
        metadata: {
          totalItems: existingItems.length + 1,
          totalValue: 0, // Will be calculated in next request
          syncStatus: 'synced',
        },
      };
      
      res.json(response);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to add to wishlist",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Bulk add to wishlist (for guest migration)
  app.post("/api/wishlist/bulk", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const { items: guestItems } = req.body;
      
      if (!Array.isArray(guestItems)) {
        return res.status(400).json({
          success: false,
          message: "Invalid guest items format",
        });
      }
      
      const existingItems = await storage.getUserWishlist(userId);
      const addedItems: EnhancedWishlistItem[] = [];
      const skippedItems: string[] = [];
      
      for (const guestItem of guestItems) {
        try {
          // Check if item already exists
          const itemExists = existingItems.some(item => 
            (item.productId === guestItem.productId && guestItem.productId) ||
            (item.serviceId === guestItem.serviceId && guestItem.serviceId)
          );
          
          if (itemExists) {
            skippedItems.push(guestItem.id);
            continue;
          }
          
          // Check limits
          if (existingItems.length + addedItems.length >= WISHLIST_CONFIG.maxItemsPerWishlist) {
            skippedItems.push(guestItem.id);
            continue;
          }
          
          const wishlistData = {
            ...CreateEnhancedWishlistItemSchema.parse({
              productId: guestItem.productId,
              serviceId: guestItem.serviceId,
              notes: guestItem.notes,
              priority: guestItem.priority,
              tags: guestItem.tags,
              addedFrom: guestItem.addedFrom,
            }),
            userId,
          };
          
          const wishlistId = await storage.createWishlistItem(wishlistData);
          const wishlistItem = await storage.getWishlistItemById(wishlistId);
          
          if (wishlistItem) {
            // Ensure the wishlist item has all required properties
            const enrichedWishlistItem = {
              ...wishlistItem,
              priority: wishlistItem.priority || 'medium',
              tags: wishlistItem.tags || [],
              addedFrom: wishlistItem.addedFrom || 'other',
              isPublic: wishlistItem.isPublic || false,
              notes: wishlistItem.notes || undefined,
              reminderDate: wishlistItem.reminderDate || undefined,
              priceAlert: wishlistItem.priceAlert || undefined,
              sessionId: wishlistItem.sessionId || undefined,
            };
            addedItems.push(enrichedWishlistItem);
          }
        } catch (itemError) {
          console.error("Error adding guest item to wishlist:", itemError);
          skippedItems.push(guestItem.id);
        }
      }
      
      const enrichedItems = await enrichWishlistItems(addedItems);
      
      const response: WishlistOperationResult = {
        success: true,
        message: `Successfully migrated ${addedItems.length} items to wishlist${skippedItems.length > 0 ? `, skipped ${skippedItems.length} items` : ''}`,
        items: enrichedItems,
        metadata: {
          totalItems: existingItems.length + addedItems.length,
          totalValue: enrichedItems.reduce((sum, item) => sum + (item.currentPrice || 0), 0),
          syncStatus: 'synced',
        },
      };
      
      res.json(response);
    } catch (error) {
      console.error("Error bulk adding to wishlist:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to migrate wishlist items",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Update wishlist item
  app.patch("/api/wishlist/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const itemId = req.params.id;
      
      const wishlistItem = await storage.getWishlistItemById(itemId);
      
      if (!wishlistItem || wishlistItem.userId !== userId) {
        return res.status(404).json({
          success: false,
          message: "Wishlist item not found",
        });
      }
      
      // Validate updates
      const allowedUpdates = ['notes', 'priority', 'tags', 'priceAlert'];
      const updates = Object.keys(req.body).reduce((acc, key) => {
        if (allowedUpdates.includes(key)) {
          acc[key] = req.body[key];
        }
        return acc;
      }, {} as any);
      
      await storage.updateWishlistItem(itemId, updates);
      const updatedItem = await storage.getWishlistItemById(itemId);
      
      if (!updatedItem) {
        throw new Error("Failed to retrieve updated wishlist item");
      }
      
      const enrichedItems = await enrichWishlistItems([updatedItem]);
      const enrichedItem = enrichedItems[0];
      
      const response: WishlistOperationResult = {
        success: true,
        message: "Wishlist item updated successfully",
        item: enrichedItem,
        metadata: {
          totalItems: 1,
          totalValue: enrichedItem.currentPrice || 0,
          syncStatus: 'synced',
        },
      };
      
      res.json(response);
    } catch (error) {
      console.error("Error updating wishlist item:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to update wishlist item",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Remove from wishlist
  app.delete("/api/wishlist/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const itemId = req.params.id;
      
      const wishlistItem = await storage.getWishlistItemById(itemId);
      
      if (!wishlistItem || wishlistItem.userId !== userId) {
        return res.status(404).json({
          success: false,
          message: "Wishlist item not found",
        });
      }

      await storage.deleteWishlistItem(itemId);
      
      const response: WishlistOperationResult = {
        success: true,
        message: "Item removed from wishlist successfully",
        metadata: {
          totalItems: 0,
          totalValue: 0,
          syncStatus: 'synced',
        },
      };
      
      res.json(response);
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to remove from wishlist",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Move item from wishlist to cart
  app.post("/api/wishlist/:id/move-to-cart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const itemId = req.params.id;
      const { quantity = 1, removeFromWishlist = true } = req.body;
      
      const wishlistItem = await storage.getWishlistItemById(itemId);
      
      if (!wishlistItem || wishlistItem.userId !== userId) {
        return res.status(404).json({
          success: false,
          message: "Wishlist item not found",
        });
      }
      
      // Add to cart
      const cartItemId = await storage.addToCart(
        userId,
        wishlistItem.productId,
        wishlistItem.serviceId,
        quantity
      );
      
      // Optionally remove from wishlist
      if (removeFromWishlist) {
        await storage.deleteWishlistItem(itemId);
      }
      
      const response: WishlistOperationResult = {
        success: true,
        message: removeFromWishlist 
          ? "Item moved to cart successfully"
          : "Item added to cart successfully",
        metadata: {
          totalItems: 0,
          totalValue: 0,
          syncStatus: 'synced',
        },
      };
      
      res.json(response);
    } catch (error) {
      console.error("Error moving item to cart:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to move item to cart",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get wishlist analytics
  app.get("/api/wishlist/analytics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      
      const wishlistItems = await storage.getUserWishlist(userId);
      const enrichedItems = await enrichWishlistItems(wishlistItems);
      const analytics = generateWishlistAnalytics(enrichedItems);
      
      res.json({
        success: true,
        analytics,
      });
    } catch (error) {
      console.error("Error fetching wishlist analytics:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch wishlist analytics",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Check if item is in wishlist
  app.get("/api/wishlist/check/:type/:id", optionalAuth, async (req: any, res) => {
    try {
      const { type, id } = req.params; // type: 'product' or 'service', id: productId or serviceId
      
      if (!req.user) {
        // Guest user - return false (they need to check locally)
        return res.json({
          success: true,
          inWishlist: false,
          guestMode: true,
        });
      }
      
      const userId = req.user.uid;
      const wishlistItems = await storage.getUserWishlist(userId);
      
      const inWishlist = wishlistItems.some(item => 
        (type === 'product' && item.productId === id) ||
        (type === 'service' && item.serviceId === id)
      );
      
      res.json({
        success: true,
        inWishlist,
        guestMode: false,
      });
    } catch (error) {
      console.error("Error checking wishlist status:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to check wishlist status",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}