// Global Cart Context - Unified state management for guest and authenticated users
import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef, useMemo, useReducer } from 'react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { Cart, CartItem } from '@shared/cart-types';

// Enhanced guest cart item interface with schema versioning and conflict resolution
export interface GuestCartItem {
  id: string;
  productId?: string;
  serviceId?: string;
  quantity: number;
  addedAt: number;
  lastUpdated: number; // For expiry tracking and cross-tab sync
  customizations?: Record<string, any>;
  notes?: string;
  schemaVersion: string; // For backward compatibility
  conflictResolution?: {
    preferGuestQuantity: boolean; // True to prefer guest quantity in conflicts
    preferGuestCustomizations: boolean; // True to prefer guest customizations
  };
}

// Guest cart wrapper with metadata
export interface GuestCartData {
  items: GuestCartItem[];
  schemaVersion: string;
  lastUpdated: number;
  expiryHours: number; // Auto-cleanup threshold
}

// Cart reducer actions
type CartAction = 
  | { type: 'SET_CART'; payload: Cart | null }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'OPTIMISTIC_UPDATE_ITEM'; payload: { itemId: string; updates: Partial<CartItem> } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Cart reducer
function cartReducer(state: Cart | null, action: CartAction): Cart | null {
  switch (action.type) {
    case 'SET_CART':
      return action.payload;
    
    case 'ADD_ITEM':
      if (!state) {
        // Create new cart with the item
        return {
          id: `cart_${Date.now()}`,
          items: [action.payload],
          totals: calculateOptimisticTotals([action.payload]),
          currency: 'INR',
          lastUpdated: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          appliedCoupons: [],
          userId: undefined,
          sessionId: undefined,
          shippingAddress: undefined,
          expiresAt: undefined
        };
      }
      
      // Check if item already exists
      const existingItemIndex = state.items.findIndex(item => 
        (item.productId === action.payload.productId && item.productId) ||
        (item.serviceId === action.payload.serviceId && item.serviceId)
      );
      
      let newItems: CartItem[];
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        newItems = state.items.map((item, index) =>
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + action.payload.quantity, updatedAt: new Date() }
            : item
        );
      } else {
        // Add new item
        newItems = [...state.items, action.payload];
      }
      
      return {
        ...state,
        items: newItems,
        totals: calculateOptimisticTotals(newItems),
        lastUpdated: new Date(),
        updatedAt: new Date()
      };
    
    case 'UPDATE_QUANTITY':
      if (!state) return state;
      
      const updatedItems = state.items.map(item =>
        item.id === action.payload.itemId
          ? { ...item, quantity: action.payload.quantity, updatedAt: new Date() }
          : item
      );
      
      return {
        ...state,
        items: updatedItems,
        totals: calculateOptimisticTotals(updatedItems),
        lastUpdated: new Date(),
        updatedAt: new Date()
      };
    
    case 'REMOVE_ITEM':
      if (!state) return state;
      
      const filteredItems = state.items.filter(item => item.id !== action.payload.itemId);
      
      return {
        ...state,
        items: filteredItems,
        totals: calculateOptimisticTotals(filteredItems),
        lastUpdated: new Date(),
        updatedAt: new Date()
      };
    
    case 'CLEAR_CART':
      if (!state) return null;
      
      return {
        ...state,
        items: [],
        totals: { subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0, savings: 0 },
        lastUpdated: new Date(),
        updatedAt: new Date()
      };
    
    case 'OPTIMISTIC_UPDATE_ITEM':
      if (!state) return state;
      
      const optimisticItems = state.items.map(item =>
        item.id === action.payload.itemId
          ? { ...item, ...action.payload.updates, updatedAt: new Date() }
          : item
      );
      
      return {
        ...state,
        items: optimisticItems,
        totals: calculateOptimisticTotals(optimisticItems),
        lastUpdated: new Date(),
        updatedAt: new Date()
      };
    
    default:
      return state;
  }
}

// Calculate optimistic totals for immediate UI feedback
function calculateOptimisticTotals(items: CartItem[]): Cart['totals'] {
  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const discount = items.reduce((sum, item) => sum + (item.discount || 0), 0);
  
  // Free shipping over ₹500 (50000 paise)
  const shipping = subtotal > 50000 ? 0 : 5000;
  
  // 18% GST
  const tax = Math.round(subtotal * 0.18);
  
  // Calculate savings (difference between original price and unit price)
  const savings = items.reduce((sum, item) => {
    const originalPrice = item.originalPrice || item.unitPrice;
    return sum + ((originalPrice - item.unitPrice) * item.quantity);
  }, 0);
  
  const total = subtotal - discount + shipping + tax;
  
  return {
    subtotal: Math.max(0, subtotal),
    discount: Math.max(0, discount),
    shipping: Math.max(0, shipping),
    tax: Math.max(0, tax),
    total: Math.max(0, total),
    savings: Math.max(0, savings)
  };
}

// Cart context interface
interface CartContextType {
  // Cart data
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  
  // Derived selectors with memoization
  itemsCount: number;
  totalQuantity: number;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  savings: number;
  
  // Cart actions
  addItem: (productId?: string, serviceId?: string, quantity?: number, customizations?: Record<string, any>) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  updateNotes: (itemId: string, notes: string) => Promise<void>;
  clearCart: () => Promise<void>;
  
  // Guest cart specific
  guestCart: GuestCartItem[];
  
  // Refresh cart
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Storage keys and configuration
const GUEST_CART_KEY = 'guestCart';
const MIGRATION_FLAG_KEY = 'cartMigrated';
const CART_SCHEMA_VERSION = '2.0.0';
const CART_EXPIRY_HOURS = 72; // 3 days
const CROSS_TAB_SYNC_EVENT = 'cartSync';

interface CartProviderProps {
  children: ReactNode;
}

// Enhanced cart utility functions with improved data integrity
class CartStorageManager {
  /**
   * Load guest cart with schema validation and expiry handling
   */
  static loadGuestCart(): GuestCartItem[] {
    try {
      const stored = localStorage.getItem(GUEST_CART_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      
      // Handle legacy format (array) or new format (object with metadata)
      let cartData: GuestCartData;
      if (Array.isArray(parsed)) {
        // Legacy format - migrate to new structure
        cartData = {
          items: parsed.map(item => this.migrateGuestItem(item)),
          schemaVersion: CART_SCHEMA_VERSION,
          lastUpdated: Date.now(),
          expiryHours: CART_EXPIRY_HOURS
        };
        this.saveGuestCart(cartData.items);
      } else {
        cartData = parsed;
      }

      // Check for expiry
      if (this.isCartExpired(cartData)) {
        console.log('[CART STORAGE] Cart expired, clearing data');
        this.clearGuestCart();
        return [];
      }

      // Validate and migrate items if needed
      const validItems = cartData.items
        .map(item => this.migrateGuestItem(item))
        .filter(item => this.isValidGuestItem(item));

      return validItems;
    } catch (error) {
      console.error('[CART STORAGE] Error loading guest cart:', error);
      this.clearGuestCart();
      return [];
    }
  }

  /**
   * Save guest cart with metadata and schema versioning
   */
  static saveGuestCart(items: GuestCartItem[], skipSync = false): void {
    try {
      const cartData: GuestCartData = {
        items: items.map(item => ({
          ...item,
          lastUpdated: Date.now(),
          schemaVersion: item.schemaVersion || CART_SCHEMA_VERSION
        })),
        schemaVersion: CART_SCHEMA_VERSION,
        lastUpdated: Date.now(),
        expiryHours: CART_EXPIRY_HOURS
      };

      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartData));
      
      // Trigger cross-tab sync only if not coming from sync event
      if (!skipSync) {
        this.triggerCrossTabSync();
      }
    } catch (error) {
      console.error('[CART STORAGE] Error saving guest cart:', error);
    }
  }

  /**
   * Migrate legacy guest cart item to current schema
   */
  static migrateGuestItem(item: any): GuestCartItem {
    return {
      id: item.id || `migrated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId: item.productId,
      serviceId: item.serviceId,
      quantity: item.quantity || 1,
      addedAt: item.addedAt || Date.now(),
      lastUpdated: item.lastUpdated || Date.now(),
      customizations: item.customizations || {},
      notes: item.notes || '',
      schemaVersion: CART_SCHEMA_VERSION,
      conflictResolution: item.conflictResolution || {
        preferGuestQuantity: true,
        preferGuestCustomizations: true
      }
    };
  }

  /**
   * Validate guest cart item structure
   */
  static isValidGuestItem(item: any): boolean {
    return !!(
      item.id && 
      (item.productId || item.serviceId) && 
      typeof item.quantity === 'number' && 
      item.quantity > 0
    );
  }

  /**
   * Check if cart data has expired
   */
  static isCartExpired(cartData: GuestCartData): boolean {
    const expiryTime = cartData.lastUpdated + (cartData.expiryHours * 60 * 60 * 1000);
    return Date.now() > expiryTime;
  }

  /**
   * Clear guest cart and related data
   */
  static clearGuestCart(): void {
    try {
      localStorage.removeItem(GUEST_CART_KEY);
      localStorage.removeItem(MIGRATION_FLAG_KEY);
      this.triggerCrossTabSync();
      console.log('[CART STORAGE] ✅ Guest cart cleared from localStorage');
    } catch (error) {
      console.error('[CART STORAGE] Error clearing guest cart:', error);
    }
  }

  /**
   * Trigger cross-tab synchronization with debouncing to prevent loops
   */
  private static lastSyncTrigger = 0;
  static triggerCrossTabSync(): void {
    const now = Date.now();
    if (now - this.lastSyncTrigger < 1000) { // Debounce for 1 second
      return;
    }
    this.lastSyncTrigger = now;
    window.dispatchEvent(new CustomEvent(CROSS_TAB_SYNC_EVENT, {
      detail: { timestamp: now }
    }));
  }

  /**
   * Atomic merge operation with conflict resolution
   */
  static mergeCartItems(
    guestItems: GuestCartItem[], 
    authItems: CartItem[]
  ): { merged: CartItem[]; conflicts: Array<{ guest: GuestCartItem; auth: CartItem; resolution: string }> } {
    const merged: CartItem[] = [...authItems];
    const conflicts: Array<{ guest: GuestCartItem; auth: CartItem; resolution: string }> = [];

    for (const guestItem of guestItems) {
      const existingIndex = merged.findIndex(authItem => 
        authItem.productId === guestItem.productId && 
        authItem.serviceId === guestItem.serviceId
      );

      if (existingIndex >= 0) {
        // Conflict detected - apply resolution rules
        const authItem = merged[existingIndex];
        const resolution = this.resolveCartConflict(guestItem, authItem);
        
        merged[existingIndex] = resolution.resolvedItem;
        conflicts.push({
          guest: guestItem,
          auth: authItem,
          resolution: resolution.strategy
        });
      } else {
        // No conflict - add guest item as new cart item
        const newCartItem: CartItem = {
          id: guestItem.id,
          productId: guestItem.productId,
          serviceId: guestItem.serviceId,
          quantity: guestItem.quantity,
          unitPrice: 0, // Will be populated by server
          originalPrice: 0,
          discount: 0,
          appliedCoupons: [],
          customizations: guestItem.customizations || {},
          notes: guestItem.notes || '',
          savedForLater: false,
          createdAt: new Date(guestItem.addedAt),
          updatedAt: new Date(guestItem.lastUpdated)
        };
        merged.push(newCartItem);
      }
    }

    return { merged, conflicts };
  }

  /**
   * Resolve conflicts between guest and authenticated cart items
   */
  static resolveCartConflict(
    guestItem: GuestCartItem, 
    authItem: CartItem
  ): { resolvedItem: CartItem; strategy: string } {
    const prefs = guestItem.conflictResolution || {
      preferGuestQuantity: true,
      preferGuestCustomizations: true
    };

    let strategy = '';
    const resolvedItem: CartItem = { ...authItem };

    // Quantity resolution
    if (prefs.preferGuestQuantity) {
      resolvedItem.quantity = guestItem.quantity;
      strategy += 'guest-qty ';
    } else {
      // Sum quantities for safety (most common expectation)
      resolvedItem.quantity = authItem.quantity + guestItem.quantity;
      strategy += 'sum-qty ';
    }

    // Customization resolution
    if (prefs.preferGuestCustomizations && guestItem.customizations) {
      resolvedItem.customizations = {
        ...authItem.customizations,
        ...guestItem.customizations
      };
      strategy += 'guest-custom ';
    }

    // Notes resolution - concatenate if both exist
    if (guestItem.notes && authItem.notes) {
      resolvedItem.notes = `${authItem.notes} | ${guestItem.notes}`;
      strategy += 'concat-notes ';
    } else if (guestItem.notes) {
      resolvedItem.notes = guestItem.notes;
      strategy += 'guest-notes ';
    }

    resolvedItem.updatedAt = new Date();

    return { 
      resolvedItem, 
      strategy: strategy.trim() || 'auth-preferred' 
    };
  }
}

export function CartProvider({ children }: CartProviderProps) {
  const { isAuthenticated, user } = useFirebaseAuth();
  const { toast } = useToast();
  
  // State management with reducer for deterministic updates
  const [cart, dispatch] = useReducer(cartReducer, null);
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Request queue and debouncing for quantity updates
  const updateQueueRef = useRef<Map<string, { quantity: number; timestamp: number }>>(new Map());
  const pendingUpdatesRef = useRef<Set<string>>(new Set());
  const debounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const saveGuestCartTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Keep reference to current cart for logout preservation
  const currentCartRef = useRef<Cart | null>(null);
  
  // Add-to-cart operation queue
  const addOperationQueueRef = useRef<Array<{
    id: string;
    productId?: string;
    serviceId?: string;
    quantity: number;
    customizations?: Record<string, any>;
    resolve: () => void;
    reject: (error: Error) => void;
  }>>([]);
  const isProcessingAddOperations = useRef(false);

  // Load guest cart from localStorage on mount with enhanced validation
  useEffect(() => {
    const loadGuestCart = () => {
      const validCart = CartStorageManager.loadGuestCart();
      setGuestCart(validCart);
      console.log('[CART CONTEXT] 📖 Loading guest cart from localStorage:', validCart.length, 'items');
    };

    loadGuestCart();

    // Cross-tab synchronization listener with loop prevention
    const handleCrossTabSync = (e: CustomEvent) => {
      const now = Date.now();
      if (e.detail?.timestamp && now - e.detail.timestamp > 5000) {
        return; // Ignore old events
      }
      console.log('[CART CONTEXT] 📡 Cross-tab sync triggered, reloading guest cart');
      if (!isAuthenticated) {
        loadGuestCart();
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === GUEST_CART_KEY && !isAuthenticated && e.newValue !== e.oldValue) {
        console.log('[CART CONTEXT] 🔄 Storage event detected, syncing cart');
        loadGuestCart();
      }
    };

    window.addEventListener(CROSS_TAB_SYNC_EVENT, handleCrossTabSync as EventListener);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(CROSS_TAB_SYNC_EVENT, handleCrossTabSync as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated]);

  // Save guest cart to localStorage with enhanced metadata and cross-tab sync
  useEffect(() => {
    // Skip if guest cart is empty or user is authenticated
    if (guestCart.length === 0 || isAuthenticated) {
      return;
    }
    
    // Clear existing timeout
    if (saveGuestCartTimeoutRef.current) {
      clearTimeout(saveGuestCartTimeoutRef.current);
    }
    
    // Debounce localStorage saves to prevent multiple rapid writes
    saveGuestCartTimeoutRef.current = setTimeout(() => {
      try {
        console.log('[CART CONTEXT] 💾 Debounced save of guest cart with metadata:', guestCart.length, 'items');
        CartStorageManager.saveGuestCart(guestCart);
      } catch (error) {
        console.error('[CART CONTEXT] Error saving guest cart:', error);
      }
    }, 200);
    
    return () => {
      if (saveGuestCartTimeoutRef.current) {
        clearTimeout(saveGuestCartTimeoutRef.current);
      }
    };
  }, [guestCart, isAuthenticated]);

  // Load authenticated user's cart
  const loadAuthenticatedCart = useCallback(async () => {
    if (!isAuthenticated) return;
    
    console.log('[CART CONTEXT] 🔄 Loading authenticated cart...');
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('GET', '/api/cart');
      const cartData = await response.json();
      console.log('[CART CONTEXT] 📦 Authenticated cart data received:', JSON.stringify(cartData, null, 2));
      console.log('[CART CONTEXT] 🔢 Cart items count:', cartData.items?.length || 0);
      dispatch({ type: 'SET_CART', payload: cartData });
      // Keep reference for logout preservation
      currentCartRef.current = cartData;
    } catch (error) {
      console.error('[CART CONTEXT] ❌ Error loading authenticated cart:', error);
      setError('Failed to load cart');
      // Fallback to empty cart
      dispatch({ type: 'SET_CART', payload: {
        id: `fallback_cart_${Date.now()}`,
        items: [],
        totals: { subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0, savings: 0 },
        currency: 'INR',
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        appliedCoupons: [],
        userId: undefined,
        sessionId: undefined,
        shippingAddress: undefined,
        expiresAt: undefined
      } });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load guest cart as Cart object with enhanced validation
  const loadGuestCartAsCart = useCallback(async () => {
    // Use enhanced cart storage manager for robust loading
    const currentGuestCart = CartStorageManager.loadGuestCart();
    
    console.log('[CART CONTEXT] 📖 Loading guest cart from localStorage:', currentGuestCart.length, 'items');
    
    if (currentGuestCart.length === 0) {
      dispatch({ type: 'SET_CART', payload: {
        id: `guest_cart_${Date.now()}`,
        items: [],
        totals: { subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0, savings: 0 },
        currency: 'INR',
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        appliedCoupons: [],
        userId: undefined,
        sessionId: undefined,
        shippingAddress: undefined,
        expiresAt: undefined
      }});
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/cart/guest', {
        items: currentGuestCart,
        schemaVersion: CART_SCHEMA_VERSION
      });
      const cartData = await response.json();
      dispatch({ type: 'SET_CART', payload: cartData });
      currentCartRef.current = cartData;
      console.log('[CART CONTEXT] 📦 Loaded guest cart as Cart with', cartData.items?.length || 0, 'items');
      
      // Sync guest cart state
      setGuestCart(currentGuestCart);
    } catch (error) {
      console.error('[CART CONTEXT] Error loading guest cart:', error);
      setError('Failed to load cart');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh cart data
  const refreshCart = useCallback(async () => {
    if (isAuthenticated) {
      await loadAuthenticatedCart();
    } else {
      await loadGuestCartAsCart();
    }
  }, [isAuthenticated, loadAuthenticatedCart, loadGuestCartAsCart]);

  // Load cart when authentication state changes (only once per auth change)
  useEffect(() => {
    let isMounted = true;
    
    const loadCart = async () => {
      if (!isMounted) return;
      
      if (isAuthenticated) {
        await loadAuthenticatedCart();
      } else {
        await loadGuestCartAsCart();
      }
    };
    
    loadCart();
    
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]); // Remove the function dependencies

  // Update cart reference whenever cart state changes
  useEffect(() => {
    if (cart) {
      currentCartRef.current = cart;
    }
  }, [cart]);

  // Clear cart data when user logs out (prevent repeated executions)
  const clearCartOnLogout = useCallback(async () => {
    // Prevent repeated clearing calls
    const recentClearing = localStorage.getItem('recent_cart_clearing');
    if (recentClearing && (Date.now() - parseInt(recentClearing)) < 2000) {
      console.log('[CART CONTEXT] ⏭️ Skipping cart clearing - recently executed');
      return;
    }
    
    console.log('[CART CONTEXT] 🗑️ User logged out, clearing cart data...');
    localStorage.setItem('recent_cart_clearing', Date.now().toString());
    
    // Clear the cart state
    dispatch({ type: 'CLEAR_CART' });
    
    // Clear guest cart from localStorage
    localStorage.removeItem(GUEST_CART_KEY);
    
    // Clear the guest cart state
    setGuestCart([]);
    
    // Clear current cart reference
    currentCartRef.current = null;
    
    console.log('[CART CONTEXT] ✅ Cart cleared successfully on logout');
    
    // Clean up clearing flag after a short delay
    setTimeout(() => {
      localStorage.removeItem('recent_cart_clearing');
    }, 3000);
  }, []);

  // Migrate guest cart when user signs in - ALWAYS run on authentication change
  useEffect(() => {
    let migrationTimeout: NodeJS.Timeout;
    
    const migrateGuestCart = async () => {
      if (!isAuthenticated) {
        console.log('[CART MIGRATION] ℹ️ User not authenticated, skipping migration');
        return;
      }

      // Always read current guest cart from localStorage for most up-to-date data
      const currentGuestCartData = localStorage.getItem(GUEST_CART_KEY);
      let currentGuestCart: GuestCartItem[] = [];
      
      try {
        if (currentGuestCartData) {
          const parsed = JSON.parse(currentGuestCartData);
          currentGuestCart = Array.isArray(parsed) ? parsed : [];
        }
      } catch (error) {
        console.error('[CART MIGRATION] Error parsing guest cart from localStorage:', error);
        localStorage.removeItem(GUEST_CART_KEY);
      }
      
      // Also check current guest cart state as fallback
      if (currentGuestCart.length === 0 && guestCart.length > 0) {
        console.log('[CART MIGRATION] 📦 Using guest cart from state as fallback:', guestCart.length, 'items');
        currentGuestCart = guestCart;
      }
      
      console.log('[CART MIGRATION] 🔍 Debug - localStorage items:', currentGuestCart.length);
      console.log('[CART MIGRATION] 🔍 Debug - state items:', guestCart.length);
      console.log('[CART MIGRATION] 🔍 Debug - localStorage raw:', currentGuestCartData);
      
      if (currentGuestCart.length === 0) {
        console.log('[CART MIGRATION] ℹ️ No guest cart items to migrate');
        // Still load authenticated cart even if no guest items (but don't trigger another migration)
        console.log('[CART MIGRATION] 🔄 Loading authenticated cart directly...');
        setIsLoading(true);
        setError(null);
        
        try {
          const response = await apiRequest('GET', '/api/cart');
          const cartData = await response.json();
          console.log('[CART CONTEXT] 📦 Authenticated cart data received:', JSON.stringify(cartData, null, 2));
          dispatch({ type: 'SET_CART', payload: cartData });
          currentCartRef.current = cartData;
        } catch (error) {
          console.error('[CART CONTEXT] ❌ Error loading authenticated cart:', error);
          setError('Failed to load cart');
        } finally {
          setIsLoading(false);
        }
        return;
      }

      console.log('[CART MIGRATION] 🚀 Starting cart migration...');
      console.log('[CART MIGRATION] 📦 Current guest cart data from localStorage:', JSON.stringify(currentGuestCart, null, 2));
      console.log('[CART MIGRATION] 👤 User ID:', user?.uid);
      
      try {
        console.log('[CART MIGRATION] 📤 Sending migration request to server...');
        const response = await apiRequest('POST', '/api/cart/migrate', {
          guestItems: currentGuestCart
        });
        
        if (!response.ok) {
          throw new Error(`Migration failed with status: ${response.status}`);
        }
        
        const migrationResult = await response.json();
        console.log('[CART MIGRATION] 📨 Server response data:', migrationResult);
        
        // Clear guest cart after successful migration
        console.log('[CART MIGRATION] 🧹 Clearing guest cart from localStorage...');
        setGuestCart([]);
        localStorage.removeItem(GUEST_CART_KEY);
        
        // Store migrated items info for future logout preservation  
        const migratedItemsInfo = currentGuestCart.map(item => ({
          productId: item.productId,
          serviceId: item.serviceId,
          quantity: item.quantity,
          source: 'migrated'
        }));
        localStorage.setItem('migrated_cart_info', JSON.stringify(migratedItemsInfo));
        
        // Clear any cached migration flags
        localStorage.removeItem(MIGRATION_FLAG_KEY);
        
        // Immediately refresh authenticated cart (direct call to avoid loop)
        console.log('[CART MIGRATION] 🔄 Refreshing authenticated cart...');
        setIsLoading(true);
        try {
          const response = await apiRequest('GET', '/api/cart');
          const cartData = await response.json();
          dispatch({ type: 'SET_CART', payload: cartData });
          currentCartRef.current = cartData;
        } catch (error) {
          console.error('[CART CONTEXT] ❌ Error refreshing authenticated cart:', error);
        } finally {
          setIsLoading(false);
        }
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('cart-migrated'));
        
        if (migrationResult.totalItems > 0) {
          toast({
            title: "Cart Synced",
            description: `${migrationResult.totalItems || 0} items merged successfully.`,
          });
        }
        
        console.log('[CART MIGRATION] ✅ Cart migration completed successfully');
      } catch (error) {
        console.error('[CART MIGRATION] ❌ Cart migration failed:', error);
        
        toast({
          title: "Sync Warning",
          description: "Some cart items couldn't be synced. Please check your cart.",
          variant: "destructive",
        });
        
        // Still load authenticated cart even if migration fails (direct call)
        setIsLoading(true);
        try {
          const response = await apiRequest('GET', '/api/cart');
          const cartData = await response.json();
          dispatch({ type: 'SET_CART', payload: cartData });
          currentCartRef.current = cartData;
        } catch (error) {
          console.error('[CART CONTEXT] ❌ Error loading authenticated cart after migration failure:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    // Run migration only when authentication state actually changes (prevent loops)
    const migrationKey = `migration_${isAuthenticated ? 'auth' : 'guest'}_${user?.uid || 'none'}`;
    const lastMigrationKey = sessionStorage.getItem('last_migration_key');
    
    if (lastMigrationKey !== migrationKey) {
      sessionStorage.setItem('last_migration_key', migrationKey);
      
      if (isAuthenticated && user?.uid) {
        // Debounce migration to prevent rapid-fire calls
        migrationTimeout = setTimeout(migrateGuestCart, 300);
      } else if (!isAuthenticated) {
        // When user logs out, preserve authenticated cart data as guest cart (run once)
        migrationTimeout = setTimeout(() => {
          clearCartOnLogout();
        }, 100);
      }
    }

    return () => {
      if (migrationTimeout) {
        clearTimeout(migrationTimeout);
      }
    };
  }, [isAuthenticated, user?.uid]); // Only depend on auth state

  // Process add-to-cart operations queue for authenticated users
  const processAddOperationQueue = useCallback(async () => {
    if (isProcessingAddOperations.current || addOperationQueueRef.current.length === 0) {
      return;
    }

    isProcessingAddOperations.current = true;

    while (addOperationQueueRef.current.length > 0) {
      const operation = addOperationQueueRef.current.shift();
      if (!operation) continue;

      try {
        await apiRequest('POST', '/api/cart/items', {
          productId: operation.productId,
          serviceId: operation.serviceId,
          quantity: operation.quantity,
          customizations: operation.customizations
        });
        operation.resolve();
      } catch (error) {
        console.error('[CART CONTEXT] Error processing add operation:', error);
        operation.reject(error as Error);
      }
    }

    // Refresh cart once after all operations are complete (direct call to avoid loop)
    setIsLoading(true);
    try {
      const response = await apiRequest('GET', '/api/cart');
      const cartData = await response.json();
      dispatch({ type: 'SET_CART', payload: cartData });
      currentCartRef.current = cartData;
    } catch (error) {
      console.error('[CART CONTEXT] ❌ Error refreshing cart after queue processing:', error);
    } finally {
      setIsLoading(false);
    }
    
    isProcessingAddOperations.current = false;
  }, []); // Remove loadAuthenticatedCart dependency

  // Cart actions
  const addItem = useCallback(async (
    productId?: string, 
    serviceId?: string, 
    quantity: number = 1,
    customizations?: Record<string, any>
  ) => {
    if (!productId && !serviceId) {
      toast({
        title: "Error",
        description: "No product or service selected",
        variant: "destructive",
      });
      return;
    }

    // Immediate optimistic UI update for both authenticated and guest users
    const optimisticItemId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (isAuthenticated) {
      // Create optimistic item for authenticated users
      const optimisticItem: CartItem = {
        id: optimisticItemId,
        productId,
        serviceId,
        quantity,
        unitPrice: 0, // Will be updated when real data comes back
        originalPrice: 0,
        discount: 0,
        appliedCoupons: [],
        customizations: customizations || {},
        notes: '',
        savedForLater: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Use reducer for deterministic state update
      dispatch({ type: 'ADD_ITEM', payload: optimisticItem });

      // Queue the actual API operation
      return new Promise<void>((resolve, reject) => {
        addOperationQueueRef.current.push({
          id: optimisticItemId,
          productId,
          serviceId,
          quantity,
          customizations,
          resolve: () => {
            resolve();
            toast({
              title: "Added to Cart",
              description: "Item added successfully",
            });
          },
          reject: (error) => {
            // Remove optimistic item on error
            dispatch({ type: 'REMOVE_ITEM', payload: { itemId: optimisticItemId } });
            reject(error);
            toast({
              title: "Error",
              description: "Failed to add item to cart",
              variant: "destructive",
            });
          }
        });

        // Process the queue
        processAddOperationQueue();
      });
    } else {
      // Guest user - atomic update with reducer to prevent race conditions
      console.log('[CART CONTEXT] Adding item to guest cart:', { productId, serviceId, quantity });
      
      // Create optimistic item for immediate cart display
      const guestOptimisticItem: CartItem = {
        id: optimisticItemId,
        productId,
        serviceId,
        quantity,
        unitPrice: 0, // Will be updated when real data loads
        originalPrice: 0,
        discount: 0,
        appliedCoupons: [],
        customizations: customizations || {},
        notes: '',
        savedForLater: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Immediately update guest cart array and localStorage atomically
      setGuestCart(prev => {
        const existingIndex = prev.findIndex(item => 
          item.productId === productId && item.serviceId === serviceId
        );
        
        let newCart: GuestCartItem[];
        
        if (existingIndex >= 0) {
          // Update existing item quantity atomically
          newCart = prev.map((item, index) => 
            index === existingIndex 
              ? { ...item, quantity: item.quantity + quantity, addedAt: Date.now() }
              : item
          );
        } else {
          // Add new item atomically with complete schema
          const newItem: GuestCartItem = {
            id: optimisticItemId, // Use same ID for consistency
            productId,
            serviceId,
            quantity,
            addedAt: Date.now(),
            lastUpdated: Date.now(),
            customizations: customizations || {},
            notes: '',
            schemaVersion: CART_SCHEMA_VERSION,
            conflictResolution: {
              preferGuestQuantity: true,
              preferGuestCustomizations: true
            }
          };
          newCart = [...prev, newItem];
        }
        
        console.log('[CART CONTEXT] Updated guest cart atomically:', newCart);
        
        // CRITICAL: Immediately save to localStorage using CartStorageManager
        CartStorageManager.saveGuestCart(newCart, true); // Skip cross-tab sync to prevent loops
        console.log('[CART CONTEXT] ✅ Guest cart add operation persisted to localStorage:', newCart.length, 'items');
        
        return newCart;
      });
      
      // Use reducer for deterministic guest cart display update (atomic operation)
      dispatch({ type: 'ADD_ITEM', payload: guestOptimisticItem });
      
      // Instant feedback without waiting for API
      toast({
        title: "Added to Cart",
        description: "Item added successfully",
      });
      
      // Load full cart object with proper product data (non-blocking, in background)
      loadGuestCartAsCart().catch(error => {
        console.error('[CART CONTEXT] Background cart load failed:', error);
      });
    }
  }, [isAuthenticated, processAddOperationQueue, loadGuestCartAsCart, toast, user]);

  const removeItem = useCallback(async (itemId: string) => {
    // Immediate optimistic removal for instant UI feedback
    if (isAuthenticated) {
      // Optimistically remove from cart display using reducer
      dispatch({ type: 'REMOVE_ITEM', payload: { itemId } });
      
      try {
        await apiRequest('DELETE', `/api/cart/items/${itemId}`);
        await loadAuthenticatedCart();
        toast({
          title: "Removed",
          description: "Item removed from cart",
        });
      } catch (error) {
        console.error('[CART CONTEXT] Error removing item:', error);
        // Revert optimistic change on error
        await loadAuthenticatedCart();
        toast({
          title: "Error",
          description: "Failed to remove item",
          variant: "destructive",
        });
      }
    } else {
      // Guest mode - CRITICAL: Update both state and localStorage atomically
      console.log('[CART CONTEXT] Removing item from guest cart:', itemId);
      
      // Update guest cart array with immediate localStorage sync
      setGuestCart(prev => {
        const updatedCart = prev.filter(item => item.id !== itemId);
        console.log('[CART CONTEXT] Removed item from guest cart:', itemId);
        
        // CRITICAL: Immediately save to localStorage using CartStorageManager
        CartStorageManager.saveGuestCart(updatedCart, true); // Skip cross-tab sync to prevent loops
        console.log('[CART CONTEXT] ✅ Guest cart persisted to localStorage:', updatedCart.length, 'items');
        
        return updatedCart;
      });
      
      // Immediately update the cart object as well for instant UI sync using reducer
      dispatch({ type: 'REMOVE_ITEM', payload: { itemId } });
      
      toast({
        title: "Removed",
        description: "Item removed from cart",
      });
    }
  }, [isAuthenticated, guestCart, loadAuthenticatedCart, loadGuestCartAsCart, toast]);

  // Debounced quantity update processor
  const processQuantityUpdate = useCallback(async (itemId: string, finalQuantity: number) => {
    console.log('[CART CONTEXT] 🔄 Processing final quantity update:', { itemId, finalQuantity });

    if (finalQuantity <= 0) {
      await removeItem(itemId);
      return;
    }

    if (pendingUpdatesRef.current.has(itemId)) {
      console.log('[CART CONTEXT] ⚠️ Already processing this item, skipping:', itemId);
      return; // Already processing this item
    }

    pendingUpdatesRef.current.add(itemId);

    try {
      if (isAuthenticated) {
        console.log('[CART CONTEXT] 📡 Sending server update for authenticated user...');
        await apiRequest('PATCH', `/api/cart/items/${itemId}`, { quantity: finalQuantity });
        
        // Instead of reloading the entire cart, just verify the item was updated correctly
        // This prevents overwriting the optimistic UI update
        console.log('[CART CONTEXT] ✅ Server update completed, keeping optimistic UI');
        
        toast({
          title: "Updated",
          description: "Quantity updated successfully",
        });
      } else {
        // For guest cart, update localStorage synchronously with immediate persistence
        setGuestCart(prev => {
          const updated = prev.map(item => 
            item.id === itemId ? { ...item, quantity: finalQuantity, lastUpdated: Date.now() } : item
          );
          console.log('[CART CONTEXT] Processed guest quantity update:', { itemId, finalQuantity });
          
          // CRITICAL: Immediately save to localStorage
          CartStorageManager.saveGuestCart(updated, true); // Skip cross-tab sync
          console.log('[CART CONTEXT] ✅ Guest cart quantity update persisted to localStorage');
          
          return updated;
        });
        await loadGuestCartAsCart();
      }
    } catch (error) {
      console.error('[CART CONTEXT] ❌ Error processing quantity update:', error);
      
      // On error, revert optimistic update by reloading cart
      if (isAuthenticated) {
        await loadAuthenticatedCart();
      }
      
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    } finally {
      pendingUpdatesRef.current.delete(itemId);
      updateQueueRef.current.delete(itemId);
    }
  }, [isAuthenticated, loadAuthenticatedCart, loadGuestCartAsCart, removeItem, toast]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    console.log('[CART CONTEXT] 🔄 Updating quantity:', { itemId, quantity, isAuthenticated });
    
    // Immediately update UI optimistically for both authenticated and guest users using reducer
    console.log('[CART CONTEXT] 📦 Optimistic quantity update:', { itemId, quantity });
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });

    if (!isAuthenticated) {
      // For guest cart, also update localStorage synchronously
      setGuestCart(prev => {
        const updated = prev.map(item => 
          item.id === itemId ? { ...item, quantity, lastUpdated: Date.now() } : item
        );
        
        // CRITICAL: Immediately persist to localStorage
        CartStorageManager.saveGuestCart(updated, true); // Skip cross-tab sync
        console.log('[CART CONTEXT] ✅ Guest cart optimistic update persisted to localStorage');
        
        return updated;
      });
    }

    // Queue the update for processing with debouncing
    updateQueueRef.current.set(itemId, { quantity, timestamp: Date.now() });

    // Clear existing timer for this item
    const existingTimer = debounceTimersRef.current.get(itemId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new debounced timer
    const newTimer = setTimeout(() => {
      const queuedUpdate = updateQueueRef.current.get(itemId);
      if (queuedUpdate) {
        processQuantityUpdate(itemId, queuedUpdate.quantity);
      }
      debounceTimersRef.current.delete(itemId);
    }, 300); // 300ms debounce

    debounceTimersRef.current.set(itemId, newTimer);
  }, [isAuthenticated, processQuantityUpdate]);

  // Update cart item notes
  const updateNotes = useCallback(async (itemId: string, notes: string) => {
    console.log('[CART CONTEXT] 📝 Updating item notes:', { itemId, notes: notes.substring(0, 50) + '...' });
    
    // Immediate optimistic update for both authenticated and guest users
    dispatch({ type: 'OPTIMISTIC_UPDATE_ITEM', payload: { itemId, updates: { notes } } });
    
    if (isAuthenticated) {
      try {
        await apiRequest('PATCH', `/api/cart/items/${itemId}`, { notes });
        console.log('[CART CONTEXT] ✅ Authenticated cart notes updated on server');
      } catch (error) {
        console.error('[CART CONTEXT] ❌ Error updating notes on server:', error);
        // Reload cart to revert optimistic update
        await loadAuthenticatedCart();
        toast({
          title: "Error",
          description: "Failed to update notes",
          variant: "destructive",
        });
      }
    } else {
      // For guest cart, update localStorage
      setGuestCart(prev => {
        const updated = prev.map(item => 
          item.id === itemId ? { ...item, notes, lastUpdated: Date.now() } : item
        );
        
        // Persist to localStorage immediately
        CartStorageManager.saveGuestCart(updated, true);
        console.log('[CART CONTEXT] ✅ Guest cart notes updated in localStorage');
        
        return updated;
      });
      
      // Reload guest cart to sync with server representation
      await loadGuestCartAsCart();
    }
  }, [isAuthenticated, loadAuthenticatedCart, loadGuestCartAsCart, toast]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      debounceTimersRef.current.forEach(timer => clearTimeout(timer));
      debounceTimersRef.current.clear();
      updateQueueRef.current.clear();
      pendingUpdatesRef.current.clear();
      addOperationQueueRef.current.length = 0;
      isProcessingAddOperations.current = false;
      if (saveGuestCartTimeoutRef.current) {
        clearTimeout(saveGuestCartTimeoutRef.current);
      }
    };
  }, []);

  const clearCart = useCallback(async () => {
    // Immediate optimistic clear for instant UI feedback using reducer
    dispatch({ type: 'CLEAR_CART' });
    
    if (isAuthenticated) {
      setIsLoading(true);
      try {
        await apiRequest('DELETE', '/api/cart');
        await loadAuthenticatedCart();
        toast({
          title: "Cart Cleared",
          description: "All items removed from cart",
        });
      } catch (error) {
        console.error('[CART CONTEXT] Error clearing cart:', error);
        // Revert optimistic change on error
        await loadAuthenticatedCart();
        toast({
          title: "Error",
          description: "Failed to clear cart",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // Guest mode - CRITICAL: Clear both state and localStorage atomically
      console.log('[CART CONTEXT] Clearing guest cart completely');
      
      // Clear guest cart state
      setGuestCart([]);
      
      // CRITICAL: Clear localStorage using CartStorageManager
      CartStorageManager.clearGuestCart();
      console.log('[CART CONTEXT] ✅ Guest cart cleared from localStorage');
      
      // Set cart to empty state immediately using reducer
      dispatch({ type: 'SET_CART', payload: {
        id: `guest_cart_${Date.now()}`,
        items: [],
        totals: { subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0, savings: 0 },
        currency: 'INR',
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        appliedCoupons: [],
        userId: undefined,
        sessionId: `guest_session_${Date.now()}`,
        shippingAddress: undefined,
        expiresAt: undefined
      } });
      
      console.log('[CART CONTEXT] Cleared guest cart');
      
      toast({
        title: "Cart Cleared",
        description: "All items removed from cart",
      });
    }
  }, [isAuthenticated, loadAuthenticatedCart, loadGuestCartAsCart, toast]);

  // Memoized derived selectors for optimal performance
  const cartStats = useMemo(() => {
    const itemsCount = cart?.items?.length || 0;
    const totalQuantity = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    // For guest users, also include items not yet synced to Cart object
    const guestItemsCount = !isAuthenticated ? guestCart.length : 0;
    const guestTotalQuantity = !isAuthenticated ? guestCart.reduce((sum, item) => sum + item.quantity, 0) : 0;
    
    // Use guest data if cart is not loaded yet (instant feedback)
    const finalItemsCount = cart ? itemsCount : guestItemsCount;
    const finalTotalQuantity = cart ? totalQuantity : guestTotalQuantity;

    // Extract totals with fallbacks
    const totals = cart?.totals || { subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0, savings: 0 };

    return {
      itemsCount: finalItemsCount,
      totalQuantity: finalTotalQuantity,
      subtotal: totals.subtotal,
      discount: totals.discount,
      shipping: totals.shipping,
      tax: totals.tax,
      total: totals.total,
      savings: totals.savings,
    };
  }, [cart, guestCart, isAuthenticated]);

  const value: CartContextType = {
    cart,
    isLoading,
    error,
    itemsCount: cartStats.itemsCount,
    totalQuantity: cartStats.totalQuantity,
    subtotal: cartStats.subtotal,
    discount: cartStats.discount,
    shipping: cartStats.shipping,
    tax: cartStats.tax,
    total: cartStats.total,
    savings: cartStats.savings,
    addItem,
    removeItem,
    updateQuantity,
    updateNotes,
    clearCart,
    guestCart,
    refreshCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Hook to use cart context
export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}