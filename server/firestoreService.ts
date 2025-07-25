import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '@shared/firestore';
import { 
  User, CreateUser,
  Category, CreateCategory,
  Product, CreateProduct,
  Service, CreateService,
  CartItem, CreateCartItem,
  Order, CreateOrder,
  OrderItem, CreateOrderItem,
  ServiceBooking, CreateServiceBooking,
  Review, CreateReview,
  WishlistItem, CreateWishlistItem
} from '@shared/types';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  SERVICES: 'services',
  CART_ITEMS: 'cartItems',
  ORDERS: 'orders',
  ORDER_ITEMS: 'orderItems',
  SERVICE_BOOKINGS: 'serviceBookings',
  REVIEWS: 'reviews',
  WISHLIST_ITEMS: 'wishlistItems',
} as const;

// Helper function to convert Firestore timestamp to Date
export const convertTimestamp = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date();
};

// Helper function to convert data with timestamps
export const convertFirestoreData = <T>(data: any): T => {
  const converted = { ...data };
  if (converted.createdAt) {
    converted.createdAt = convertTimestamp(converted.createdAt);
  }
  if (converted.updatedAt) {
    converted.updatedAt = convertTimestamp(converted.updatedAt);
  }
  if (converted.scheduledDate) {
    converted.scheduledDate = convertTimestamp(converted.scheduledDate);
  }
  return converted as T;
};

// Generic CRUD operations
export class FirestoreService<T, C> {
  constructor(private collectionName: string) {}

  async create(data: C): Promise<string> {
    const now = new Date();
    const docData = {
      ...data,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };
    
    const docRef = await addDoc(collection(db, this.collectionName), docData);
    return docRef.id;
  }

  async getById(id: string): Promise<T | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = { id: docSnap.id, ...docSnap.data() };
      return convertFirestoreData<T>(data);
    }
    
    return null;
  }

  async getAll(limitCount = 50): Promise<T[]> {
    const q = query(
      collection(db, this.collectionName),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = { id: doc.id, ...doc.data() };
      return convertFirestoreData<T>(data);
    });
  }

  async update(id: string, data: Partial<C>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    const updateData = {
      ...data,
      updatedAt: Timestamp.fromDate(new Date()),
    };
    
    await updateDoc(docRef, updateData);
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  async findByField(field: string, value: any, limitCount = 50): Promise<T[]> {
    const q = query(
      collection(db, this.collectionName),
      where(field, '==', value),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = { id: doc.id, ...doc.data() };
      return convertFirestoreData<T>(data);
    });
  }
}

// Service instances
export const userService = new FirestoreService<User, CreateUser>(COLLECTIONS.USERS);
export const categoryService = new FirestoreService<Category, CreateCategory>(COLLECTIONS.CATEGORIES);
export const productService = new FirestoreService<Product, CreateProduct>(COLLECTIONS.PRODUCTS);
export const serviceService = new FirestoreService<Service, CreateService>(COLLECTIONS.SERVICES);
export const cartService = new FirestoreService<CartItem, CreateCartItem>(COLLECTIONS.CART_ITEMS);
export const orderService = new FirestoreService<Order, CreateOrder>(COLLECTIONS.ORDERS);
export const orderItemService = new FirestoreService<OrderItem, CreateOrderItem>(COLLECTIONS.ORDER_ITEMS);
export const serviceBookingService = new FirestoreService<ServiceBooking, CreateServiceBooking>(COLLECTIONS.SERVICE_BOOKINGS);
export const reviewService = new FirestoreService<Review, CreateReview>(COLLECTIONS.REVIEWS);
export const wishlistService = new FirestoreService<WishlistItem, CreateWishlistItem>(COLLECTIONS.WISHLIST_ITEMS);

// Specialized methods for complex queries
export class ProductQueries {
  static async getFeatured(limitCount = 10): Promise<Product[]> {
    const q = query(
      collection(db, COLLECTIONS.PRODUCTS),
      where('isFeatured', '==', true),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = { id: doc.id, ...doc.data() };
      return convertFirestoreData<Product>(data);
    });
  }

  static async getByCategory(categoryId: string, limitCount = 50): Promise<Product[]> {
    const q = query(
      collection(db, COLLECTIONS.PRODUCTS),
      where('categoryId', '==', categoryId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = { id: doc.id, ...doc.data() };
      return convertFirestoreData<Product>(data);
    });
  }

  static async search(searchTerm: string, limitCount = 50): Promise<Product[]> {
    // Note: Firestore doesn't support full-text search natively
    // This is a basic implementation - consider using Algolia or similar for production
    const q = query(
      collection(db, COLLECTIONS.PRODUCTS),
      where('isActive', '==', true),
      orderBy('name'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map(doc => {
      const data = { id: doc.id, ...doc.data() };
      return convertFirestoreData<Product>(data);
    });

    // Client-side filtering for search term
    const lowerSearchTerm = searchTerm.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(lowerSearchTerm) ||
      product.description?.toLowerCase().includes(lowerSearchTerm) ||
      product.shortDescription?.toLowerCase().includes(lowerSearchTerm)
    );
  }

  static async getFeaturedProducts(limitCount = 20): Promise<Product[]> {
    return this.getFeatured(limitCount);
  }

  static async searchProducts(searchTerm: string, limitCount = 50): Promise<Product[]> {
    return this.search(searchTerm, limitCount);
  }
}

export class CartQueries {
  static async getUserCart(userId: string): Promise<CartItem[]> {
    return cartService.findByField('userId', userId);
  }

  static async addToCart(userId: string, productId?: string, serviceId?: string, quantity = 1): Promise<string> {
    // Check if item already exists in cart
    const existingItems = await CartQueries.getUserCart(userId);
    const existingItem = existingItems.find(item => 
      item.productId === productId && item.serviceId === serviceId
    );

    if (existingItem) {
      // Update quantity
      await cartService.update(existingItem.id, { 
        quantity: existingItem.quantity + quantity 
      });
      return existingItem.id;
    } else {
      // Create new cart item
      return cartService.create({
        userId,
        productId,
        serviceId,
        quantity,
      });
    }
  }
}

export class OrderQueries {
  static async getUserOrders(userId: string): Promise<Order[]> {
    return orderService.findByField('userId', userId);
  }

  static async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return orderItemService.findByField('orderId', orderId);
  }
}

export class ReviewQueries {
  static async getProductReviews(productId: string): Promise<Review[]> {
    return reviewService.findByField('productId', productId);
  }

  static async getServiceReviews(serviceId: string): Promise<Review[]> {
    return reviewService.findByField('serviceId', serviceId);
  }
}

export class WishlistQueries {
  static async getUserWishlist(userId: string): Promise<WishlistItem[]> {
    return wishlistService.findByField('userId', userId);
  }
}