// Firestore storage service for Vercel serverless functions
import { initializeFirebaseAdmin, admin } from './_firebase-setup';
import type { 
  User, Product, Category, Service, Order, Review, 
  EnhancedCartItem, WishlistItem 
} from '../shared/types';
import type { Cart } from '../shared/cart-types';

export class VercelFirestoreService {
  private db: admin.firestore.Firestore;
  
  constructor() {
    initializeFirebaseAdmin();
    this.db = admin.firestore();
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    const snapshot = await this.db.collection('products').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  }

  async getProductById(id: string): Promise<Product | null> {
    const doc = await this.db.collection('products').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as Product : null;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const snapshot = await this.db
      .collection('products')
      .where('isFeatured', '==', true)
      .limit(20)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  }

  // Categories  
  async getAllCategories(): Promise<Category[]> {
    const snapshot = await this.db.collection('categories').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
  }

  async getCategoryById(id: string): Promise<Category | null> {
    const doc = await this.db.collection('categories').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as Category : null;
  }

  // Services
  async getAllServices(): Promise<Service[]> {
    const snapshot = await this.db.collection('services').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
  }

  async getServiceById(id: string): Promise<Service | null> {
    const doc = await this.db.collection('services').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as Service : null;
  }

  // Cart
  async getUserCart(userId: string): Promise<Cart | null> {
    const doc = await this.db.collection('carts').doc(userId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as Cart : null;
  }

  async updateUserCart(userId: string, cartData: Partial<Cart>): Promise<void> {
    await this.db.collection('carts').doc(userId).set(cartData, { merge: true });
  }

  // Wishlist
  async getUserWishlist(userId: string): Promise<WishlistItem[]> {
    const snapshot = await this.db
      .collection('wishlists')
      .where('userId', '==', userId)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WishlistItem));
  }

  // Users
  async getUserById(userId: string): Promise<User | null> {
    const doc = await this.db.collection('users').doc(userId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as User : null;
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    await this.db.collection('users').doc(userId).set(userData, { merge: true });
  }

  // Orders
  async getUserOrders(userId: string): Promise<Order[]> {
    const snapshot = await this.db
      .collection('orders')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
  }

  async createOrder(orderData: any): Promise<string> {
    const docRef = await this.db.collection('orders').add({
      ...orderData,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });
    return docRef.id;
  }

  // Reviews
  async getProductReviews(productId: string): Promise<Review[]> {
    const snapshot = await this.db
      .collection('reviews')
      .where('productId', '==', productId)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
  }
}

export const storage = new VercelFirestoreService();