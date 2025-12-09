import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  setDoc,
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
  constructor(protected collectionName: string) {}

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
    // Simplified query without orderBy to avoid index requirements
    const q = query(
      collection(db, this.collectionName),
      where(field, '==', value),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const items = querySnapshot.docs.map(doc => {
      const data = { id: doc.id, ...doc.data() };
      return convertFirestoreData<T>(data);
    });
    
    // Sort by createdAt in memory to avoid Firestore index requirements
    return items.sort((a: any, b: any) => {
      const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt);
      const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt);
      return bDate.getTime() - aDate.getTime();
    });
  }
}

// Specialized User Service with Firebase UID as document ID
export class UserService extends FirestoreService<User, CreateUser> {
  constructor() {
    super(COLLECTIONS.USERS);
  }

  // Override create to use Firebase UID as document ID (prevents duplicates)
  async create(data: CreateUser): Promise<string> {
    const { setDoc, doc } = await import('firebase/firestore');
    const now = new Date();
    const docData = {
      ...data,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };
    
    // Use the provided ID (Firebase UID) as the document ID
    const docRef = doc(db, this.collectionName, data.id);
    await setDoc(docRef, docData);
    return data.id;
  }

  // Ensure getById uses the same logic
  async getById(id: string): Promise<User | null> {
    const { getDoc, doc } = await import('firebase/firestore');
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = { id: docSnap.id, ...docSnap.data() };
      return convertFirestoreData<User>(data);
    }
    
    return null;
  }
}

// Service instances
export const userService = new UserService();
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
    try {
      // Try optimized query with compound indexes first
      const q = query(
        collection(db, COLLECTIONS.PRODUCTS),
        where('isFeatured', '==', true),
        where('isActive', '==', true),
        where('stock', '>', 0), // Prioritize in-stock items
        orderBy('stock', 'desc'),
        orderBy('rating', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map(doc => {
        const data = { id: doc.id, ...doc.data() };
        return convertFirestoreData<Product>(data);
      });
      
      console.log(`[PRODUCTS] ✅ Retrieved ${products.length} featured products with optimized query`);
      return products;
      
    } catch (error) {
      console.warn('[PRODUCTS] ⚠️ Optimized query failed, falling back to basic query:', error);
      
      // Fallback to basic query without compound indexes
      const basicQuery = query(
        collection(db, COLLECTIONS.PRODUCTS),
        where('isFeatured', '==', true),
        where('isActive', '==', true),
        limit(limitCount * 2) // Get more for client-side sorting
      );
      
      const querySnapshot = await getDocs(basicQuery);
      const products = querySnapshot.docs.map(doc => {
        const data = { id: doc.id, ...doc.data() };
        return convertFirestoreData<Product>(data);
      });
      
      // Client-side sorting with performance optimization
      return products
        .sort((a, b) => {
          // Prioritize in-stock products
          if (a.stock > 0 && b.stock === 0) return -1;
          if (a.stock === 0 && b.stock > 0) return 1;
          
          // Then by rating (higher is better)
          const ratingDiff = (b.rating || 0) - (a.rating || 0);
          if (Math.abs(ratingDiff) > 0.1) return ratingDiff;
          
          // Finally by creation date (newer first)
          return b.createdAt.getTime() - a.createdAt.getTime();
        })
        .slice(0, limitCount);
    }
  }

  static async getByCategory(categoryId: string, limitCount = 50, sortBy: 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'featured' = 'newest'): Promise<Product[]> {
    try {
      let q;
      
      // Build optimized queries based on sort preference
      switch (sortBy) {
        case 'price_asc':
          q = query(
            collection(db, COLLECTIONS.PRODUCTS),
            where('categoryId', '==', categoryId),
            where('isActive', '==', true),
            orderBy('price', 'asc'),
            orderBy('rating', 'desc'),
            limit(limitCount)
          );
          break;
          
        case 'price_desc':
          q = query(
            collection(db, COLLECTIONS.PRODUCTS),
            where('categoryId', '==', categoryId),
            where('isActive', '==', true),
            orderBy('price', 'desc'),
            orderBy('rating', 'desc'),
            limit(limitCount)
          );
          break;
          
        case 'rating':
          q = query(
            collection(db, COLLECTIONS.PRODUCTS),
            where('categoryId', '==', categoryId),
            where('isActive', '==', true),
            orderBy('rating', 'desc'),
            orderBy('reviewCount', 'desc'),
            limit(limitCount)
          );
          break;
          
        case 'featured':
          q = query(
            collection(db, COLLECTIONS.PRODUCTS),
            where('categoryId', '==', categoryId),
            where('isActive', '==', true),
            where('isFeatured', '==', true),
            orderBy('rating', 'desc'),
            limit(limitCount)
          );
          break;
          
        case 'newest':
        default:
          q = query(
            collection(db, COLLECTIONS.PRODUCTS),
            where('categoryId', '==', categoryId),
            where('isActive', '==', true),
            orderBy('createdAt', 'desc'),
            orderBy('rating', 'desc'),
            limit(limitCount)
          );
          break;
      }
      
      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map(doc => {
        const data = { id: doc.id, ...doc.data() };
        return convertFirestoreData<Product>(data);
      });
      
      console.log(`[PRODUCTS] ✅ Retrieved ${products.length} products for category ${categoryId} sorted by ${sortBy}`);
      return products;
      
    } catch (error) {
      console.warn(`[PRODUCTS] ⚠️ Optimized category query failed for ${sortBy}, falling back:`, error);
      
      // Fallback to basic query with client-side sorting
      const basicQuery = query(
        collection(db, COLLECTIONS.PRODUCTS),
        where('categoryId', '==', categoryId),
        where('isActive', '==', true),
        limit(limitCount * 2) // Get more for sorting
      );
      
      const querySnapshot = await getDocs(basicQuery);
      const products = querySnapshot.docs.map(doc => {
        const data = { id: doc.id, ...doc.data() };
        return convertFirestoreData<Product>(data);
      });
      
      // Client-side sorting as fallback
      const sortedProducts = products.sort((a, b) => {
        switch (sortBy) {
          case 'price_asc':
            return a.price - b.price;
          case 'price_desc':
            return b.price - a.price;
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'featured':
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;
            return (b.rating || 0) - (a.rating || 0);
          case 'newest':
          default:
            return b.createdAt.getTime() - a.createdAt.getTime();
        }
      });
      
      return sortedProducts.slice(0, limitCount);
    }
  }

  static async search(searchTerm: string, limitCount = 50): Promise<Product[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return this.getFeaturedProducts(limitCount);
    }

    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    
    // Multiple parallel queries for better search coverage
    const searchPromises = [
      // Search by name prefix (most efficient with Firestore)
      this.searchByNamePrefix(lowerSearchTerm, Math.ceil(limitCount / 3)),
      // Search all active products for comprehensive matching
      this.searchAllProducts(lowerSearchTerm, limitCount),
      // Search by category if term might be a category
      this.searchByCategory(lowerSearchTerm, Math.ceil(limitCount / 4))
    ];

    const [prefixResults, allResults, categoryResults] = await Promise.all(searchPromises);
    
    // Combine and deduplicate results with intelligent ranking
    const combinedResults = new Map<string, { product: Product; score: number }>();
    
    // Score prefix matches highest (exact name matches)
    prefixResults.forEach(product => {
      const score = this.calculateSearchScore(product, lowerSearchTerm, 'prefix');
      combinedResults.set(product.id, { product, score });
    });
    
    // Add comprehensive search results with lower base score
    allResults.forEach(product => {
      if (!combinedResults.has(product.id)) {
        const score = this.calculateSearchScore(product, lowerSearchTerm, 'comprehensive');
        combinedResults.set(product.id, { product, score });
      }
    });
    
    // Add category matches with medium score
    categoryResults.forEach(product => {
      if (!combinedResults.has(product.id)) {
        const score = this.calculateSearchScore(product, lowerSearchTerm, 'category');
        combinedResults.set(product.id, { product, score });
      }
    });
    
    // Sort by score and return top results
    return Array.from(combinedResults.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limitCount)
      .map(result => result.product);
  }
  
  private static async searchByNamePrefix(searchTerm: string, limitCount: number): Promise<Product[]> {
    // Firestore range query for name prefix matching
    const endTerm = searchTerm + '\\uf8ff';
    const q = query(
      collection(db, COLLECTIONS.PRODUCTS),
      where('isActive', '==', true),
      where('searchableName', '>=', searchTerm),
      where('searchableName', '<=', endTerm),
      limit(limitCount)
    );
    
    try {
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = { id: doc.id, ...doc.data() };
        return convertFirestoreData<Product>(data);
      });
    } catch (error) {
      // Fallback if searchableName field doesn't exist
      console.warn('[SEARCH] searchableName field not indexed, falling back to basic search');
      return [];
    }
  }
  
  private static async searchAllProducts(searchTerm: string, limitCount: number): Promise<Product[]> {
    const q = query(
      collection(db, COLLECTIONS.PRODUCTS),
      where('isActive', '==', true),
      limit(limitCount * 2) // Get more to filter client-side
    );
    
    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map(doc => {
      const data = { id: doc.id, ...doc.data() };
      return convertFirestoreData<Product>(data);
    });

    // Enhanced client-side filtering with fuzzy matching
    return products.filter(product => {
      const name = product.name.toLowerCase();
      const description = product.description?.toLowerCase() || '';
      const shortDescription = product.shortDescription?.toLowerCase() || '';
      const categoryId = product.categoryId?.toLowerCase() || '';
      
      // Exact matches get priority
      if (name.includes(searchTerm) || 
          description.includes(searchTerm) || 
          shortDescription.includes(searchTerm)) {
        return true;
      }
      
      // Fuzzy word matching for better UX
      const searchWords = searchTerm.split(' ').filter(word => word.length > 2);
      const productText = `${name} ${description} ${shortDescription} ${categoryId}`;
      
      return searchWords.some(word => productText.includes(word));
    }).slice(0, limitCount);
  }
  
  private static async searchByCategory(searchTerm: string, limitCount: number): Promise<Product[]> {
    try {
      // Try to find matching category
      const categoryQuery = query(
        collection(db, COLLECTIONS.CATEGORIES),
        where('isActive', '==', true)
      );
      
      const categorySnapshot = await getDocs(categoryQuery);
      const matchingCategories = categorySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(cat => (cat as any).name.toLowerCase().includes(searchTerm))
        .map(cat => cat.id);
      
      if (matchingCategories.length === 0) {
        return [];
      }
      
      // Get products from matching categories
      const productQuery = query(
        collection(db, COLLECTIONS.PRODUCTS),
        where('isActive', '==', true),
        where('categoryId', 'in', matchingCategories.slice(0, 10)), // Firestore limit
        limit(limitCount)
      );
      
      const productSnapshot = await getDocs(productQuery);
      return productSnapshot.docs.map(doc => {
        const data = { id: doc.id, ...doc.data() };
        return convertFirestoreData<Product>(data);
      });
    } catch (error) {
      console.warn('[SEARCH] Category search failed:', error);
      return [];
    }
  }
  
  private static calculateSearchScore(product: Product, searchTerm: string, matchType: 'prefix' | 'comprehensive' | 'category'): number {
    let score = 0;
    const name = product.name.toLowerCase();
    const description = product.description?.toLowerCase() || '';
    
    // Base score by match type
    switch (matchType) {
      case 'prefix': score += 100; break;
      case 'comprehensive': score += 50; break;
      case 'category': score += 75; break;
    }
    
    // Boost exact name matches
    if (name === searchTerm) score += 200;
    else if (name.startsWith(searchTerm)) score += 150;
    else if (name.includes(searchTerm)) score += 100;
    
    // Boost popular/featured products
    if (product.isFeatured) score += 25;
    if (product.rating && product.rating > 4) score += 15;
    if (product.stock && product.stock > 10) score += 10;
    
    // Penalize out of stock
    if (product.stock === 0) score -= 50;
    
    return score;
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
      // Create new cart item - filter out undefined values for Firebase
      const cartItemData: any = {
        userId,
        quantity,
      };
      
      if (productId !== undefined) {
        cartItemData.productId = productId;
      }
      
      if (serviceId !== undefined) {
        cartItemData.serviceId = serviceId;
      }
      
      return cartService.create(cartItemData);
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