// Firestore-based storage implementation for CopperBear Electrical E-Commerce Platform  
// Uses Firebase Admin SDK - bypasses security rules for server-side operations
// This enables strict client-side security rules while maintaining full backend access

import {
  adminUserService as userService,
  adminCategoryService as categoryService,
  adminProductService as productService,
  adminServiceService as serviceService,
  adminCartService as cartService,
  adminOrderService as orderService,
  adminOrderItemService as orderItemService,
  adminServiceBookingService as serviceBookingService,
  adminReviewService as reviewService,
  adminWishlistService as wishlistService,
  AdminProductQueries as ProductQueries,
  AdminCartQueries as CartQueries,
  AdminOrderQueries as OrderQueries,
  AdminReviewQueries as ReviewQueries,
  AdminWishlistQueries as WishlistQueries,
} from './adminFirestoreService';


import type {
  User, CreateUser,
  Category, CreateCategory,
  Product, CreateProduct,
  Service, CreateService,
  CartItem, CreateCartItem,
  Order, CreateOrder,
  OrderItem, CreateOrderItem,
  ServiceBooking, CreateServiceBooking,
  Review, CreateReview,
  WishlistItem, CreateWishlistItem,
} from '@shared/types';

export interface IStorage {
  // User operations
  createUser(data: CreateUser): Promise<string>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  updateUser(id: string, data: Partial<CreateUser>): Promise<void>;
  deleteUser(id: string): Promise<void>;

  // Category operations
  createCategory(data: CreateCategory): Promise<string>;
  getCategoryById(id: string): Promise<Category | null>;
  getAllCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  updateCategory(id: string, data: Partial<CreateCategory>): Promise<void>;
  deleteCategory(id: string): Promise<void>;

  // Product operations
  createProduct(data: CreateProduct): Promise<string>;
  getProductById(id: string): Promise<Product | null>;
  getAllProducts(): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;
  searchProducts(query: string): Promise<Product[]>;
  updateProduct(id: string, data: Partial<CreateProduct>): Promise<void>;
  deleteProduct(id: string): Promise<void>;

  // Service operations
  createService(data: CreateService): Promise<string>;
  getServiceById(id: string): Promise<Service | null>;
  getAllServices(): Promise<Service[]>;
  getServicesByCategory(categoryId: string): Promise<Service[]>;
  getServiceBySlug(slug: string): Promise<Service | null>;
  updateService(id: string, data: Partial<CreateService>): Promise<void>;
  deleteService(id: string): Promise<void>;

  // Cart operations
  createCartItem(data: CreateCartItem): Promise<string>;
  getCartItemById(id: string): Promise<CartItem | null>;
  getUserCartItems(userId: string): Promise<CartItem[]>;
  updateCartItem(id: string, data: Partial<CreateCartItem>): Promise<void>;
  deleteCartItem(id: string): Promise<void>;
  addToCart(userId: string, productId?: string, serviceId?: string, quantity?: number): Promise<string>;

  // Order operations
  createOrder(data: CreateOrder): Promise<string>;
  getOrderById(id: string): Promise<Order | null>;
  getUserOrders(userId: string): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  updateOrder(id: string, data: Partial<CreateOrder>): Promise<void>;
  deleteOrder(id: string): Promise<void>;

  // Order Item operations
  createOrderItem(data: CreateOrderItem): Promise<string>;
  getOrderItemById(id: string): Promise<OrderItem | null>;
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  getAllOrderItems(): Promise<OrderItem[]>;
  updateOrderItem(id: string, data: Partial<CreateOrderItem>): Promise<void>;
  deleteOrderItem(id: string): Promise<void>;

  // Service Booking operations
  createServiceBooking(data: CreateServiceBooking): Promise<string>;
  getServiceBookingById(id: string): Promise<ServiceBooking | null>;
  getUserServiceBookings(userId: string): Promise<ServiceBooking[]>;
  getAllServiceBookings(): Promise<ServiceBooking[]>;
  updateServiceBooking(id: string, data: Partial<CreateServiceBooking>): Promise<void>;
  deleteServiceBooking(id: string): Promise<void>;

  // Review operations
  createReview(data: CreateReview): Promise<string>;
  getReviewById(id: string): Promise<Review | null>;
  getProductReviews(productId: string): Promise<Review[]>;
  getServiceReviews(serviceId: string): Promise<Review[]>;
  getUserReviews(userId: string): Promise<Review[]>;
  updateReview(id: string, data: Partial<CreateReview>): Promise<void>;
  deleteReview(id: string): Promise<void>;

  // Wishlist operations
  createWishlistItem(data: CreateWishlistItem): Promise<string>;
  getWishlistItemById(id: string): Promise<WishlistItem | null>;
  getUserWishlist(userId: string): Promise<WishlistItem[]>;
  updateWishlistItem(id: string, data: Partial<CreateWishlistItem>): Promise<void>;
  deleteWishlistItem(id: string): Promise<void>;
}

export class FirestoreStorage implements IStorage {
  // User operations
  async createUser(data: CreateUser): Promise<string> {
    return userService.create(data);
  }

  async getUserById(id: string): Promise<User | null> {
    return userService.getById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await userService.findByField('email', email, 1);
    return users[0] || null;
  }

  async updateUser(id: string, data: Partial<CreateUser>): Promise<void> {
    return userService.update(id, data);
  }

  async deleteUser(id: string): Promise<void> {
    return userService.delete(id);
  }

  // Category operations
  async createCategory(data: CreateCategory): Promise<string> {
    return categoryService.create(data);
  }

  async getCategoryById(id: string): Promise<Category | null> {
    return categoryService.getById(id);
  }

  async getAllCategories(): Promise<Category[]> {
    try {
      return await categoryService.getAll();
    } catch (error) {
      // If Firestore is not configured, fall back to seeded data structure
      console.log('Using development category structure');
      return [];
    }
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const categories = await categoryService.findByField('slug', slug, 1);
    return categories[0] || null;
  }

  async updateCategory(id: string, data: Partial<CreateCategory>): Promise<void> {
    return categoryService.update(id, data);
  }

  async deleteCategory(id: string): Promise<void> {
    return categoryService.delete(id);
  }

  // Product operations
  async createProduct(data: CreateProduct): Promise<string> {
    return productService.create(data);
  }

  async getProductById(id: string): Promise<Product | null> {
    const product = await productService.getById(id);
    if (!product) {
      // Fallback: search in all products if direct lookup fails
      const allProducts = await this.getAllProducts();
      const foundProduct = allProducts.find(p => p.id === id);
      if (foundProduct) {
        return foundProduct;
      }
    }
    return product;
  }

  async getAllProducts(): Promise<Product[]> {
    try {
      return await productService.getAll(100);
    } catch (error) {
      console.log('Using development product structure');
      return [];
    }
  }

  async getFeaturedProducts(): Promise<Product[]> {
    try {
      return await ProductQueries.getFeaturedProducts();
    } catch (error) {
      console.log('Using development featured products structure');
      return [];
    }
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    try {
      return await productService.findByField('categoryId', categoryId);
    } catch (error) {
      console.log('Using development category products structure');
      return [];
    }
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const products = await productService.findByField('slug', slug, 1);
    return products[0] || null;
  }

  async searchProducts(query: string): Promise<Product[]> {
    try {
      return await ProductQueries.searchProducts(query);
    } catch (error) {
      console.log('Using development search structure');
      return [];
    }
  }

  async updateProduct(id: string, data: Partial<CreateProduct>): Promise<void> {
    return productService.update(id, data);
  }

  async deleteProduct(id: string): Promise<void> {
    return productService.delete(id);
  }

  // Service operations
  async createService(data: CreateService): Promise<string> {
    return serviceService.create(data);
  }

  async getServiceById(id: string): Promise<Service | null> {
    return serviceService.getById(id);
  }

  async getAllServices(): Promise<Service[]> {
    return serviceService.getAll(100);
  }

  async getServicesByCategory(categoryId: string): Promise<Service[]> {
    return serviceService.findByField('categoryId', categoryId);
  }

  async getServiceBySlug(slug: string): Promise<Service | null> {
    const services = await serviceService.findByField('slug', slug, 1);
    return services[0] || null;
  }

  async updateService(id: string, data: Partial<CreateService>): Promise<void> {
    return serviceService.update(id, data);
  }

  async deleteService(id: string): Promise<void> {
    return serviceService.delete(id);
  }

  // Cart operations
  async createCartItem(data: CreateCartItem): Promise<string> {
    return cartService.create(data);
  }

  async getCartItemById(id: string): Promise<CartItem | null> {
    return cartService.getById(id);
  }

  async getUserCartItems(userId: string): Promise<CartItem[]> {
    return CartQueries.getUserCart(userId);
  }

  async updateCartItem(id: string, data: Partial<CreateCartItem>): Promise<void> {
    return cartService.update(id, data);
  }

  async deleteCartItem(id: string): Promise<void> {
    return cartService.delete(id);
  }

  async addToCart(userId: string, productId?: string, serviceId?: string, quantity = 1): Promise<string> {
    return CartQueries.addToCart(userId, productId, serviceId, quantity);
  }

  // Order operations
  async createOrder(data: CreateOrder): Promise<string> {
    return orderService.create(data);
  }

  async getOrderById(id: string): Promise<Order | null> {
    return orderService.getById(id);
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return OrderQueries.getUserOrders(userId);
  }

  async getAllOrders(): Promise<Order[]> {
    return orderService.getAll(200);
  }

  async updateOrder(id: string, data: Partial<CreateOrder>): Promise<void> {
    return orderService.update(id, data);
  }

  async deleteOrder(id: string): Promise<void> {
    return orderService.delete(id);
  }

  // Order Item operations
  async createOrderItem(data: CreateOrderItem): Promise<string> {
    return orderItemService.create(data);
  }

  async getOrderItemById(id: string): Promise<OrderItem | null> {
    return orderItemService.getById(id);
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return OrderQueries.getOrderItems(orderId);
  }

  async getAllOrderItems(): Promise<OrderItem[]> {
    return orderItemService.getAll(1000);
  }

  async updateOrderItem(id: string, data: Partial<CreateOrderItem>): Promise<void> {
    return orderItemService.update(id, data);
  }

  async deleteOrderItem(id: string): Promise<void> {
    return orderItemService.delete(id);
  }

  // Service Booking operations
  async createServiceBooking(data: CreateServiceBooking): Promise<string> {
    return serviceBookingService.create(data);
  }

  async getServiceBookingById(id: string): Promise<ServiceBooking | null> {
    return serviceBookingService.getById(id);
  }

  async getUserServiceBookings(userId: string): Promise<ServiceBooking[]> {
    return serviceBookingService.findByField('userId', userId);
  }

  async getAllServiceBookings(): Promise<ServiceBooking[]> {
    return serviceBookingService.getAll(200);
  }

  async updateServiceBooking(id: string, data: Partial<CreateServiceBooking>): Promise<void> {
    return serviceBookingService.update(id, data);
  }

  async deleteServiceBooking(id: string): Promise<void> {
    return serviceBookingService.delete(id);
  }

  // Review operations
  async createReview(data: CreateReview): Promise<string> {
    return reviewService.create(data);
  }

  async getReviewById(id: string): Promise<Review | null> {
    return reviewService.getById(id);
  }

  async getProductReviews(productId: string): Promise<Review[]> {
    return ReviewQueries.getProductReviews(productId);
  }

  async getServiceReviews(serviceId: string): Promise<Review[]> {
    return ReviewQueries.getServiceReviews(serviceId);
  }

  async getUserReviews(userId: string): Promise<Review[]> {
    return reviewService.findByField('userId', userId);
  }

  async updateReview(id: string, data: Partial<CreateReview>): Promise<void> {
    return reviewService.update(id, data);
  }

  async deleteReview(id: string): Promise<void> {
    return reviewService.delete(id);
  }

  // Wishlist operations
  async createWishlistItem(data: CreateWishlistItem): Promise<string> {
    return wishlistService.create(data);
  }

  async getWishlistItemById(id: string): Promise<WishlistItem | null> {
    return wishlistService.getById(id);
  }

  async getUserWishlist(userId: string): Promise<WishlistItem[]> {
    return WishlistQueries.getUserWishlist(userId);
  }

  async updateWishlistItem(id: string, data: Partial<CreateWishlistItem>): Promise<void> {
    return wishlistService.update(id, data);
  }

  async deleteWishlistItem(id: string): Promise<void> {
    return wishlistService.delete(id);
  }
}

// Export the storage instance
export const storage = new FirestoreStorage();