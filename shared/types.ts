import { z } from 'zod';

// User types
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImageUrl: z.string().optional(),
  isAdmin: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateUserSchema = UserSchema.omit({
  createdAt: true,
  updatedAt: true
});

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;

// Category types
export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  parentId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateCategorySchema = CategorySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type Category = z.infer<typeof CategorySchema>;
export type CreateCategory = z.infer<typeof CreateCategorySchema>;

// Product types
export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.number(),
  originalPrice: z.number().optional(),
  sku: z.string().optional(),
  stock: z.number().default(0),
  category: z.string().optional(),
  categoryId: z.string().optional(),
  imageUrls: z.array(z.string()).default([]),
  specifications: z.record(z.any()).optional(),
  weightInKg: z.number().default(0),
  isBulky: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  rating: z.number().default(0),
  reviewCount: z.number().default(0),
  warranty: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateProductSchema = ProductSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type Product = z.infer<typeof ProductSchema>;
export type CreateProduct = z.infer<typeof CreateProductSchema>;

// Service types
export const ServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  startingPrice: z.number(),
  duration: z.number(), // in minutes
  categoryId: z.string().optional(),
  imageUrls: z.array(z.string()).default([]),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  rating: z.number().default(0),
  reviewCount: z.number().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateServiceSchema = ServiceSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type Service = z.infer<typeof ServiceSchema>;
export type CreateService = z.infer<typeof CreateServiceSchema>;

// Cart types
export const CartItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productId: z.string().optional(),
  serviceId: z.string().optional(),
  quantity: z.number().default(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateCartItemSchema = CartItemSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type CartItem = z.infer<typeof CartItemSchema>;
export type CreateCartItem = z.infer<typeof CreateCartItemSchema>;

// Order Status enum - for type safety
export const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];

// Shipping Address schema - reusable
export const ShippingAddressSchema = z.object({
  firstName: z.string(),
  lastName: z.string().optional(),
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  country: z.string().default('India'),
  phone: z.string().optional(),
});

export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;

// Order types - Enhanced with denormalized customer info, tracking, and financials
export const OrderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(), // Human-readable: "CB-M5X7K9P-A2F"
  userId: z.string(),

  // Denormalized customer info (no joins needed for list queries)
  customerName: z.string(),
  customerEmail: z.string(),
  customerPhone: z.string().optional(),

  // Status
  status: z.enum(ORDER_STATUSES).default('pending'),

  // Tracking (populated when shipped)
  trackingNumber: z.string().optional(),
  trackingCarrier: z.string().optional(), // 'delhivery', 'bluedart', 'dtdc', etc.
  trackingUrl: z.string().optional(),

  // Financials (broken down for GST invoices)
  subtotal: z.number(), // Sum of item totals before tax
  tax: z.number(), // GST amount
  shippingCost: z.number().default(0),
  total: z.number(), // Final total = subtotal + tax + shippingCost

  // Addresses
  shippingAddress: ShippingAddressSchema,

  // Payment
  paymentMethod: z.enum(['cod', 'razorpay', 'bank_transfer']).default('cod'),
  paymentStatus: z.enum(['pending', 'awaiting_payment', 'verification_pending', 'paid', 'failed', 'refunded']).default('pending'),

  // Payment verification details
  transactionId: z.string().optional(),
  paymentProofUrl: z.string().optional(),

  // Cancellation metadata (populated if cancelled)
  cancelledAt: z.date().optional(),
  cancelledBy: z.string().optional(), // userId of who cancelled
  cancelledByRole: z.enum(['customer', 'admin', 'system']).optional(),
  cancellationReason: z.string().optional(),

  // Item count for quick display without fetching items
  itemCount: z.number().default(0),

  // Admin notes (internal)
  adminNotes: z.string().optional(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateOrderSchema = OrderSchema.omit({
  id: true,
  orderNumber: true, // Generated server-side
  createdAt: true,
  updatedAt: true
});

export type Order = z.infer<typeof OrderSchema>;
export type CreateOrder = z.infer<typeof CreateOrderSchema>;

// Order Item types - Enhanced with product snapshot and unitPrice/totalPrice
export const OrderItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  productId: z.string().optional(),
  serviceId: z.string().optional(),

  // Product snapshot (historical record even if product is deleted/changed)
  productName: z.string(),
  productSku: z.string().optional(),
  productImageUrl: z.string().optional(),

  // Pricing (both for GST invoices and historical accuracy)
  unitPrice: z.number(), // Price per unit at time of order
  quantity: z.number(),
  totalPrice: z.number(), // unitPrice * quantity

  // For discounts (future enhancement)
  discountAmount: z.number().default(0),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateOrderItemSchema = OrderItemSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type OrderItem = z.infer<typeof OrderItemSchema>;
export type CreateOrderItem = z.infer<typeof CreateOrderItemSchema>;

// Order History types - Audit trail for status changes
export const OrderHistorySchema = z.object({
  id: z.string(),
  orderId: z.string(),
  previousStatus: z.string().nullable(), // null for initial creation
  newStatus: z.string(),
  changedBy: z.string(), // userId or 'system'
  changedByEmail: z.string().optional(),
  changedByRole: z.enum(['system', 'admin', 'customer']),
  reason: z.string().optional(), // e.g., "Customer requested cancellation"
  createdAt: z.date(),
});

export const CreateOrderHistorySchema = OrderHistorySchema.omit({
  id: true,
  createdAt: true,
});

export type OrderHistory = z.infer<typeof OrderHistorySchema>;
export type CreateOrderHistory = z.infer<typeof CreateOrderHistorySchema>;

// Service Booking types
export const ServiceBookingSchema = z.object({
  id: z.string(),
  userId: z.string(),
  serviceId: z.string(),
  scheduledDate: z.coerce.date(),
  scheduledTime: z.string(),
  status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']).default('pending'),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }),
  notes: z.string().optional(),
  total: z.number(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).default('pending'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateServiceBookingSchema = ServiceBookingSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type ServiceBooking = z.infer<typeof ServiceBookingSchema>;
export type CreateServiceBooking = z.infer<typeof CreateServiceBookingSchema>;

// Review types
export const ReviewSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productId: z.string().optional(),
  serviceId: z.string().optional(),
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().optional(),
  isVerified: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateReviewSchema = ReviewSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type Review = z.infer<typeof ReviewSchema>;
export type CreateReview = z.infer<typeof CreateReviewSchema>;

// Wishlist types
export const WishlistItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productId: z.string().optional(),
  serviceId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateWishlistItemSchema = WishlistItemSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type WishlistItem = z.infer<typeof WishlistItemSchema>;
export type CreateWishlistItem = z.infer<typeof CreateWishlistItemSchema>;

// Address types
export const AddressSchema = ShippingAddressSchema.extend({
  id: z.string(),
  userId: z.string(),
  label: z.string().optional(), // "Home", "Office", etc.
  isDefault: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateAddressSchema = AddressSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type Address = z.infer<typeof AddressSchema>;
export type CreateAddress = z.infer<typeof CreateAddressSchema>;