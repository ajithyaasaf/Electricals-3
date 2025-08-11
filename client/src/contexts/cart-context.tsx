// Global Cart Context - Unified state management for guest and authenticated users
import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
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

  // Save guest cart to localStorage whenever it changes (debounced)
  useEffect(() => {
    // Clear existing timeout
    if (saveGuestCartTimeoutRef.current) {
      clearTimeout(saveGuestCartTimeoutRef.current);
    }
    
    // Debounce localStorage saves to prevent multiple rapid writes
    saveGuestCartTimeoutRef.current = setTimeout(() => {
      try {
        console.log('[CART CONTEXT] Saving guest cart to localStorage:', guestCart);
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart));
      } catch (error) {
        console.error('[CART CONTEXT] Error saving guest cart:', error);
      }
    }, 100);
    
    return () => {
      if (saveGuestCartTimeoutRef.current) {
        clearTimeout(saveGuestCartTimeoutRef.current);
      }
    };
  }, [guestCart]);

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
      setCart(cartData);
    } catch (error) {
      console.error('[CART CONTEXT] ❌ Error loading authenticated cart:', error);
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

  // Migrate guest cart when user signs in (with proper debouncing)
  useEffect(() => {
    let migrationTimeout: NodeJS.Timeout;
    
    const migrateGuestCart = async () => {
      if (!isAuthenticated || guestCart.length === 0) {
        if (isAuthenticated && guestCart.length === 0) {
          console.log('[CART MIGRATION] ℹ️ User authenticated but no guest cart items to migrate');
        }
        return;
      }

      console.log('[CART MIGRATION] 🚀 Starting cart migration...');
      console.log('[CART MIGRATION] 📦 Guest cart data:', JSON.stringify(guestCart, null, 2));
      console.log('[CART MIGRATION] 👤 User ID:', user?.uid);
      
      try {
        // Set migration flag immediately to prevent race conditions
        const migrationKey = `migration_${user?.uid}_${Date.now()}`;
        localStorage.setItem(MIGRATION_FLAG_KEY, migrationKey);
        
        console.log('[CART MIGRATION] 📤 Sending migration request to server...');
        const response = await apiRequest('POST', '/api/cart/migrate', {
          guestItems: guestCart
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
        
        // Immediately refresh authenticated cart
        console.log('[CART MIGRATION] 🔄 Refreshing authenticated cart...');
        await loadAuthenticatedCart();
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('cart-migrated'));
        
        toast({
          title: "Cart Synced",
          description: `${migrationResult.totalItems || 0} items merged successfully.`,
        });
        
        console.log('[CART MIGRATION] ✅ Cart migration completed successfully');
      } catch (error) {
        console.error('[CART MIGRATION] ❌ Cart migration failed:', error);
        // Remove migration flag on failure to allow retry
        localStorage.removeItem(MIGRATION_FLAG_KEY);
        
        toast({
          title: "Sync Warning",
          description: "Some cart items couldn't be synced. Please check your cart.",
          variant: "destructive",
        });
      }
    };

    // Check if migration is needed and not already in progress
    const shouldMigrate = isAuthenticated && guestCart.length > 0 && user?.uid;
    const existingFlag = localStorage.getItem(MIGRATION_FLAG_KEY);
    const isMigrationInProgress = existingFlag && existingFlag.includes(user?.uid || '');
    
    if (shouldMigrate && !isMigrationInProgress) {
      // Debounce migration to prevent rapid-fire calls
      migrationTimeout = setTimeout(migrateGuestCart, 300);
    }

    return () => {
      if (migrationTimeout) {
        clearTimeout(migrationTimeout);
      }
    };
  }, [isAuthenticated, user?.uid, guestCart.length > 0 ? JSON.stringify(guestCart) : '', loadAuthenticatedCart, toast]);

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
      // Optimistically add to cart display immediately
      setCart(prev => {
        if (!prev) {
          // If no cart exists, create a basic structure
          const newCart: Cart = {
            id: `temp_cart_${Date.now()}`,
            items: [],
            totals: { subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0, savings: 0 },
            currency: 'INR',
            lastUpdated: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            appliedCoupons: [],
            userId: user?.uid,
            sessionId: undefined,
            shippingAddress: undefined,
            expiresAt: undefined
          };
          prev = newCart;
        }

        // Check if item already exists
        const existingItemIndex = prev.items.findIndex(item => 
          (item.productId === productId || item.serviceId === serviceId)
        );

        if (existingItemIndex >= 0) {
          // Update existing item quantity
          const updatedItems = prev.items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
          
          return {
            ...prev,
            items: updatedItems
          };
        } else {
          // Add new item with temporary data
          const newItem: CartItem = {
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
            // Note: product/service details will be loaded from server
          };

          return {
            ...prev,
            items: [...prev.items, newItem]
          };
        }
      });

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
            setCart(prev => {
              if (!prev) return prev;
              return {
                ...prev,
                items: prev.items.filter(item => item.id !== optimisticItemId)
              };
            });
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
      // Guest user - immediate update with optimistic UI
      console.log('[CART CONTEXT] Adding item to guest cart:', { productId, serviceId, quantity });
      
      // Update guest cart array immediately
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
        return newCart;
      });

      // Also immediately update the cart display object optimistically
      setCart(prev => {
        if (!prev) {
          // Create empty cart structure
          prev = {
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
          };
        }

        // Check if item already exists in display cart
        const existingItemIndex = prev.items.findIndex(item => 
          (item.productId === productId || item.serviceId === serviceId)
        );

        if (existingItemIndex >= 0) {
          // Update existing item
          const updatedItems = prev.items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
          
          return {
            ...prev,
            items: updatedItems
          };
        } else {
          // Add new optimistic item
          const newItem: CartItem = {
            id: optimisticItemId,
            productId,
            serviceId,
            quantity,
            unitPrice: 0,
            originalPrice: 0,
            discount: 0,
            appliedCoupons: [],
            customizations: customizations || {},
            notes: '',
            savedForLater: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            // Note: product/service details will be loaded from server
          };

          return {
            ...prev,
            items: [...prev.items, newItem]
          };
        }
      });
      
      // Update full cart object with proper data shortly after
      setTimeout(() => loadGuestCartAsCart(), 50);
      
      toast({
        title: "Added to Cart",
        description: "Item added successfully",
      });
    }
  }, [isAuthenticated, processAddOperationQueue, loadGuestCartAsCart, toast, user]);

  const removeItem = useCallback(async (itemId: string) => {
    // Immediate optimistic removal for instant UI feedback
    if (isAuthenticated) {
      // Optimistically remove from cart display
      setCart(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.filter(item => item.id !== itemId)
        };
      });
      
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
      
      // Immediately update the cart object as well for instant UI sync
      setCart(prev => {
        if (!prev) return prev;
        const filteredItems = prev.items.filter(item => item.id !== itemId);
        
        // Recalculate totals based on remaining items
        const subtotal = filteredItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
        const discount = 0; // Calculate any applicable discounts
        const shipping = subtotal > 50000 ? 0 : 5000; // Free shipping over ₹500
        const tax = Math.round(subtotal * 0.18); // 18% GST
        const total = subtotal - discount + shipping + tax;
        const savings = filteredItems.reduce((sum, item) => {
          const originalPrice = item.originalPrice || item.unitPrice;
          return sum + ((originalPrice - item.unitPrice) * item.quantity);
        }, 0);
        
        return {
          ...prev,
          items: filteredItems,
          totals: {
            subtotal,
            discount,
            shipping,
            tax,
            total,
            savings
          },
          lastUpdated: new Date(),
          updatedAt: new Date()
        };
      });
      
      console.log('[CART CONTEXT] Removed item from guest cart:', itemId);
      
      toast({
        title: "Removed",
        description: "Item removed from cart",
      });
    }
  }, [isAuthenticated, guestCart, loadAuthenticatedCart, loadGuestCartAsCart, toast]);

  // Debounced quantity update processor
  const processQuantityUpdate = useCallback(async (itemId: string, finalQuantity: number) => {
    if (finalQuantity <= 0) {
      await removeItem(itemId);
      return;
    }

    if (pendingUpdatesRef.current.has(itemId)) {
      return; // Already processing this item
    }

    pendingUpdatesRef.current.add(itemId);

    try {
      if (isAuthenticated) {
        await apiRequest('PATCH', `/api/cart/items/${itemId}`, { quantity: finalQuantity });
        await loadAuthenticatedCart();
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
      console.error('[CART CONTEXT] Error processing quantity update:', error);
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
    // Immediately update UI optimistically
    if (isAuthenticated) {
      setCart(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map(item => 
            item.id === itemId ? { ...item, quantity } : item
          )
        };
      });
    } else {
      setGuestCart(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }

    // Queue the update for processing
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
    // Immediate optimistic clear for instant UI feedback
    setCart(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        items: []
      };
    });
    
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
      
      // Set cart to empty state immediately
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
        sessionId: `guest_session_${Date.now()}`,
        shippingAddress: undefined,
        expiresAt: undefined
      });
      
      console.log('[CART CONTEXT] Cleared guest cart');
      
      toast({
        title: "Cart Cleared",
        description: "All items removed from cart",
      });
    }
  }, [isAuthenticated, loadAuthenticatedCart, loadGuestCartAsCart, toast]);

  // Calculate cart statistics with real-time updates
  const itemsCount = cart?.items?.length || 0;
  const totalQuantity = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // For guest users, also include items not yet synced to Cart object
  const guestItemsCount = !isAuthenticated ? guestCart.length : 0;
  const guestTotalQuantity = !isAuthenticated ? guestCart.reduce((sum, item) => sum + item.quantity, 0) : 0;
  
  // Use guest data if cart is not loaded yet (instant feedback)
  const finalItemsCount = cart ? itemsCount : guestItemsCount;
  const finalTotalQuantity = cart ? totalQuantity : guestTotalQuantity;

  const value: CartContextType = {
    cart,
    isLoading,
    error,
    itemsCount: finalItemsCount,
    totalQuantity: finalTotalQuantity,
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