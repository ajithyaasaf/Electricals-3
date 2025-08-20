// Enhanced Wishlist Types for Enterprise-Grade Wishlist System
import { z } from 'zod';
import type { Product, Service } from './types';

// Enhanced Wishlist Item with comprehensive features
export const EnhancedWishlistItemSchema = z.object({
  id: z.string(),
  userId: z.string().optional(), // Optional for guest users
  sessionId: z.string().optional(), // For guest wishlist persistence
  productId: z.string().optional(),
  serviceId: z.string().optional(),
  notes: z.string().optional(), // Personal notes
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  reminderDate: z.date().optional(), // Price drop alerts
  priceAlert: z.object({
    enabled: z.boolean().default(false),
    targetPrice: z.number().optional(),
    notificationSent: z.boolean().default(false),
  }).optional(),
  tags: z.array(z.string()).default([]), // Custom tags for organization
  addedFrom: z.enum(['product_page', 'listing_page', 'search', 'recommendation', 'other']).default('other'),
  isPublic: z.boolean().default(false), // For wishlist sharing
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateEnhancedWishlistItemSchema = EnhancedWishlistItemSchema.omit({ 
  id: true,
  createdAt: true, 
  updatedAt: true 
});

export type EnhancedWishlistItem = z.infer<typeof EnhancedWishlistItemSchema>;
export type CreateEnhancedWishlistItem = z.infer<typeof CreateEnhancedWishlistItemSchema>;

// Alias for backward compatibility and consistency
export type WishlistItem = EnhancedWishlistItem;

// Wishlist Collection with metadata
export const WishlistCollectionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().default('My Wishlist'),
  description: z.string().optional(),
  isDefault: z.boolean().default(true),
  isPublic: z.boolean().default(false),
  shareId: z.string().optional(), // For public sharing
  shareToken: z.string().optional(), // Security token for sharing
  tags: z.array(z.string()).default([]),
  itemCount: z.number().default(0),
  totalValue: z.number().default(0), // Total value of items
  lastActivity: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type WishlistCollection = z.infer<typeof WishlistCollectionSchema>;

// Wishlist with Product/Service Details (for API responses)
export interface WishlistItemWithDetails extends EnhancedWishlistItem {
  product?: Product;
  service?: Service;
  originalPrice?: number; // Price when added
  currentPrice?: number; // Current price
  priceDifference?: number; // Price change since added
  isOnSale?: boolean; // Current promotion status
  stockStatus?: 'in_stock' | 'out_of_stock' | 'low_stock';
}

// Guest wishlist item interface with schema versioning
export interface GuestWishlistItem {
  id: string;
  productId?: string;
  serviceId?: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  addedAt: number;
  lastUpdated: number;
  schemaVersion: string;
  addedFrom: 'product_page' | 'listing_page' | 'search' | 'recommendation' | 'other';
}

// Guest wishlist wrapper with metadata
export interface GuestWishlistData {
  items: GuestWishlistItem[];
  schemaVersion: string;
  lastUpdated: number;
  expiryHours: number; // Auto-cleanup threshold
  syncAttempts: number; // Track sync attempts for debugging
}

// Wishlist Operations
export interface WishlistOperationResult {
  success: boolean;
  message?: string;
  item?: WishlistItemWithDetails;
  items?: WishlistItemWithDetails[];
  error?: string;
  analytics?: WishlistAnalytics;
  metadata?: {
    totalItems: number;
    totalValue: number;
    syncStatus?: 'pending' | 'synced' | 'failed';
  };
}

// Wishlist sharing configuration
export const WishlistShareSchema = z.object({
  id: z.string(),
  wishlistId: z.string(),
  shareToken: z.string(),
  shareUrl: z.string(),
  isActive: z.boolean().default(true),
  expiresAt: z.date().optional(),
  accessCount: z.number().default(0),
  maxAccess: z.number().optional(),
  allowComments: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type WishlistShare = z.infer<typeof WishlistShareSchema>;

// Wishlist Analytics
export interface WishlistAnalytics {
  totalItems: number;
  totalValue: number;
  averageItemPrice: number;
  priceAlerts: {
    active: number;
    triggered: number;
  };
  categories: Array<{
    name: string;
    count: number;
    value: number;
  }>;
  addedThisWeek: number;
  addedThisMonth: number;
  mostWishedCategory: string;
  oldestItem: Date;
  newestItem: Date;
}

// Wishlist synchronization status
export interface WishlistSyncStatus {
  lastSync: Date;
  pendingChanges: number;
  conflicts: number;
  status: 'idle' | 'syncing' | 'failed' | 'conflict' | 'pending';
  retryCount: number;
  nextRetry?: Date;
}

// Price tracking for wishlist items
export const PriceTrackingSchema = z.object({
  id: z.string(),
  wishlistItemId: z.string(),
  originalPrice: z.number(),
  currentPrice: z.number(),
  lowestPrice: z.number(),
  highestPrice: z.number(),
  priceHistory: z.array(z.object({
    price: z.number(),
    date: z.date(),
    source: z.string().optional(),
  })),
  alerts: z.array(z.object({
    type: z.enum(['price_drop', 'back_in_stock', 'on_sale']),
    threshold: z.number().optional(),
    triggered: z.boolean().default(false),
    triggeredAt: z.date().optional(),
  })),
  lastChecked: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PriceTracking = z.infer<typeof PriceTrackingSchema>;

// Wishlist validation rules
export const WishlistValidationSchema = z.object({
  maxItemsPerWishlist: z.number().default(500),
  maxWishlistsPerUser: z.number().default(10),
  maxGuestItems: z.number().default(50),
  guestExpiryHours: z.number().default(168), // 7 days
  maxSharesPerWishlist: z.number().default(5),
  shareExpiryDays: z.number().default(30),
  priceTrackingDays: z.number().default(90),
});

export type WishlistValidation = z.infer<typeof WishlistValidationSchema>;

// Wishlist notification preferences
export const WishlistNotificationSchema = z.object({
  userId: z.string(),
  priceDropAlerts: z.boolean().default(true),
  backInStockAlerts: z.boolean().default(true),
  saleAlerts: z.boolean().default(true),
  weeklyDigest: z.boolean().default(false),
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(false),
  frequency: z.enum(['immediate', 'daily', 'weekly']).default('immediate'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type WishlistNotification = z.infer<typeof WishlistNotificationSchema>;