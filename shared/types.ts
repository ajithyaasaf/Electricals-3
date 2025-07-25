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

// Dynamic Product Attribute System
// This allows each product category to have different attributes
export const ProductAttributeSchema = z.object({
  name: z.string(), // e.g., "voltage", "current_rating", "power"
  label: z.string(), // e.g., "Voltage", "Current Rating", "Power"
  type: z.enum(['text', 'number', 'boolean', 'select', 'multi-select']),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(), // For select/multi-select
  unit: z.string().optional(), // e.g., "V", "A", "W"
  category: z.string(), // e.g., "electrical", "physical", "certification"
});

export type ProductAttribute = z.infer<typeof ProductAttributeSchema>;

// Product types with enhanced specifications
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
  // Dynamic specifications - can be any key-value pairs
  specifications: z.record(z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])).optional(),
  // Metadata about which attributes this product uses
  attributeTemplate: z.string().optional(), // e.g., "circuit_breaker", "wire_cable", "electrical_tool"
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

// Product Attribute Templates for different electrical product types
export const ELECTRICAL_PRODUCT_TEMPLATES = {
  circuit_breaker: {
    name: "Circuit Breaker",
    attributes: [
      { name: "voltage", label: "Voltage", type: "select" as const, required: true, options: ["120V", "240V", "480V", "600V"], unit: "V", category: "electrical" },
      { name: "current_rating", label: "Current Rating", type: "select" as const, required: true, options: ["15A", "20A", "30A", "50A", "100A"], unit: "A", category: "electrical" },
      { name: "poles", label: "Number of Poles", type: "select" as const, required: true, options: ["1", "2", "3"], category: "electrical" },
      { name: "breaking_capacity", label: "Breaking Capacity", type: "number" as const, unit: "kA", category: "electrical" },
      { name: "mounting_type", label: "Mounting Type", type: "select" as const, options: ["Panel Mount", "DIN Rail", "Surface Mount"], category: "physical" },
      { name: "ul_listed", label: "UL Listed", type: "boolean" as const, category: "certification" },
      { name: "brand", label: "Brand", type: "select" as const, required: true, options: ["Schneider Electric", "ABB", "Siemens", "Eaton"], category: "general" }
    ]
  },
  wire_cable: {
    name: "Wire & Cable",
    attributes: [
      { name: "conductor_material", label: "Conductor Material", type: "select" as const, required: true, options: ["Copper", "Aluminum"], category: "physical" },
      { name: "awg_size", label: "AWG Size", type: "select" as const, required: true, options: ["14 AWG", "12 AWG", "10 AWG", "8 AWG", "6 AWG"], category: "electrical" },
      { name: "insulation_type", label: "Insulation Type", type: "select" as const, required: true, options: ["THHN", "THWN", "XHHW", "NM-B"], category: "physical" },
      { name: "voltage_rating", label: "Voltage Rating", type: "select" as const, required: true, options: ["300V", "600V", "1000V"], unit: "V", category: "electrical" },
      { name: "length", label: "Length", type: "number" as const, required: true, unit: "ft", category: "physical" },
      { name: "stranded", label: "Stranded", type: "boolean" as const, category: "physical" },
      { name: "outdoor_rated", label: "Outdoor Rated", type: "boolean" as const, category: "environmental" }
    ]
  },
  electrical_tool: {
    name: "Electrical Tool",
    attributes: [
      { name: "tool_type", label: "Tool Type", type: "select" as const, required: true, options: ["Multimeter", "Wire Stripper", "Crimping Tool", "Voltage Tester"], category: "general" },
      { name: "power_source", label: "Power Source", type: "select" as const, options: ["Battery", "AC Power", "Manual"], category: "electrical" },
      { name: "measurement_range", label: "Measurement Range", type: "text" as const, category: "specifications" },
      { name: "accuracy", label: "Accuracy", type: "text" as const, category: "specifications" },
      { name: "safety_rating", label: "Safety Rating", type: "select" as const, options: ["CAT I", "CAT II", "CAT III", "CAT IV"], category: "safety" },
      { name: "warranty_years", label: "Warranty", type: "number" as const, unit: "years", category: "general" }
    ]
  },
  lighting: {
    name: "Lighting",
    attributes: [
      { name: "light_type", label: "Light Type", type: "select" as const, required: true, options: ["LED", "Fluorescent", "Incandescent", "Halogen"], category: "general" },
      { name: "wattage", label: "Wattage", type: "number" as const, required: true, unit: "W", category: "electrical" },
      { name: "lumens", label: "Lumens", type: "number" as const, unit: "lm", category: "specifications" },
      { name: "color_temperature", label: "Color Temperature", type: "select" as const, options: ["2700K", "3000K", "4000K", "5000K", "6500K"], unit: "K", category: "specifications" },
      { name: "dimmable", label: "Dimmable", type: "boolean" as const, category: "features" },
      { name: "beam_angle", label: "Beam Angle", type: "number" as const, unit: "degrees", category: "specifications" },
      { name: "ip_rating", label: "IP Rating", type: "select" as const, options: ["IP20", "IP44", "IP54", "IP65", "IP67"], category: "environmental" }
    ]
  },
  panel_equipment: {
    name: "Panel Equipment",
    attributes: [
      { name: "panel_type", label: "Panel Type", type: "select" as const, required: true, options: ["Main Panel", "Sub Panel", "Distribution Panel"], category: "general" },
      { name: "amperage", label: "Main Amperage", type: "select" as const, required: true, options: ["100A", "150A", "200A", "400A"], unit: "A", category: "electrical" },
      { name: "spaces", label: "Circuit Spaces", type: "number" as const, required: true, category: "physical" },
      { name: "main_breaker", label: "Main Breaker Included", type: "boolean" as const, category: "features" },
      { name: "indoor_outdoor", label: "Installation", type: "select" as const, required: true, options: ["Indoor", "Outdoor"], category: "environmental" },
      { name: "nema_rating", label: "NEMA Rating", type: "select" as const, options: ["NEMA 1", "NEMA 3R", "NEMA 4"], category: "environmental" }
    ]
  }
} as const;