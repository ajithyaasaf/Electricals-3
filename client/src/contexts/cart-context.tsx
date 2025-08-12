// Global Cart Context - Unified state management for guest and authenticated users
import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef, useMemo, useReducer } from 'react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { Cart, CartItem } from '@shared/cart-types';

// Enhanced guest cart item interface
export interface GuestCartItem {
  id: string;
  productId?: string;
  serviceId?: string;
  quantity: number;
  addedAt: number;
  customizations?: Record<string, any>;
  notes?: string;
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
  clearCart: () => Promise<void>;
  
  // Guest cart specific
  guestCart: GuestCartItem[];
  
  // Refresh cart
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Storage keys
const GUEST_CART_KEY = 'guestCart';
const MIGRATION_FLAG_KEY = 'cartMigrated';

interface CartProviderProps {
  children: ReactNode;
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

  // Load guest cart from localStorage on mount
  useEffect(() => {
    const loadGuestCart = () => {
      try {
        const stored = localStorage.getItem(GUEST_CART_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const validCart = Array.isArray(parsed) ? parsed : [];
          setGuestCart(validCart);
          console.log('[CART CONTEXT] Loaded guest cart:', validCart);
        }
      } catch (error) {
        console.error('[CART CONTEXT] Error loading guest cart:', error);
        localStorage.removeItem(GUEST_CART_KEY);
        setGuestCart([]);
      }
    };

    loadGuestCart();
  }, []);

  // Save guest cart to localStorage whenever it changes (debounced, but allow immediate writes)
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
    // But this is secondary to the immediate saves in addItem
    saveGuestCartTimeoutRef.current = setTimeout(() => {
      try {
        console.log('[CART CONTEXT] Debounced save of guest cart to localStorage:', guestCart);
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart));
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
  }, [isAuthenticated]);

  // Load guest cart as Cart object
  const loadGuestCartAsCart = useCallback(async () => {
    if (guestCart.length === 0) {
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
      } });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/cart/guest', {
        items: guestCart
      });
      const cartData = await response.json();
      dispatch({ type: 'SET_CART', payload: cartData });
      console.log('[CART CONTEXT] Loaded guest cart as Cart:', cartData);
    } catch (error) {
      console.error('[CART CONTEXT] Error loading guest cart:', error);
      setError('Failed to load cart');
    } finally {
      setIsLoading(false);
    }
  }, [guestCart]);

  // Refresh cart data
  const refreshCart = useCallback(async () => {
    if (isAuthenticated) {
      await loadAuthenticatedCart();
    } else {
      await loadGuestCartAsCart();
    }
  }, [isAuthenticated, loadAuthenticatedCart, loadGuestCartAsCart]);

  // Load cart when authentication state changes
  useEffect(() => {
    refreshCart();
  }, [isAuthenticated, refreshCart]);

  // Preserve cart data when user logs out (prevent repeated executions)
  const preserveCartDataOnLogout = useCallback(async () => {
    // Prevent repeated preservation calls
    const preservationKey = `cart_preserved_${Date.now()}`;
    const recentPreservation = localStorage.getItem('recent_cart_preservation');
    if (recentPreservation && (Date.now() - parseInt(recentPreservation)) < 2000) {
      console.log('[CART CONTEXT] ⏭️ Skipping cart preservation - recently executed');
      return;
    }
    
    console.log('[CART CONTEXT] 🔄 User logged out, preserving cart data...');
    localStorage.setItem('recent_cart_preservation', Date.now().toString());
    
    // Check if we have current cart items OR check if there are any existing guest items to preserve
    const existingGuestCart = localStorage.getItem(GUEST_CART_KEY);
    let hasExistingGuestItems = false;
    
    try {
      if (existingGuestCart) {
        const parsed = JSON.parse(existingGuestCart);
        hasExistingGuestItems = Array.isArray(parsed) && parsed.length > 0;
      }
    } catch (error) {
      console.error('[CART CONTEXT] Error parsing existing guest cart:', error);
    }
    
    // If we have a current cart with items, convert it to guest cart format
    if (cart && cart.items && cart.items.length > 0) {
      console.log('[CART CONTEXT] 📦 Converting authenticated cart to guest cart:', cart.items.length, 'items');
      
      // Convert authenticated cart items to guest cart format
      const preservedGuestItems: GuestCartItem[] = cart.items.map(item => ({
        id: `preserved_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId: item.productId,
        serviceId: item.serviceId,
        quantity: item.quantity,
        addedAt: Date.now(),
        customizations: item.customizations
      }));
      
      // Merge with any existing guest items to prevent overwriting
      let finalGuestItems = preservedGuestItems;
      if (hasExistingGuestItems) {
        try {
          const existingItems = JSON.parse(existingGuestCart!);
          console.log('[CART CONTEXT] 🔗 Merging with existing guest items:', existingItems.length);
          
          // Add existing items that don't conflict with preserved items
          for (const existingItem of existingItems) {
            const conflictIndex = preservedGuestItems.findIndex(p => 
              p.productId === existingItem.productId && p.serviceId === existingItem.serviceId
            );
            if (conflictIndex === -1) {
              finalGuestItems.push(existingItem);
            }
          }
        } catch (error) {
          console.error('[CART CONTEXT] Error merging guest items:', error);
        }
      }
      
      // Save preserved items to localStorage immediately
      try {
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(finalGuestItems));
        console.log('[CART CONTEXT] 💾 Preserved cart saved to localStorage:', finalGuestItems);
        
        // Update guest cart state
        setGuestCart(finalGuestItems);
        
        // Load guest cart as Cart object for immediate display
        await loadGuestCartAsCart();
        
        // Only show toast once for preservation
        toast({
          title: "Cart Preserved",
          description: `${finalGuestItems.length} items saved for your next visit.`,
        });
        
        console.log('[CART CONTEXT] ✅ Cart preservation completed successfully');
      } catch (error) {
        console.error('[CART CONTEXT] ❌ Error preserving cart data:', error);
      }
    } else if (hasExistingGuestItems) {
      console.log('[CART CONTEXT] 🔄 No authenticated cart items but preserving existing guest items');
      // Load existing guest cart without clearing it
      await loadGuestCartAsCart();
    } else {
      console.log('[CART CONTEXT] ℹ️ No cart items to preserve on logout');
      // Still load guest cart in case there were previous guest items
      await loadGuestCartAsCart();
    }
    
    // Clean up preservation flag after a short delay
    setTimeout(() => {
      localStorage.removeItem('recent_cart_preservation');
    }, 3000);
  }, [cart, loadGuestCartAsCart, toast]);

  // Migrate guest cart when user signs in - ALWAYS run on authentication change
  useEffect(() => {
    let migrationTimeout: NodeJS.Timeout;
    
    const migrateGuestCart = async () => {
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
      
      if (!isAuthenticated) {
        console.log('[CART MIGRATION] ℹ️ User not authenticated, skipping migration');
        return;
      }
      
      if (currentGuestCart.length === 0) {
        console.log('[CART MIGRATION] ℹ️ No guest cart items to migrate');
        // Still load authenticated cart even if no guest items
        await loadAuthenticatedCart();
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
        
        // Clear any cached migration flags
        localStorage.removeItem(MIGRATION_FLAG_KEY);
        
        // Immediately refresh authenticated cart
        console.log('[CART MIGRATION] 🔄 Refreshing authenticated cart...');
        await loadAuthenticatedCart();
        
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
        
        // Still load authenticated cart even if migration fails
        await loadAuthenticatedCart();
      }
    };

    // Run migration on every authentication state change to authenticated
    if (isAuthenticated && user?.uid) {
      // Debounce migration to prevent rapid-fire calls
      migrationTimeout = setTimeout(migrateGuestCart, 300);
    } else if (!isAuthenticated) {
      // When user logs out, preserve authenticated cart data as guest cart (run once)
      migrationTimeout = setTimeout(() => {
        preserveCartDataOnLogout();
      }, 100);
    }

    return () => {
      if (migrationTimeout) {
        clearTimeout(migrationTimeout);
      }
    };
  }, [isAuthenticated, user?.uid, loadAuthenticatedCart, loadGuestCartAsCart, cart?.items?.length, toast]);

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

    // Refresh cart once after all operations are complete
    await loadAuthenticatedCart();
    isProcessingAddOperations.current = false;
  }, [loadAuthenticatedCart]);

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
          // Add new item atomically
          const newItem: GuestCartItem = {
            id: optimisticItemId, // Use same ID for consistency
            productId,
            serviceId,
            quantity,
            addedAt: Date.now(),
            customizations
          };
          newCart = [...prev, newItem];
        }
        
        console.log('[CART CONTEXT] Updated guest cart atomically:', newCart);
        
        // Immediately save to localStorage to prevent race conditions
        try {
          localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newCart));
          console.log('[CART CONTEXT] Guest cart saved to localStorage immediately');
        } catch (error) {
          console.error('[CART CONTEXT] Error saving guest cart to localStorage:', error);
        }
        
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
      // Guest cart - immediate removal with instant cart object update
      const newGuestCart = guestCart.filter(item => item.id !== itemId);
      setGuestCart(newGuestCart);
      
      // Immediately update the cart object as well for instant UI sync using reducer
      dispatch({ type: 'REMOVE_ITEM', payload: { itemId } });
      
      console.log('[CART CONTEXT] Removed item from guest cart:', itemId);
      
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
        // For guest cart, update localStorage synchronously
        setGuestCart(prev => {
          const updated = prev.map(item => 
            item.id === itemId ? { ...item, quantity: finalQuantity } : item
          );
          console.log('[CART CONTEXT] Processed guest quantity update:', { itemId, finalQuantity });
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
      setGuestCart(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, quantity, addedAt: Date.now() } : item
        )
      );
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
      // Guest cart - immediate clear
      setGuestCart([]);
      localStorage.removeItem(GUEST_CART_KEY);
      
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