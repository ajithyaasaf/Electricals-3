import {
  users,
  categories,
  products,
  services,
  cartItems,
  orders,
  orderItems,
  serviceBookings,
  reviews,
  wishlists,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type Service,
  type InsertService,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type ServiceBooking,
  type InsertServiceBooking,
  type Review,
  type InsertReview,
  type Wishlist,
  type InsertWishlist,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, like, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
  
  // Product operations
  getProducts(filters?: { categoryId?: number; search?: string; featured?: boolean; limit?: number; offset?: number }): Promise<{ products: Product[]; total: number }>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  
  // Service operations
  getServices(filters?: { categoryId?: number; search?: string; limit?: number; offset?: number }): Promise<{ services: Service[]; total: number }>;
  getServiceById(id: number): Promise<Service | undefined>;
  getServiceBySlug(slug: string): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service>;
  deleteService(id: number): Promise<void>;
  
  // Cart operations
  getCartItems(userId: string): Promise<CartItem[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId: string): Promise<void>;
  
  // Order operations
  getOrders(userId?: string): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  
  // Order item operations
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Service booking operations
  getServiceBookings(userId?: string): Promise<ServiceBooking[]>;
  getServiceBookingById(id: number): Promise<ServiceBooking | undefined>;
  createServiceBooking(booking: InsertServiceBooking): Promise<ServiceBooking>;
  updateServiceBookingStatus(id: number, status: string): Promise<ServiceBooking>;
  
  // Review operations
  getReviews(productId?: number, serviceId?: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Wishlist operations
  getWishlist(userId: string): Promise<Wishlist[]>;
  addToWishlist(wishlist: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(userId: string, productId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category> {
    const [updatedCategory] = await db
      .update(categories)
      .set({ ...category, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Product operations
  async getProducts(filters?: { categoryId?: number; search?: string; featured?: boolean; limit?: number; offset?: number }): Promise<{ products: Product[]; total: number }> {
    const conditions = [eq(products.isActive, true)];

    if (filters?.categoryId) {
      conditions.push(eq(products.categoryId, filters.categoryId));
    }

    if (filters?.search) {
      conditions.push(
        or(
          like(products.name, `%${filters.search}%`),
          like(products.description, `%${filters.search}%`)
        )
      );
    }

    if (filters?.featured) {
      conditions.push(eq(products.isFeatured, true));
    }

    const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0];

    let query = db.select().from(products).where(whereCondition);
    const countQuery = db.select({ count: count() }).from(products).where(whereCondition);

    query = query.orderBy(desc(products.createdAt));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    const [productsResult, totalResult] = await Promise.all([
      query,
      countQuery
    ]);

    return {
      products: productsResult,
      total: totalResult[0]?.count || 0
    };
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Service operations
  async getServices(filters?: { categoryId?: number; search?: string; limit?: number; offset?: number }): Promise<{ services: Service[]; total: number }> {
    const conditions = [eq(services.isActive, true)];

    if (filters?.categoryId) {
      conditions.push(eq(services.categoryId, filters.categoryId));
    }

    if (filters?.search) {
      conditions.push(
        or(
          like(services.name, `%${filters.search}%`),
          like(services.description, `%${filters.search}%`)
        )
      );
    }

    const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0];

    let query = db.select().from(services).where(whereCondition);
    const countQuery = db.select({ count: count() }).from(services).where(whereCondition);

    query = query.orderBy(desc(services.createdAt));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    const [servicesResult, totalResult] = await Promise.all([
      query,
      countQuery
    ]);

    return {
      services: servicesResult,
      total: totalResult[0]?.count || 0
    };
  }

  async getServiceById(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async getServiceBySlug(slug: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.slug, slug));
    return service;
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async updateService(id: number, service: Partial<InsertService>): Promise<Service> {
    const [updatedService] = await db
      .update(services)
      .set({ ...service, updatedAt: new Date() })
      .where(eq(services.id, id))
      .returning();
    return updatedService;
  }

  async deleteService(id: number): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  // Cart operations
  async getCartItems(userId: string): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, cartItem.userId),
          eq(cartItems.productId, cartItem.productId!)
        )
      );

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ 
          quantity: (existingItem.quantity || 0) + (cartItem.quantity || 1),
          updatedAt: new Date()
        })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Add new item
      const [newItem] = await db.insert(cartItems).values(cartItem).returning();
      return newItem;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Order operations
  async getOrders(userId?: string): Promise<Order[]> {
    let query = db.select().from(orders).orderBy(desc(orders.createdAt));
    
    if (userId) {
      query = query.where(eq(orders.userId, userId));
    }
    
    return await query;
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // Order item operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [newOrderItem] = await db.insert(orderItems).values(orderItem).returning();
    return newOrderItem;
  }

  // Service booking operations
  async getServiceBookings(userId?: string): Promise<ServiceBooking[]> {
    let query = db.select().from(serviceBookings).orderBy(desc(serviceBookings.createdAt));
    
    if (userId) {
      query = query.where(eq(serviceBookings.userId, userId));
    }
    
    return await query;
  }

  async getServiceBookingById(id: number): Promise<ServiceBooking | undefined> {
    const [booking] = await db.select().from(serviceBookings).where(eq(serviceBookings.id, id));
    return booking;
  }

  async createServiceBooking(booking: InsertServiceBooking): Promise<ServiceBooking> {
    const [newBooking] = await db.insert(serviceBookings).values(booking).returning();
    return newBooking;
  }

  async updateServiceBookingStatus(id: number, status: string): Promise<ServiceBooking> {
    const [updatedBooking] = await db
      .update(serviceBookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(serviceBookings.id, id))
      .returning();
    return updatedBooking;
  }

  // Review operations
  async getReviews(productId?: number, serviceId?: number): Promise<Review[]> {
    let query = db.select().from(reviews).orderBy(desc(reviews.createdAt));
    
    if (productId) {
      query = query.where(eq(reviews.productId, productId));
    } else if (serviceId) {
      query = query.where(eq(reviews.serviceId, serviceId));
    }
    
    return await query;
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  // Wishlist operations
  async getWishlist(userId: string): Promise<Wishlist[]> {
    return await db.select().from(wishlists).where(eq(wishlists.userId, userId));
  }

  async addToWishlist(wishlist: InsertWishlist): Promise<Wishlist> {
    const [newWishlistItem] = await db.insert(wishlists).values(wishlist).returning();
    return newWishlistItem;
  }

  async removeFromWishlist(userId: string, productId: number): Promise<void> {
    await db.delete(wishlists).where(
      and(
        eq(wishlists.userId, userId),
        eq(wishlists.productId, productId)
      )
    );
  }
}

export const storage = new DatabaseStorage();
