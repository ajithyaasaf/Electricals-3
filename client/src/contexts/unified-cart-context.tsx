// Unified Cart Context - Single source of truth with reducer pattern
import { createContext, useContext, useEffect, useReducer, ReactNode, useCallback, useRef, useMemo } from 'react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { Cart, CartItem } from '@shared/cart-types';

// Guest cart item interface
export interface GuestCartItem {
  id: string;
  productId?: string;
  serviceId?: string;
  quantity: number;
  addedAt: number;
  customizations?: Record<string, any>;
  notes?: string;
}

// Cart state interface
interface CartState {
  cart: Cart | null;
  guestCart: GuestCartItem[];
  isLoading: boolean;
  error: string | null;
  isProcessingMigration: boolean;
}

// Cart actions
type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CART'; payload: Cart | null }
  | { type: 'SET_GUEST_CART'; payload: GuestCartItem[] }
  | { type: 'ADD_GUEST_ITEM'; payload: GuestCartItem }
  | { type: 'UPDATE_GUEST_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'REMOVE_GUEST_ITEM'; payload: { itemId: string } }
  | { type: 'OPTIMISTIC_UPDATE_CART_ITEM'; payload: { itemId: string; quantity: number } }
  | { type: 'OPTIMISTIC_REMOVE_CART_ITEM'; payload: { itemId: string } }
  | { type: 'CLEAR_GUEST_CART' }
  | { type: 'SET_MIGRATION_STATUS'; payload: boolean };

// Initial state
const initialState: CartState = {
  cart: null,
  guestCart: [],
  isLoading: false,
  error: null,
  isProcessingMigration: false,
};

// Cart calculations
const calculateCartTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const discount = items.reduce((sum, item) => sum + (item.discount || 0), 0);
  const shipping = subtotal > 50000 ? 0 : 5000; // Free shipping over ₹500
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const total = subtotal - discount + shipping + tax;
  const savings = items.reduce((sum, item) => {
    const originalPrice = item.originalPrice || item.unitPrice;
    return sum + ((originalPrice - item.unitPrice) * item.quantity);
  }, 0) + discount;

  return { subtotal, discount, shipping, tax, total, savings };
};

// Cart reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_CART':
      return { ...state, cart: action.payload };

    case 'SET_GUEST_CART':
      return { ...state, guestCart: action.payload };

    case 'ADD_GUEST_ITEM': {
      const existingIndex = state.guestCart.findIndex(item => 
        item.productId === action.payload.productId || item.serviceId === action.payload.serviceId
      );

      if (existingIndex >= 0) {
        const updatedGuestCart = state.guestCart.map((item, index) =>
          index === existingIndex 
            ? { ...item, quantity: item.quantity + action.payload.quantity, addedAt: Date.now() }
            : item
        );
        return { ...state, guestCart: updatedGuestCart };
      } else {
        return { ...state, guestCart: [...state.guestCart, action.payload] };
      }
    }

    case 'UPDATE_GUEST_QUANTITY': {
      const updatedGuestCart = state.guestCart.map(item =>
        item.id === action.payload.itemId
          ? { ...item, quantity: action.payload.quantity, addedAt: Date.now() }
          : item
      );
      return { ...state, guestCart: updatedGuestCart };
    }

    case 'REMOVE_GUEST_ITEM': {
      const updatedGuestCart = state.guestCart.filter(item => item.id !== action.payload.itemId);
      return { ...state, guestCart: updatedGuestCart };
    }

    case 'OPTIMISTIC_UPDATE_CART_ITEM': {
      if (!state.cart) return state;

      const updatedItems = state.cart.items.map(item =>
        item.id === action.payload.itemId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );

      const totals = calculateCartTotals(updatedItems);

      return {
        ...state,
        cart: {
          ...state.cart,
          items: updatedItems,
          totals,
          lastUpdated: new Date(),
          updatedAt: new Date()
        }
      };
    }

    case 'OPTIMISTIC_REMOVE_CART_ITEM': {
      if (!state.cart) return state;

      const updatedItems = state.cart.items.filter(item => item.id !== action.payload.itemId);
      const totals = calculateCartTotals(updatedItems);

      return {
        ...state,
        cart: {
          ...state.cart,
          items: updatedItems,
          totals,
          lastUpdated: new Date(),
          updatedAt: new Date()
        }
      };
    }

    case 'CLEAR_GUEST_CART':
      return { ...state, guestCart: [] };

    case 'SET_MIGRATION_STATUS':
      return { ...state, isProcessingMigration: action.payload };

    default:
      return state;
  }
}

// Cart context interface
interface CartContextType {
  // Cart data
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  
  // Computed values (single source of truth)
  itemsCount: number;
  totalQuantity: number;
  totals: {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
    savings: number;
  };
  
  // Cart actions
  addItem: (productId?: string, serviceId?: string, quantity?: number, customizations?: Record<string, any>) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  
  // Guest cart
  guestCart: GuestCartItem[];
  
  // Utility
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Storage keys
const GUEST_CART_KEY = 'guestCart';
const MIGRATION_FLAG_KEY = 'cartMigrated';

interface CartProviderProps {
  children: ReactNode;
}

export function UnifiedCartProvider({ children }: CartProviderProps) {
  const { isAuthenticated, user } = useFirebaseAuth();
  const { toast } = useToast();
  
  // State management with reducer
  const [state, dispatch] = useReducer(cartReducer, initialState);
  
  // Computed selectors using useMemo for performance
  const itemsCount = useMemo(() => {
    if (state.cart) {
      return state.cart.items.length;
    }
    return state.guestCart.length;
  }, [state.cart, state.guestCart]);

  const totalQuantity = useMemo(() => {
    if (state.cart) {
      return state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
    }
    return state.guestCart.reduce((sum, item) => sum + item.quantity, 0);
  }, [state.cart, state.guestCart]);

  const totals = useMemo(() => {
    if (state.cart) {
      return state.cart.totals;
    }
    // For guest cart, return default totals structure
    return {
      subtotal: 0,
      discount: 0,
      shipping: 0,
      tax: 0,
      total: 0,
      savings: 0
    };
  }, [state.cart]);
  
  // Request queue for debounced updates
  const updateQueueRef = useRef<Map<string, { quantity: number; timestamp: number }>>(new Map());
  const pendingUpdatesRef = useRef<Set<string>>(new Set());
  const debounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Load guest cart from localStorage on mount
  useEffect(() => {
    const loadGuestCart = () => {
      try {
        const stored = localStorage.getItem(GUEST_CART_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const validCart = Array.isArray(parsed) ? parsed : [];
          dispatch({ type: 'SET_GUEST_CART', payload: validCart });
          console.log('GUEST CART BEFORE LOGIN', validCart);
        }
      } catch (error) {
        console.error('[CART] Error loading guest cart:', error);
        localStorage.removeItem(GUEST_CART_KEY);
      }
    };

    loadGuestCart();
  }, []);

  // Save guest cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(state.guestCart));
    } catch (error) {
      console.error('[CART] Error saving guest cart:', error);
    }
  }, [state.guestCart]);

  // Load authenticated user's cart
  const loadAuthenticatedCart = useCallback(async () => {
    if (!isAuthenticated) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const response = await apiRequest('GET', '/api/cart');
      const cartData = await response.json();
      console.log('[CART] Authenticated cart loaded:', cartData);
      dispatch({ type: 'SET_CART', payload: cartData });
    } catch (error) {
      console.error('[CART] Error loading authenticated cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [isAuthenticated]);

  // Load guest cart as Cart object for display
  const loadGuestCartAsCart = useCallback(async () => {
    if (state.guestCart.length === 0) {
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

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await apiRequest('POST', '/api/cart/guest', {
        items: state.guestCart
      });
      const cartData = await response.json();
      dispatch({ type: 'SET_CART', payload: cartData });
      console.log('[CART] Guest cart loaded as display:', cartData);
    } catch (error) {
      console.error('[CART] Error loading guest cart display:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.guestCart]);

  // Migrate guest cart when user signs in
  useEffect(() => {
    const migrateGuestCart = async () => {
      if (!isAuthenticated || !user || state.guestCart.length === 0 || state.isProcessingMigration) {
        return;
      }

      dispatch({ type: 'SET_MIGRATION_STATUS', payload: true });
      console.log('MIGRATE PAYLOAD', state.guestCart);
      
      try {
        const response = await apiRequest('POST', '/api/cart/migrate', {
          guestCart: state.guestCart,
          userId: user.uid
        });
        const mergedCart = await response.json();
        
        console.log('MIGRATE RESPONSE', mergedCart);
        console.log('SETTING CART CONTEXT', mergedCart);
        
        dispatch({ type: 'SET_CART', payload: mergedCart });
        dispatch({ type: 'CLEAR_GUEST_CART' });
        
        localStorage.removeItem(GUEST_CART_KEY);
        localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
        
        toast({
          title: "Cart Merged",
          description: "Your items have been added to your account",
        });
      } catch (error) {
        console.error('[CART] Error migrating guest cart:', error);
        toast({
          title: "Migration Error",
          description: "Failed to merge cart items",
          variant: "destructive",
        });
      } finally {
        dispatch({ type: 'SET_MIGRATION_STATUS', payload: false });
      }
    };

    if (isAuthenticated && user && state.guestCart.length > 0) {
      // Debounce migration to prevent rapid calls
      const timeout = setTimeout(migrateGuestCart, 500);
      return () => clearTimeout(timeout);
    }
  }, [isAuthenticated, user, state.guestCart, state.isProcessingMigration, toast]);

  // Load cart when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      loadAuthenticatedCart();
    } else {
      loadGuestCartAsCart();
    }
  }, [isAuthenticated, loadAuthenticatedCart, loadGuestCartAsCart]);

  // Add item to cart
  const addItem = useCallback(async (
    productId?: string, 
    serviceId?: string, 
    quantity: number = 1, 
    customizations?: Record<string, any>
  ) => {
    console.log('[CART] Adding item:', { productId, serviceId, quantity, isAuthenticated });

    if (isAuthenticated) {
      // Authenticated user - use server API with optimistic updates
      try {
        const response = await apiRequest('POST', '/api/cart/items', {
          productId,
          serviceId,
          quantity,
          customizations
        });
        
        await loadAuthenticatedCart(); // Refresh cart from server
        
        toast({
          title: "Added to Cart",
          description: "Item added successfully",
        });
      } catch (error) {
        console.error('[CART] Error adding item:', error);
        toast({
          title: "Error",
          description: "Failed to add item to cart",
          variant: "destructive",
        });
      }
    } else {
      // Guest user - immediate local update
      const newItem: GuestCartItem = {
        id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId,
        serviceId,
        quantity,
        addedAt: Date.now(),
        customizations,
        notes: ''
      };

      dispatch({ type: 'ADD_GUEST_ITEM', payload: newItem });
      
      // Update display cart
      setTimeout(() => loadGuestCartAsCart(), 50);
      
      toast({
        title: "Added to Cart",
        description: "Item added successfully",
      });
    }
  }, [isAuthenticated, loadAuthenticatedCart, loadGuestCartAsCart, toast]);

  // Remove item from cart
  const removeItem = useCallback(async (itemId: string) => {
    console.log('[CART] Removing item:', { itemId, isAuthenticated });

    if (isAuthenticated) {
      // Optimistic removal
      dispatch({ type: 'OPTIMISTIC_REMOVE_CART_ITEM', payload: { itemId } });
      
      try {
        await apiRequest('DELETE', `/api/cart/items/${itemId}`);
        
        toast({
          title: "Removed",
          description: "Item removed from cart",
        });
      } catch (error) {
        console.error('[CART] Error removing item:', error);
        // Revert by reloading
        await loadAuthenticatedCart();
        toast({
          title: "Error",
          description: "Failed to remove item",
          variant: "destructive",
        });
      }
    } else {
      // Guest user - immediate removal
      dispatch({ type: 'REMOVE_GUEST_ITEM', payload: { itemId } });
      setTimeout(() => loadGuestCartAsCart(), 50);
      
      toast({
        title: "Removed",
        description: "Item removed from cart",
      });
    }
  }, [isAuthenticated, loadAuthenticatedCart, loadGuestCartAsCart, toast]);

  // Update item quantity with debouncing
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    console.log('[CART] Updating quantity:', { itemId, quantity, isAuthenticated });

    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }

    if (isAuthenticated) {
      // Optimistic update
      dispatch({ type: 'OPTIMISTIC_UPDATE_CART_ITEM', payload: { itemId, quantity } });

      // Debounced server update
      updateQueueRef.current.set(itemId, { quantity, timestamp: Date.now() });

      // Clear existing timer
      const existingTimer = debounceTimersRef.current.get(itemId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Set new debounced timer
      const newTimer = setTimeout(async () => {
        const queuedUpdate = updateQueueRef.current.get(itemId);
        if (queuedUpdate && !pendingUpdatesRef.current.has(itemId)) {
          pendingUpdatesRef.current.add(itemId);
          
          try {
            await apiRequest('PATCH', `/api/cart/items/${itemId}`, { 
              quantity: queuedUpdate.quantity 
            });
            
            console.log('[CART] Server quantity update completed');
            toast({
              title: "Updated",
              description: "Quantity updated successfully",
            });
          } catch (error) {
            console.error('[CART] Error updating quantity:', error);
            // Revert optimistic update
            await loadAuthenticatedCart();
            toast({
              title: "Error",
              description: "Failed to update quantity",
              variant: "destructive",
            });
          } finally {
            pendingUpdatesRef.current.delete(itemId);
            updateQueueRef.current.delete(itemId);
          }
        }
        debounceTimersRef.current.delete(itemId);
      }, 300);

      debounceTimersRef.current.set(itemId, newTimer);
    } else {
      // Guest user - immediate update
      dispatch({ type: 'UPDATE_GUEST_QUANTITY', payload: { itemId, quantity } });
      setTimeout(() => loadGuestCartAsCart(), 50);
    }
  }, [isAuthenticated, removeItem, loadAuthenticatedCart, loadGuestCartAsCart, toast]);

  // Clear cart
  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await apiRequest('DELETE', '/api/cart');
        await loadAuthenticatedCart();
        
        toast({
          title: "Cart Cleared",
          description: "All items removed from cart",
        });
      } catch (error) {
        console.error('[CART] Error clearing cart:', error);
        toast({
          title: "Error",
          description: "Failed to clear cart",
          variant: "destructive",
        });
      }
    } else {
      dispatch({ type: 'CLEAR_GUEST_CART' });
      await loadGuestCartAsCart();
      
      toast({
        title: "Cart Cleared",
        description: "All items removed from cart",
      });
    }
  }, [isAuthenticated, loadAuthenticatedCart, loadGuestCartAsCart, toast]);

  // Refresh cart
  const refreshCart = useCallback(async () => {
    if (isAuthenticated) {
      await loadAuthenticatedCart();
    } else {
      await loadGuestCartAsCart();
    }
  }, [isAuthenticated, loadAuthenticatedCart, loadGuestCartAsCart]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      debounceTimersRef.current.forEach(timer => clearTimeout(timer));
      debounceTimersRef.current.clear();
      updateQueueRef.current.clear();
      pendingUpdatesRef.current.clear();
    };
  }, []);

  const contextValue: CartContextType = {
    cart: state.cart,
    isLoading: state.isLoading,
    error: state.error,
    itemsCount,
    totalQuantity,
    totals,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    guestCart: state.guestCart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use cart context
export function useUnifiedCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useUnifiedCart must be used within a UnifiedCartProvider');
  }
  return context;
}

// Export for backward compatibility
export const useCartContext = useUnifiedCart;