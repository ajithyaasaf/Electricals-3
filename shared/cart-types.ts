// Enhanced Cart Types for Enterprise-Grade Shopping Cart System
import { z } from 'zod';
import type { Product, Service } from './types';

// Coupon and Discount System
export const CouponSchema = z.object({
  id: z.string(),
  code: z.string(),
  type: z.enum(['percentage', 'fixed', 'shipping']),
  value: z.number(),
  minOrderAmount: z.number().optional(),
  maxDiscount: z.number().optional(),
  usageLimit: z.number().optional(),
  usedCount: z.number().default(0),
  isActive: z.boolean().default(true),
  expiresAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateCouponSchema = CouponSchema.omit({ 
  id: true,
  usedCount: true,
  createdAt: true, 
  updatedAt: true 
});

export type Coupon = z.infer<typeof CouponSchema>;
export type CreateCoupon = z.infer<typeof CreateCouponSchema>;

// Enhanced Cart Item with Pricing and Discounts
export const EnhancedCartItemSchema = z.object({
  id: z.string(),
  userId: z.string().optional(), // Optional for guest users
  sessionId: z.string().optional(), // For guest cart persistence
  productId: z.string().optional(),
  serviceId: z.string().optional(),
  quantity: z.number().min(1),
  unitPrice: z.number(),
  originalPrice: z.number(),
  discount: z.number().default(0),
  appliedCoupons: z.array(z.string()).default([]), // Coupon IDs
  customizations: z.record(z.any()).optional(),
  notes: z.string().optional(),
  savedForLater: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateEnhancedCartItemSchema = EnhancedCartItemSchema.omit({ 
  id: true,
  createdAt: true, 
  updatedAt: true 
});

export type EnhancedCartItem = z.infer<typeof EnhancedCartItemSchema>;
export type CreateEnhancedCartItem = z.infer<typeof CreateEnhancedCartItemSchema>;

// Alias for backward compatibility
export type CartItem = EnhancedCartItem;

// Cart Summary and Totals
export const CartTotalsSchema = z.object({
  subtotal: z.number(),
  discount: z.number(),
  shipping: z.number(),
  tax: z.number(),
  total: z.number(),
  savings: z.number(),
});

export type CartTotals = z.infer<typeof CartTotalsSchema>;

// Cart with Enhanced Features
export const CartSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  items: z.array(EnhancedCartItemSchema),
  appliedCoupons: z.array(z.string()).default([]),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string().default('India'),
  }).optional(),
  totals: CartTotalsSchema,
  currency: z.string().default('INR'),
  lastUpdated: z.date(),
  expiresAt: z.date().optional(), // For guest carts
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Cart = z.infer<typeof CartSchema>;

// Cart Item with Product/Service Details (for API responses)
export interface CartItemWithDetails extends EnhancedCartItem {
  product?: Product;
  service?: Service;
}

// Cart Operations
export interface CartOperationResult {
  success: boolean;
  message?: string;
  cart?: Cart;
  error?: string;
}

// Cart Validation Rules
export const CartValidationSchema = z.object({
  maxItemsPerCart: z.number().default(50),
  maxQuantityPerItem: z.number().default(99),
  minOrderAmount: z.number().default(0),
  allowGuestCheckout: z.boolean().default(true),
  cartExpiryHours: z.number().default(72), // Guest cart expiry
});

export type CartValidation = z.infer<typeof CartValidationSchema>;

// Shipping Options
export const ShippingOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  estimatedDays: z.number(),
  isDefault: z.boolean().default(false),
  minOrderAmount: z.number().default(0),
});

export type ShippingOption = z.infer<typeof ShippingOptionSchema>;

// Tax Configuration
export const TaxConfigSchema = z.object({
  rate: z.number(),
  type: z.enum(['percentage', 'fixed']),
  region: z.string().optional(),
  includeShipping: z.boolean().default(false),
});

export type TaxConfig = z.infer<typeof TaxConfigSchema>;