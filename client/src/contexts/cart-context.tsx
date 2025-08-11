// Global Cart Context - Unified state management for guest and authenticated users
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
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

// Cart context interface
interface CartContextType {
  // Cart data
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  
  // Cart statistics
  itemsCount: number;
  totalQuantity: number;
  
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
  
  // State management
  const [cart, setCart] = useState<Cart | null>(null);
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Save guest cart to localStorage whenever it changes
  useEffect(() => {
    try {
      console.log('[CART CONTEXT] Saving guest cart to localStorage:', guestCart);
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart));
    } catch (error) {
      console.error('[CART CONTEXT] Error saving guest cart:', error);
    }
  }, [guestCart]);

  // Load authenticated user's cart
  const loadAuthenticatedCart = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('GET', '/api/cart');
      const cartData = await response.json();
      setCart(cartData);
      console.log('[CART CONTEXT] Loaded authenticated cart:', cartData);
    } catch (error) {
      console.error('[CART CONTEXT] Error loading authenticated cart:', error);
      setError('Failed to load cart');
      // Fallback to empty cart
      setCart({
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
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Load guest cart as Cart object
  const loadGuestCartAsCart = useCallback(async () => {
    if (guestCart.length === 0) {
      setCart({
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
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/cart/guest', {
        items: guestCart
      });
      const cartData = await response.json();
      setCart(cartData);
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

  // Migrate guest cart when user signs in
  useEffect(() => {
    const migrateGuestCart = async () => {
      if (isAuthenticated && guestCart.length > 0) {
        console.log('[CART CONTEXT] Starting cart migration...');
        
        try {
          // Prevent multiple migrations
          const migrationKey = `migration_${user?.uid}_${Date.now()}`;
          if (localStorage.getItem(MIGRATION_FLAG_KEY) === migrationKey) return;
          
          await apiRequest('POST', '/api/cart/migrate', {
            guestItems: guestCart
          });
          
          // Clear guest cart after successful migration
          setGuestCart([]);
          localStorage.removeItem(GUEST_CART_KEY);
          localStorage.setItem(MIGRATION_FLAG_KEY, migrationKey);
          
          // Refresh authenticated cart
          await loadAuthenticatedCart();
          
          // Dispatch event for other components
          window.dispatchEvent(new CustomEvent('cart-migrated'));
          
          toast({
            title: "Cart Synced",
            description: "Your cart items have been saved to your account.",
          });
          
          console.log('[CART CONTEXT] Cart migration completed successfully');
        } catch (error) {
          console.error('[CART CONTEXT] Cart migration failed:', error);
          toast({
            title: "Sync Warning",
            description: "Some cart items couldn't be synced. Please check your cart.",
            variant: "destructive",
          });
        }
      }
    };

    migrateGuestCart();
  }, [isAuthenticated, user, guestCart, loadAuthenticatedCart, toast]);

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

    if (isAuthenticated) {
      // Authenticated user - add to server cart
      setIsLoading(true);
      try {
        await apiRequest('POST', '/api/cart/items', {
          productId,
          serviceId,
          quantity,
          customizations
        });
        
        await loadAuthenticatedCart();
        
        toast({
          title: "Added to Cart",
          description: `Item added successfully`,
        });
      } catch (error) {
        console.error('[CART CONTEXT] Error adding item to authenticated cart:', error);
        toast({
          title: "Error",
          description: "Failed to add item to cart",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // Guest user - add to localStorage cart
      console.log('[CART CONTEXT] Adding item to guest cart:', { productId, serviceId, quantity });
      
      setGuestCart(prev => {
        const existingIndex = prev.findIndex(item => 
          item.productId === productId && item.serviceId === serviceId
        );
        
        let newCart: GuestCartItem[];
        
        if (existingIndex >= 0) {
          // Update existing item quantity
          newCart = prev.map((item, index) => 
            index === existingIndex 
              ? { ...item, quantity: item.quantity + quantity, addedAt: Date.now() }
              : item
          );
        } else {
          // Add new item
          const newItem: GuestCartItem = {
            id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            productId,
            serviceId,
            quantity,
            addedAt: Date.now(),
            customizations
          };
          newCart = [...prev, newItem];
        }
        
        console.log('[CART CONTEXT] Updated guest cart:', newCart);
        
        // Refresh cart display
        setTimeout(() => loadGuestCartAsCart(), 100);
        
        return newCart;
      });
      
      toast({
        title: "Added to Cart",
        description: `Item added successfully`,
      });
    }
  }, [isAuthenticated, loadAuthenticatedCart, loadGuestCartAsCart, toast]);

  const removeItem = useCallback(async (itemId: string) => {
    if (isAuthenticated) {
      setIsLoading(true);
      try {
        await apiRequest('DELETE', `/api/cart/items/${itemId}`);
        await loadAuthenticatedCart();
      } catch (error) {
        console.error('[CART CONTEXT] Error removing item:', error);
        toast({
          title: "Error",
          description: "Failed to remove item",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      setGuestCart(prev => prev.filter(item => item.id !== itemId));
      setTimeout(() => loadGuestCartAsCart(), 100);
    }
  }, [isAuthenticated, loadAuthenticatedCart, loadGuestCartAsCart, toast]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }

    if (isAuthenticated) {
      setIsLoading(true);
      try {
        await apiRequest('PATCH', `/api/cart/items/${itemId}`, { quantity });
        await loadAuthenticatedCart();
      } catch (error) {
        console.error('[CART CONTEXT] Error updating quantity:', error);
        toast({
          title: "Error",
          description: "Failed to update quantity",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      setGuestCart(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        )
      );
      setTimeout(() => loadGuestCartAsCart(), 100);
    }
  }, [isAuthenticated, loadAuthenticatedCart, loadGuestCartAsCart, removeItem, toast]);

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      setIsLoading(true);
      try {
        await apiRequest('DELETE', '/api/cart');
        await loadAuthenticatedCart();
      } catch (error) {
        console.error('[CART CONTEXT] Error clearing cart:', error);
        toast({
          title: "Error",
          description: "Failed to clear cart",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      setGuestCart([]);
      localStorage.removeItem(GUEST_CART_KEY);
      setTimeout(() => loadGuestCartAsCart(), 100);
    }
  }, [isAuthenticated, loadAuthenticatedCart, loadGuestCartAsCart, toast]);

  // Calculate cart statistics
  const itemsCount = cart?.items?.length || 0;
  const totalQuantity = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const value: CartContextType = {
    cart,
    isLoading,
    error,
    itemsCount,
    totalQuantity,
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