/**
 * Firebase Admin Firestore Service
 * 
 * This module provides Firestore operations using the Firebase Admin SDK,
 * which bypasses security rules entirely. This is the correct architecture
 * for server-side operations, enabling:
 * 
 * - Strict security rules for client-side access
 * - Full access from backend without authentication context issues
 * - Proper separation of concerns (frontend can only read, backend can write)
 * 
 * @see docs/ARCHITECTURE_DECISION.md
 */

import admin from 'firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
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
    WishlistItem, CreateWishlistItem,
    Address, CreateAddress,
    OrderHistory, CreateOrderHistory,
    OrderStatus
} from '@shared/types';

/**
 * Get Firestore Admin instance
 * Admin SDK must be initialized before calling this
 */
function getDb() {
    return admin.firestore();
}

// ═══════════════════════════════════════════════════════════════════════════
// COLLECTION NAMES
// ═══════════════════════════════════════════════════════════════════════════

export const COLLECTIONS = {
    USERS: 'users',
    CATEGORIES: 'categories',
    PRODUCTS: 'products',
    SERVICES: 'services',
    CART_ITEMS: 'cartItems',
    ORDERS: 'orders',
    ORDER_ITEMS: 'orderItems',
    ORDER_HISTORY: 'orderHistory',
    SERVICE_BOOKINGS: 'serviceBookings',
    REVIEWS: 'reviews',
    WISHLIST_ITEMS: 'wishlistItems',
    ADDRESSES: 'addresses',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert Firestore Timestamp to JavaScript Date
 */
export const convertTimestamp = (timestamp: any): Date => {
    if (timestamp?.toDate) {
        return timestamp.toDate();
    }
    if (timestamp instanceof Date) {
        return timestamp;
    }
    if (typeof timestamp === 'string') {
        return new Date(timestamp);
    }
    return new Date();
};

/**
 * Convert Firestore document data with timestamps
 */
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

// ═══════════════════════════════════════════════════════════════════════════
// GENERIC FIRESTORE SERVICE (ADMIN SDK)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generic CRUD operations using Firebase Admin SDK
 * Bypasses security rules for server-side operations
 */
export class AdminFirestoreService<T, C> {
    constructor(protected collectionName: string) { }

    /**
     * Create a new document with auto-generated ID
     */
    async create(data: C): Promise<string> {
        const db = getDb();
        const now = Timestamp.now();
        const docData = {
            ...data,
            createdAt: now,
            updatedAt: now,
        };

        const docRef = await db.collection(this.collectionName).add(docData);
        return docRef.id;
    }

    /**
     * Create or update a document with specific ID
     */
    async createWithId(id: string, data: C): Promise<string> {
        const db = getDb();
        const now = Timestamp.now();
        const docData = {
            ...data,
            createdAt: now,
            updatedAt: now,
        };

        await db.collection(this.collectionName).doc(id).set(docData);
        return id;
    }

    /**
     * Get a document by ID
     */
    async getById(id: string): Promise<T | null> {
        const db = getDb();
        const docRef = db.collection(this.collectionName).doc(id);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            const data = { id: docSnap.id, ...docSnap.data() };
            return convertFirestoreData<T>(data);
        }

        return null;
    }

    /**
     * Get all documents with optional limit
     */
    async getAll(limitCount = 50): Promise<T[]> {
        const db = getDb();
        const querySnapshot = await db
            .collection(this.collectionName)
            .orderBy('createdAt', 'desc')
            .limit(limitCount)
            .get();

        return querySnapshot.docs.map(doc => {
            const data = { id: doc.id, ...doc.data() };
            return convertFirestoreData<T>(data);
        });
    }

    /**
     * Update a document
     */
    async update(id: string, data: Partial<C>): Promise<void> {
        const db = getDb();
        const docRef = db.collection(this.collectionName).doc(id);
        const updateData = {
            ...data,
            updatedAt: Timestamp.now(),
        };

        await docRef.update(updateData);
    }

    /**
     * Delete a document
     */
    async delete(id: string): Promise<void> {
        const db = getDb();
        const docRef = db.collection(this.collectionName).doc(id);
        await docRef.delete();
    }

    /**
     * Find documents by field value
     */
    async findByField(field: string, value: any, limitCount = 50): Promise<T[]> {
        const db = getDb();
        const querySnapshot = await db
            .collection(this.collectionName)
            .where(field, '==', value)
            .limit(limitCount)
            .get();

        const items = querySnapshot.docs.map(doc => {
            const data = { id: doc.id, ...doc.data() };
            return convertFirestoreData<T>(data);
        });

        // Sort by createdAt in memory
        return items.sort((a: any, b: any) => {
            const aDate = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
            const bDate = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
            return bDate.getTime() - aDate.getTime();
        });
    }

    /**
     * Find documents matching multiple conditions
     */
    async findByMultiple(conditions: Array<{ field: string; op: FirebaseFirestore.WhereFilterOp; value: any }>, limitCount = 50): Promise<T[]> {
        const db = getDb();
        let query: FirebaseFirestore.Query = db.collection(this.collectionName);

        for (const condition of conditions) {
            query = query.where(condition.field, condition.op, condition.value);
        }

        const querySnapshot = await query.limit(limitCount).get();

        return querySnapshot.docs.map(doc => {
            const data = { id: doc.id, ...doc.data() };
            return convertFirestoreData<T>(data);
        });
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// SPECIALIZED USER SERVICE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * User Service with Firebase UID as document ID
 */
export class AdminUserService extends AdminFirestoreService<User, CreateUser> {
    constructor() {
        super(COLLECTIONS.USERS);
    }

    /**
     * Create user with Firebase UID as document ID
     */
    async create(data: CreateUser): Promise<string> {
        const db = getDb();
        const now = Timestamp.now();
        const docData = {
            ...data,
            createdAt: now,
            updatedAt: now,
        };

        // Use the provided ID (Firebase UID) as the document ID
        const docRef = db.collection(this.collectionName).doc(data.id);
        await docRef.set(docData);
        return data.id;
    }

    /**
     * Get user by Firebase UID
     */
    async getById(id: string): Promise<User | null> {
        const db = getDb();
        const docRef = db.collection(this.collectionName).doc(id);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            const data = { id: docSnap.id, ...docSnap.data() };
            return convertFirestoreData<User>(data);
        }

        return null;
    }

    /**
     * Find user by email
     */
    async getByEmail(email: string): Promise<User | null> {
        const users = await this.findByField('email', email, 1);
        return users[0] || null;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE INSTANCES
// ═══════════════════════════════════════════════════════════════════════════

export const adminUserService = new AdminUserService();
export const adminCategoryService = new AdminFirestoreService<Category, CreateCategory>(COLLECTIONS.CATEGORIES);
export const adminProductService = new AdminFirestoreService<Product, CreateProduct>(COLLECTIONS.PRODUCTS);
export const adminServiceService = new AdminFirestoreService<Service, CreateService>(COLLECTIONS.SERVICES);
export const adminCartService = new AdminFirestoreService<CartItem, CreateCartItem>(COLLECTIONS.CART_ITEMS);
export const adminOrderService = new AdminFirestoreService<Order, CreateOrder>(COLLECTIONS.ORDERS);
export const adminOrderItemService = new AdminFirestoreService<OrderItem, CreateOrderItem>(COLLECTIONS.ORDER_ITEMS);
export const adminServiceBookingService = new AdminFirestoreService<ServiceBooking, CreateServiceBooking>(COLLECTIONS.SERVICE_BOOKINGS);
export const adminReviewService = new AdminFirestoreService<Review, CreateReview>(COLLECTIONS.REVIEWS);
export const adminWishlistService = new AdminFirestoreService<WishlistItem, CreateWishlistItem>(COLLECTIONS.WISHLIST_ITEMS);
export const adminAddressService = new AdminFirestoreService<Address, CreateAddress>(COLLECTIONS.ADDRESSES);

// ═══════════════════════════════════════════════════════════════════════════
// SPECIALIZED QUERY CLASSES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Product-specific queries
 */
export class AdminProductQueries {
    static async getFeatured(limitCount = 10): Promise<Product[]> {
        const db = getDb();

        try {
            const querySnapshot = await db
                .collection(COLLECTIONS.PRODUCTS)
                .where('isFeatured', '==', true)
                .where('isActive', '==', true)
                .limit(limitCount)
                .get();

            const products = querySnapshot.docs.map(doc => {
                const data = { id: doc.id, ...doc.data() };
                return convertFirestoreData<Product>(data);
            });

            // Sort by stock and rating in memory
            return products.sort((a, b) => {
                if (a.stock > 0 && b.stock === 0) return -1;
                if (a.stock === 0 && b.stock > 0) return 1;
                return (b.rating || 0) - (a.rating || 0);
            });
        } catch (error) {
            console.warn('[AdminProducts] Featured query failed:', error);
            return [];
        }
    }

    static async getByCategory(categoryId: string, limitCount = 50): Promise<Product[]> {
        const db = getDb();

        try {
            const querySnapshot = await db
                .collection(COLLECTIONS.PRODUCTS)
                .where('categoryId', '==', categoryId)
                .where('isActive', '==', true)
                .limit(limitCount)
                .get();

            return querySnapshot.docs.map(doc => {
                const data = { id: doc.id, ...doc.data() };
                return convertFirestoreData<Product>(data);
            });
        } catch (error) {
            console.warn('[AdminProducts] Category query failed:', error);
            return [];
        }
    }

    static async search(searchTerm: string, limitCount = 50): Promise<Product[]> {
        if (!searchTerm?.trim()) {
            return this.getFeatured(limitCount);
        }

        const db = getDb();
        const lowerSearchTerm = searchTerm.toLowerCase().trim();

        try {
            // Get all active products and filter client-side
            const querySnapshot = await db
                .collection(COLLECTIONS.PRODUCTS)
                .where('isActive', '==', true)
                .limit(limitCount * 2)
                .get();

            const products = querySnapshot.docs.map(doc => {
                const data = { id: doc.id, ...doc.data() };
                return convertFirestoreData<Product>(data);
            });

            // Client-side filtering
            return products.filter(product => {
                const name = product.name.toLowerCase();
                const description = product.description?.toLowerCase() || '';
                const shortDescription = product.shortDescription?.toLowerCase() || '';

                return name.includes(lowerSearchTerm) ||
                    description.includes(lowerSearchTerm) ||
                    shortDescription.includes(lowerSearchTerm);
            }).slice(0, limitCount);
        } catch (error) {
            console.warn('[AdminProducts] Search failed:', error);
            return [];
        }
    }

    // Alias methods for compatibility with existing storage.ts
    static async getFeaturedProducts(limitCount = 10): Promise<Product[]> {
        return this.getFeatured(limitCount);
    }

    static async searchProducts(searchTerm: string, limitCount = 50): Promise<Product[]> {
        return this.search(searchTerm, limitCount);
    }
}

/**
 * Cart-specific queries
 */
export class AdminCartQueries {
    static async getUserCart(userId: string): Promise<CartItem[]> {
        return adminCartService.findByField('userId', userId);
    }

    static async addToCart(userId: string, productId?: string, serviceId?: string, quantity = 1): Promise<string> {
        const existingItems = await this.getUserCart(userId);
        const existingItem = existingItems.find(item =>
            item.productId === productId && item.serviceId === serviceId
        );

        if (existingItem) {
            await adminCartService.update(existingItem.id, {
                quantity: existingItem.quantity + quantity
            });
            return existingItem.id;
        } else {
            const cartItemData: any = { userId, quantity };
            if (productId) cartItemData.productId = productId;
            if (serviceId) cartItemData.serviceId = serviceId;
            return adminCartService.create(cartItemData);
        }
    }

    static async clearCart(userId: string): Promise<void> {
        const items = await this.getUserCart(userId);
        for (const item of items) {
            await adminCartService.delete(item.id);
        }
    }
}

// Order History Service
export const adminOrderHistoryService = new AdminFirestoreService<OrderHistory, CreateOrderHistory>(COLLECTIONS.ORDER_HISTORY);

/**
 * Order-specific queries - Enhanced with stats, filtering, and history
 */
export class AdminOrderQueries {
    static async getUserOrders(userId: string): Promise<Order[]> {
        return adminOrderService.findByField('userId', userId);
    }

    static async getOrderItems(orderId: string): Promise<OrderItem[]> {
        return adminOrderItemService.findByField('orderId', orderId);
    }

    static async getOrderHistory(orderId: string): Promise<OrderHistory[]> {
        return adminOrderHistoryService.findByField('orderId', orderId);
    }

    /**
     * Get order counts by status for admin dashboard
     */
    static async getOrderStats(): Promise<Record<string, number>> {
        const db = getDb();
        const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        const stats: Record<string, number> = {};

        for (const status of statuses) {
            const snapshot = await db
                .collection(COLLECTIONS.ORDERS)
                .where('status', '==', status)
                .count()
                .get();
            stats[status] = snapshot.data().count;
        }

        return stats;
    }

    /**
     * Get orders with filtering and pagination
     */
    static async getOrdersWithFilters(options: {
        status?: string;
        startDate?: Date;
        endDate?: Date;
        search?: string;
        limit?: number;
        offset?: number;
    }): Promise<Order[]> {
        const db = getDb();
        const { status, startDate, endDate, limit = 20, offset = 0 } = options;

        let query: FirebaseFirestore.Query = db.collection(COLLECTIONS.ORDERS);

        // Filter by status
        if (status && status !== 'all') {
            query = query.where('status', '==', status);
        }

        // Filter by date range
        if (startDate) {
            query = query.where('createdAt', '>=', Timestamp.fromDate(startDate));
        }
        if (endDate) {
            query = query.where('createdAt', '<=', Timestamp.fromDate(endDate));
        }

        // Order by createdAt descending
        query = query.orderBy('createdAt', 'desc');

        // Pagination
        query = query.limit(limit + offset);

        const snapshot = await query.get();
        const orders = snapshot.docs.slice(offset).map(doc => {
            const data = { id: doc.id, ...doc.data() };
            return convertFirestoreData<Order>(data);
        });

        return orders;
    }
}

/**
 * Review-specific queries
 */
export class AdminReviewQueries {
    static async getProductReviews(productId: string): Promise<Review[]> {
        return adminReviewService.findByField('productId', productId);
    }

    static async getServiceReviews(serviceId: string): Promise<Review[]> {
        return adminReviewService.findByField('serviceId', serviceId);
    }
}


/**
 * Wishlist-specific queries
 */
export class AdminWishlistQueries {
    static async getUserWishlist(userId: string): Promise<WishlistItem[]> {
        return adminWishlistService.findByField('userId', userId);
    }
}

/**
 * Address-specific queries
 */
export class AdminAddressQueries {
    static async getUserAddresses(userId: string): Promise<Address[]> {
        return adminAddressService.findByField('userId', userId);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// TRANSACTIONAL ORDER OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

import {
    generateOrderNumber,
    validateTransition,
    calculateOrderTotals,
} from './lib/orderStateMachine';

export interface OrderItemInput {
    productId: string;
    productName: string;
    productSku?: string;
    productImageUrl?: string;
    unitPrice: number;
    quantity: number;
}

export interface CreateOrderInput {
    userId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    shippingAddress: {
        firstName: string;
        lastName?: string;
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country?: string;
        phone?: string;
    };
    items: OrderItemInput[];
}

export interface CreateOrderResult {
    orderId: string;
    orderNumber: string;
}

/**
 * Create order with atomic stock validation and decrement
 * Uses Firestore transaction to ensure consistency
 * 
 * @throws Error if any product has insufficient stock
 */
export async function createOrderWithTransaction(
    input: CreateOrderInput
): Promise<CreateOrderResult> {
    const db = getDb();

    return db.runTransaction(async (transaction) => {
        const { items, userId, customerName, customerEmail, customerPhone, shippingAddress } = input;

        // Step 1: Validate all stock (read phase - must happen first in transaction)
        const stockChecks: Array<{
            ref: FirebaseFirestore.DocumentReference;
            productName: string;
            currentStock: number;
            requestedQuantity: number;
        }> = [];

        for (const item of items) {
            const productRef = db.collection(COLLECTIONS.PRODUCTS).doc(item.productId);
            const productSnap = await transaction.get(productRef);

            if (!productSnap.exists) {
                throw new Error(`Product "${item.productName}" no longer exists.`);
            }

            const productData = productSnap.data()!;
            const currentStock = productData.stock ?? 0;

            if (currentStock < item.quantity) {
                throw new Error(
                    `Insufficient stock for "${item.productName}": ` +
                    `requested ${item.quantity}, available ${currentStock}.`
                );
            }

            stockChecks.push({
                ref: productRef,
                productName: item.productName,
                currentStock,
                requestedQuantity: item.quantity,
            });
        }

        // Step 2: Calculate totals
        const itemTotals = items.map(item => item.unitPrice * item.quantity);
        const { subtotal, tax, shippingCost, total } = calculateOrderTotals(itemTotals);

        // Step 3: Generate unique order number
        const orderNumber = generateOrderNumber();

        // Step 4: Create order document (write phase)
        const orderRef = db.collection(COLLECTIONS.ORDERS).doc();
        transaction.set(orderRef, {
            orderNumber,
            userId,
            customerName,
            customerEmail,
            customerPhone: customerPhone || shippingAddress.phone || '',
            status: 'pending',
            subtotal,
            tax,
            shippingCost,
            total,
            shippingAddress: {
                ...shippingAddress,
                country: shippingAddress.country || 'India',
            },
            paymentMethod: 'cod',
            paymentStatus: 'pending',
            itemCount: items.length,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });

        // Step 5: Create order items with product snapshots (write phase)
        for (const item of items) {
            const itemRef = db.collection(COLLECTIONS.ORDER_ITEMS).doc();
            transaction.set(itemRef, {
                orderId: orderRef.id,
                productId: item.productId,
                productName: item.productName,
                productSku: item.productSku || null,
                productImageUrl: item.productImageUrl || null,
                unitPrice: item.unitPrice,
                quantity: item.quantity,
                totalPrice: item.unitPrice * item.quantity,
                discountAmount: 0,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            });
        }

        // Step 6: Decrement stock atomically (write phase)
        for (const check of stockChecks) {
            transaction.update(check.ref, {
                stock: FieldValue.increment(-check.requestedQuantity),
                updatedAt: FieldValue.serverTimestamp(),
            });
        }

        // Step 7: Log initial status in order history
        const historyRef = db.collection(COLLECTIONS.ORDER_HISTORY).doc();
        transaction.set(historyRef, {
            orderId: orderRef.id,
            previousStatus: null,
            newStatus: 'pending',
            changedBy: 'system',
            changedByRole: 'system',
            reason: 'Order created',
            createdAt: FieldValue.serverTimestamp(),
        });

        return { orderId: orderRef.id, orderNumber };
    });
}

/**
 * Update order status with state machine validation and history logging
 * Restores stock if order is cancelled
 * 
 * @throws Error if transition is invalid or order already in terminal state
 */
export async function updateOrderStatusWithTransaction(
    orderId: string,
    newStatus: OrderStatus,
    changedBy: { userId: string; email?: string; role: 'admin' | 'customer' | 'system' },
    reason?: string
): Promise<Order> {
    const db = getDb();

    await db.runTransaction(async (transaction) => {
        const orderRef = db.collection(COLLECTIONS.ORDERS).doc(orderId);
        const orderSnap = await transaction.get(orderRef);

        if (!orderSnap.exists) {
            throw new Error('Order not found.');
        }

        const orderData = orderSnap.data()!;
        const currentStatus = orderData.status as OrderStatus;

        // Double-cancel guard: Check inside transaction to prevent race conditions
        if (currentStatus === 'cancelled') {
            throw new Error('Order is already cancelled. No changes allowed.');
        }

        if (currentStatus === 'delivered') {
            throw new Error('Delivered orders cannot be modified.');
        }

        // Validate state transition
        validateTransition(currentStatus, newStatus);

        // Prepare update data
        const updateData: Record<string, any> = {
            status: newStatus,
            updatedAt: FieldValue.serverTimestamp(),
        };

        // If cancelling, record metadata and restore stock
        if (newStatus === 'cancelled') {
            updateData.cancelledAt = FieldValue.serverTimestamp();
            updateData.cancelledBy = changedBy.userId;
            updateData.cancelledByRole = changedBy.role;
            updateData.cancellationReason = reason || 'No reason provided';

            // Restore stock for cancelled orders
            const orderItemsSnap = await db
                .collection(COLLECTIONS.ORDER_ITEMS)
                .where('orderId', '==', orderId)
                .get();

            for (const itemDoc of orderItemsSnap.docs) {
                const item = itemDoc.data();
                if (item.productId) {
                    const productRef = db.collection(COLLECTIONS.PRODUCTS).doc(item.productId);
                    transaction.update(productRef, {
                        stock: FieldValue.increment(item.quantity),
                        updatedAt: FieldValue.serverTimestamp(),
                    });
                }
            }
        }

        // Update order
        transaction.update(orderRef, updateData);

        // Log status change in history
        const historyRef = db.collection(COLLECTIONS.ORDER_HISTORY).doc();
        transaction.set(historyRef, {
            orderId,
            previousStatus: currentStatus,
            newStatus,
            changedBy: changedBy.userId,
            changedByEmail: changedBy.email || null,
            changedByRole: changedBy.role,
            reason: reason || null,
            createdAt: FieldValue.serverTimestamp(),
        });
    });

    // Fetch and return updated order
    const updatedOrder = await adminOrderService.getById(orderId);
    if (!updatedOrder) {
        throw new Error('Failed to fetch updated order.');
    }
    return updatedOrder;
}

/**
 * Get full order details with items and history
 */
export async function getOrderDetails(orderId: string): Promise<{
    order: Order;
    items: OrderItem[];
    history: OrderHistory[];
} | null> {
    const order = await adminOrderService.getById(orderId);
    if (!order) return null;

    const [items, history] = await Promise.all([
        AdminOrderQueries.getOrderItems(orderId),
        AdminOrderQueries.getOrderHistory(orderId),
    ]);

    return { order, items, history };
}

console.log('✅ Firebase Admin Firestore Service initialized');

