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
  categoryId: z.string().optional(),
  imageUrls: z.array(z.string()).default([]),
  specifications: z.record(z.any()).optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  rating: z.number().default(0),
  reviewCount: z.number().default(0),
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
  price: z.number(),
  duration: z.number(), // in minutes
  categoryId: z.string().optional(),
  imageUrls: z.array(z.string()).default([]),
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

// Order types
export const OrderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).default('pending'),
  total: z.number(),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }),
  paymentMethod: z.string(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).default('pending'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateOrderSchema = OrderSchema.omit({ 
  id: true,
  createdAt: true, 
  updatedAt: true 
});

export type Order = z.infer<typeof OrderSchema>;
export type CreateOrder = z.infer<typeof CreateOrderSchema>;

// Order Item types
export const OrderItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  productId: z.string().optional(),
  serviceId: z.string().optional(),
  quantity: z.number(),
  price: z.number(),
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

// Service Booking types
export const ServiceBookingSchema = z.object({
  id: z.string(),
  userId: z.string(),
  serviceId: z.string(),
  scheduledDate: z.date(),
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