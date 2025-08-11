// Cart reducer for deterministic state management
import type { Cart, CartItem } from '@shared/cart-types';

export interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  guestCart: GuestCartItem[];
  isProcessingMigration: boolean;
}

export interface GuestCartItem {
  id: string;
  productId?: string;
  serviceId?: string;
  quantity: number;
  addedAt: number;
  customizations?: Record<string, any>;
  notes?: string;
}

export type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CART'; payload: Cart | null }
  | { type: 'SET_GUEST_CART'; payload: GuestCartItem[] }
  | { type: 'ADD_ITEM_OPTIMISTIC'; payload: { item: CartItem; isGuest: boolean } }
  | { type: 'REMOVE_ITEM_OPTIMISTIC'; payload: { itemId: string; isGuest: boolean } }
  | { type: 'UPDATE_QUANTITY_OPTIMISTIC'; payload: { itemId: string; quantity: number; isGuest: boolean } }
  | { type: 'CLEAR_GUEST_CART' }
  | { type: 'SET_MIGRATION_STATUS'; payload: boolean }
  | { type: 'REVERT_OPTIMISTIC_UPDATE'; payload: Cart | null };

export const initialCartState: CartState = {
  cart: null,
  isLoading: false,
  error: null,
  guestCart: [],
  isProcessingMigration: false,
};

// Helper functions for cart calculations
export const calculateCartTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const discount = items.reduce((sum, item) => {
    return sum + (item.discount || 0);
  }, 0);
  const shipping = subtotal > 50000 ? 0 : 5000; // Free shipping over ₹500
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const total = subtotal - discount + shipping + tax;
  const savings = items.reduce((sum, item) => {
    const originalPrice = item.originalPrice || item.unitPrice;
    return sum + ((originalPrice - item.unitPrice) * item.quantity);
  }, 0) + discount;

  return {
    subtotal,
    discount,
    shipping,
    tax,
    total,
    savings
  };
};

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_CART':
      return { ...state, cart: action.payload };

    case 'SET_GUEST_CART':
      return { ...state, guestCart: action.payload };

    case 'ADD_ITEM_OPTIMISTIC': {
      if (action.payload.isGuest) {
        // Add to guest cart
        const existingIndex = state.guestCart.findIndex(item => 
          item.productId === action.payload.item.productId || 
          item.serviceId === action.payload.item.serviceId
        );

        const updatedGuestCart = existingIndex >= 0
          ? state.guestCart.map((item, index) =>
              index === existingIndex 
                ? { ...item, quantity: item.quantity + action.payload.item.quantity, addedAt: Date.now() }
                : item
            )
          : [...state.guestCart, {
              id: action.payload.item.id,
              productId: action.payload.item.productId,
              serviceId: action.payload.item.serviceId,
              quantity: action.payload.item.quantity,
              addedAt: Date.now(),
              customizations: action.payload.item.customizations,
              notes: action.payload.item.notes || ''
            }];

        return { ...state, guestCart: updatedGuestCart };
      } else {
        // Add to authenticated cart
        if (!state.cart) return state;

        const existingIndex = state.cart.items.findIndex(item =>
          item.productId === action.payload.item.productId ||
          item.serviceId === action.payload.item.serviceId
        );

        const updatedItems = existingIndex >= 0
          ? state.cart.items.map((item, index) =>
              index === existingIndex
                ? { ...item, quantity: item.quantity + action.payload.item.quantity }
                : item
            )
          : [...state.cart.items, action.payload.item];

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
    }

    case 'REMOVE_ITEM_OPTIMISTIC': {
      if (action.payload.isGuest) {
        const updatedGuestCart = state.guestCart.filter(item => item.id !== action.payload.itemId);
        return { ...state, guestCart: updatedGuestCart };
      } else {
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
    }

    case 'UPDATE_QUANTITY_OPTIMISTIC': {
      if (action.payload.isGuest) {
        const updatedGuestCart = state.guestCart.map(item =>
          item.id === action.payload.itemId
            ? { ...item, quantity: action.payload.quantity, addedAt: Date.now() }
            : item
        );
        return { ...state, guestCart: updatedGuestCart };
      } else {
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
    }

    case 'CLEAR_GUEST_CART':
      return { ...state, guestCart: [] };

    case 'SET_MIGRATION_STATUS':
      return { ...state, isProcessingMigration: action.payload };

    case 'REVERT_OPTIMISTIC_UPDATE':
      return { ...state, cart: action.payload };

    default:
      return state;
  }
}

// Computed selectors
export const selectCartTotalQuantity = (state: CartState): number => {
  if (state.cart) {
    return state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }
  return state.guestCart.reduce((sum, item) => sum + item.quantity, 0);
};

export const selectCartItemsCount = (state: CartState): number => {
  if (state.cart) {
    return state.cart.items.length;
  }
  return state.guestCart.length;
};

export const selectCartTotals = (state: CartState) => {
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
};