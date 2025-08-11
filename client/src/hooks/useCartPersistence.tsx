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
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart));
    } catch (error) {
      console.error('Error saving guest cart:', error);
    }
  }, [guestCart]);

  // Add item to guest cart
  const addToGuestCart = useCallback((
    productId?: string, 
    serviceId?: string, 
    quantity: number = 1,
    customizations?: Record<string, any>,
    notes?: string
  ) => {
    if (!productId && !serviceId) return;

    setGuestCart(prev => {
      const existingIndex = prev.findIndex(item => 
        item.productId === productId && item.serviceId === serviceId
      );

      if (existingIndex >= 0) {
        // Update existing item quantity
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
          customizations: { ...updated[existingIndex].customizations, ...customizations },
          notes: notes || updated[existingIndex].notes
        };
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
        return [...prev, newItem];
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

  // Migrate guest cart to authenticated user cart with smart merging
  const migrateToUserCart = useCallback(async (): Promise<{ success: boolean; errors: string[] }> => {
    if (!isAuthenticated || !user || guestCart.length === 0) {
      return { success: true, errors: [] };
    }

    setIsLoading(true);
    const errors: string[] = [];
    let successCount = 0;

    try {
      // Get user's existing cart
      const userCartResponse = await apiRequest('GET', '/api/cart');
      const userCart = userCartResponse.ok ? await userCartResponse.json() : { items: [] };
      const existingItems = userCart.items || [];

      // Process each guest cart item
      for (const guestItem of guestCart) {
        try {
          // Validate item first
          const validation = await validateCartItem(guestItem);
          if (!validation.valid) {
            errors.push(`${guestItem.productId ? 'Product' : 'Service'}: ${validation.reason}`);
            continue;
          }

          // Check if item already exists in user cart
          const existingItem = existingItems.find((item: any) =>
            item.productId === guestItem.productId && item.serviceId === guestItem.serviceId
          );

          if (existingItem) {
            // Merge quantities
            const newQuantity = existingItem.quantity + guestItem.quantity;
            await apiRequest('PUT', `/api/cart/items/${existingItem.id}`, {
              quantity: newQuantity,
              customizations: { ...existingItem.customizations, ...guestItem.customizations },
              notes: guestItem.notes || existingItem.notes
            });
          } else {
            // Add new item to user cart
            await apiRequest('POST', '/api/cart', {
              productId: guestItem.productId,
              serviceId: guestItem.serviceId,
              quantity: guestItem.quantity,
              customizations: guestItem.customizations,
              notes: guestItem.notes
            });
          }

          successCount++;
        } catch (error) {
          console.error('Error migrating cart item:', error);
          errors.push(`Failed to add ${guestItem.productId ? 'product' : 'service'} to cart`);
        }
      }

      // Clear guest cart after successful migration
      if (successCount > 0) {
        clearGuestCart();
        localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
      }

      return { success: successCount > 0, errors };

    } catch (error) {
      console.error('Cart migration failed:', error);
      return { success: false, errors: ['Failed to migrate cart items'] };
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, guestCart, validateCartItem, clearGuestCart]);

  // Auto-migrate when user logs in
  useEffect(() => {
    const handleAutoMigration = async () => {
      if (isAuthenticated && user && guestCart.length > 0) {
        const migrated = localStorage.getItem(MIGRATION_FLAG_KEY);
        if (migrated) return; // Already migrated

        try {
          const result = await migrateToUserCart();
          
          if (result.success) {
            toast({
              title: "Cart merged successfully",
              description: `${guestCart.length} items added to your account`,
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
          console.error('Auto-migration failed:', error);
          toast({
            title: "Cart merge failed",
            description: "Please try refreshing the page",
            variant: "destructive",
          });
        }
      }
    };

    // Small delay to ensure user authentication is stable
    const timer = setTimeout(handleAutoMigration, 1000);
    return () => clearTimeout(timer);
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