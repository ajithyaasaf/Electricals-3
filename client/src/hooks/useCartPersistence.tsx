// Advanced Cart Persistence Hook with Guest-to-User Migration
import { useState, useEffect, useCallback } from 'react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

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

// Storage keys
const GUEST_CART_KEY = 'guestCart';
const MIGRATION_FLAG_KEY = 'cartMigrated';

export function useCartPersistence() {
  const { isAuthenticated, user } = useFirebaseAuth();
  const { toast } = useToast();
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load guest cart from localStorage on mount
  useEffect(() => {
    const loadGuestCart = () => {
      try {
        const stored = localStorage.getItem(GUEST_CART_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setGuestCart(Array.isArray(parsed) ? parsed : []);
        }
      } catch (error) {
        console.error('Error loading guest cart:', error);
        localStorage.removeItem(GUEST_CART_KEY);
      }
    };

    loadGuestCart();
  }, []);

  // Save guest cart to localStorage whenever it changes
  useEffect(() => {
    try {
      console.log('[GUEST CART] Saving to localStorage:', guestCart);
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart));
      
      // Verify it was saved correctly
      const saved = localStorage.getItem(GUEST_CART_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      console.log('[GUEST CART] Verified saved cart:', parsed);
    } catch (error) {
      console.error('[GUEST CART] Error saving guest cart:', error);
    }
  }, [guestCart]);

  // Add item to guest cart with enhanced debugging
  const addToGuestCart = useCallback((
    productId?: string, 
    serviceId?: string, 
    quantity: number = 1,
    customizations?: Record<string, any>,
    notes?: string
  ) => {
    if (!productId && !serviceId) {
      console.warn('[GUEST CART] No productId or serviceId provided');
      return;
    }

    console.log('[GUEST CART] Adding item:', { productId, serviceId, quantity });

    setGuestCart(prev => {
      console.log('[GUEST CART] Current cart before addition:', prev);
      
      const existingIndex = prev.findIndex(item => 
        item.productId === productId && item.serviceId === serviceId
      );

      if (existingIndex >= 0) {
        // Update existing item quantity
        console.log('[GUEST CART] Found existing item at index:', existingIndex);
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
          customizations: { ...updated[existingIndex].customizations, ...customizations },
          notes: notes || updated[existingIndex].notes
        };
        console.log('[GUEST CART] Updated cart:', updated);
        return updated;
      } else {
        // Add new item
        const newItem: GuestCartItem = {
          id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          productId,
          serviceId,
          quantity,
          addedAt: Date.now(),
          customizations,
          notes
        };
        console.log('[GUEST CART] Adding new item:', newItem);
        const newCart = [...prev, newItem];
        console.log('[GUEST CART] New cart after addition:', newCart);
        return newCart;
      }
    });
  }, []);

  // Remove item from guest cart
  const removeFromGuestCart = useCallback((itemId: string) => {
    setGuestCart(prev => prev.filter(item => item.id !== itemId));
  }, []);

  // Update quantity in guest cart
  const updateGuestCartQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromGuestCart(itemId);
      return;
    }

    setGuestCart(prev => prev.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ));
  }, [removeFromGuestCart]);

  // Clear guest cart
  const clearGuestCart = useCallback(() => {
    console.log('[GUEST CART] Clearing guest cart');
    setGuestCart([]);
    localStorage.removeItem(GUEST_CART_KEY);
    localStorage.removeItem(MIGRATION_FLAG_KEY);
  }, []);

  // Get total items count
  const getCartItemsCount = useCallback(() => {
    return guestCart.reduce((total, item) => total + item.quantity, 0);
  }, [guestCart]);

  // Validate cart item (check if product/service still exists and available)
  const validateCartItem = useCallback(async (item: GuestCartItem) => {
    try {
      if (item.productId) {
        const response = await fetch(`/api/products/${item.productId}`);
        if (!response.ok) return { valid: false, reason: 'Product no longer available' };
        
        const product = await response.json();
        if (!product.isActive) return { valid: false, reason: 'Product discontinued' };
        if (product.stock < item.quantity) {
          return { 
            valid: false, 
            reason: `Only ${product.stock} items available`,
            maxQuantity: product.stock 
          };
        }
      }

      if (item.serviceId) {
        const response = await fetch(`/api/services/${item.serviceId}`);
        if (!response.ok) return { valid: false, reason: 'Service no longer available' };
        
        const service = await response.json();
        if (!service.isActive) return { valid: false, reason: 'Service discontinued' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, reason: 'Unable to verify item availability' };
    }
  }, []);

  // Migrate guest cart to authenticated user cart with enhanced debugging
  const migrateToUserCart = useCallback(async (): Promise<{ success: boolean; errors: string[] }> => {
    console.log('[CART MIGRATION] Starting migration...');
    console.log('[CART MIGRATION] Auth state:', { isAuthenticated, hasUser: !!user });
    console.log('[CART MIGRATION] Guest cart to migrate:', guestCart);

    if (!isAuthenticated || !user) {
      console.log('[CART MIGRATION] User not authenticated, skipping migration');
      return { success: true, errors: [] };
    }

    if (guestCart.length === 0) {
      console.log('[CART MIGRATION] Guest cart is empty, skipping migration');
      return { success: true, errors: [] };
    }

    setIsLoading(true);
    const errors: string[] = [];
    let successCount = 0;

    try {
      console.log('[CART MIGRATION] Fetching user cart...');
      // Get user's existing cart
      const userCartResponse = await apiRequest('GET', '/api/cart');
      console.log('[CART MIGRATION] User cart response status:', userCartResponse.status);
      
      let userCart;
      if (userCartResponse.ok) {
        userCart = await userCartResponse.json();
        console.log('[CART MIGRATION] Current user cart:', userCart);
      } else {
        console.log('[CART MIGRATION] Failed to fetch user cart, using empty cart');
        userCart = { items: [] };
      }
      
      const existingItems = userCart.items || [];
      console.log('[CART MIGRATION] Existing items in user cart:', existingItems);

      // Process each guest cart item
      for (let i = 0; i < guestCart.length; i++) {
        const guestItem = guestCart[i];
        console.log(`[CART MIGRATION] Processing guest item ${i + 1}/${guestCart.length}:`, guestItem);

        try {
          // Validate item first
          console.log('[CART MIGRATION] Validating item...');
          const validation = await validateCartItem(guestItem);
          if (!validation.valid) {
            console.log('[CART MIGRATION] Item validation failed:', validation.reason);
            errors.push(`${guestItem.productId ? 'Product' : 'Service'}: ${validation.reason}`);
            continue;
          }

          // Check if item already exists in user cart
          const existingItem = existingItems.find((item: any) =>
            item.productId === guestItem.productId && item.serviceId === guestItem.serviceId
          );

          if (existingItem) {
            console.log('[CART MIGRATION] Found existing item, merging quantities:', existingItem);
            // Merge quantities
            const newQuantity = existingItem.quantity + guestItem.quantity;
            console.log('[CART MIGRATION] New quantity:', newQuantity);
            
            const updateResponse = await apiRequest('PUT', `/api/cart/items/${existingItem.id}`, {
              quantity: newQuantity,
              customizations: { ...existingItem.customizations, ...guestItem.customizations },
              notes: guestItem.notes || existingItem.notes
            });
            console.log('[CART MIGRATION] Update response status:', updateResponse.status);
          } else {
            console.log('[CART MIGRATION] Adding new item to user cart...');
            // Add new item to user cart
            const addResponse = await apiRequest('POST', '/api/cart', {
              productId: guestItem.productId,
              serviceId: guestItem.serviceId,
              quantity: guestItem.quantity,
              customizations: guestItem.customizations,
              notes: guestItem.notes
            });
            console.log('[CART MIGRATION] Add response status:', addResponse.status);
          }

          successCount++;
          console.log('[CART MIGRATION] Successfully processed item, success count:', successCount);
        } catch (error) {
          console.error('[CART MIGRATION] Error migrating cart item:', error);
          errors.push(`Failed to add ${guestItem.productId ? 'product' : 'service'} to cart`);
        }
      }

      console.log('[CART MIGRATION] Migration completed. Success count:', successCount, 'Errors:', errors);

      // Clear guest cart after successful migration
      if (successCount > 0) {
        console.log('[CART MIGRATION] Clearing guest cart after successful migration');
        localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
        clearGuestCart();
      }

      return { success: successCount > 0, errors };

    } catch (error) {
      console.error('[CART MIGRATION] Cart migration failed:', error);
      return { success: false, errors: ['Failed to migrate cart items'] };
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, guestCart, validateCartItem, clearGuestCart]);

  // Auto-migrate when user logs in with enhanced debugging
  useEffect(() => {
    const handleAutoMigration = async () => {
      console.log('[AUTO MIGRATION] Effect triggered');
      console.log('[AUTO MIGRATION] State:', { 
        isAuthenticated, 
        hasUser: !!user, 
        guestCartLength: guestCart.length,
        guestCart: guestCart
      });

      if (isAuthenticated && user && guestCart.length > 0) {
        const migrated = localStorage.getItem(MIGRATION_FLAG_KEY);
        console.log('[AUTO MIGRATION] Migration flag:', migrated);
        
        if (migrated) {
          console.log('[AUTO MIGRATION] Already migrated, skipping');
          return;
        }

        try {
          console.log('[AUTO MIGRATION] Starting migration process...');
          const itemCount = guestCart.length; // Store count before migration clears it
          const result = await migrateToUserCart();
          
          console.log('[AUTO MIGRATION] Migration result:', result);
          
          // Trigger cart query refresh after migration
          if (typeof window !== 'undefined' && window.location) {
            console.log('[AUTO MIGRATION] Triggering cart refresh...');
            window.dispatchEvent(new CustomEvent('cart-migrated'));
          }
          
          if (result.success) {
            toast({
              title: "Cart merged successfully",
              description: `${itemCount} items added to your account`,
              duration: 3000,
            });
          }

          if (result.errors.length > 0) {
            toast({
              title: "Some items couldn't be added",
              description: result.errors.join(', '),
              variant: "destructive",
              duration: 5000,
            });
          }
        } catch (error) {
          console.error('[AUTO MIGRATION] Auto-migration failed:', error);
          toast({
            title: "Cart merge failed",
            description: "Please try refreshing the page",
            variant: "destructive",
          });
        }
      } else {
        console.log('[AUTO MIGRATION] Conditions not met for migration');
      }
    };

    // Small delay to ensure user authentication is stable
    console.log('[AUTO MIGRATION] Setting up migration timer');
    const timer = setTimeout(handleAutoMigration, 1000);
    return () => {
      console.log('[AUTO MIGRATION] Cleaning up migration timer');
      clearTimeout(timer);
    };
  }, [isAuthenticated, user, guestCart.length, migrateToUserCart, toast]);

  return {
    // Guest cart state
    guestCart,
    isLoading,
    
    // Guest cart actions
    addToGuestCart,
    removeFromGuestCart,
    updateGuestCartQuantity,
    clearGuestCart,
    getCartItemsCount,
    
    // Migration actions
    migrateToUserCart,
    validateCartItem,
  };
}