// Unified Cart Hook - Works for both authenticated and guest users
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useCartPersistence } from '@/hooks/useCartPersistence';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { Cart } from '@shared/cart-types';

export function useUnifiedCart() {
  const { isAuthenticated } = useFirebaseAuth();
  const { guestCart, addToGuestCart, removeFromGuestCart, updateGuestCartQuantity, getCartItemsCount } = useCartPersistence();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // For authenticated users - regular cart API (fallback to empty cart on error)
  const authenticatedCartQuery = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
    refetchOnWindowFocus: true,
    retry: false,
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/cart');
        return await response.json();
      } catch (error) {
        console.warn('Using fallback empty cart due to server error:', error);
        return {
          id: `fallback_cart_${Date.now()}`,
          items: [],
          totals: { subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0, savings: 0 },
          currency: 'INR',
          lastUpdated: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
    },
  });

  // For guest users - guest cart API with localStorage data
  const guestCartQuery = useQuery({
    queryKey: ["/api/cart/guest", guestCart.length],
    queryFn: async () => {
      if (guestCart.length === 0) {
        return {
          id: `guest_cart_${Date.now()}`,
          items: [],
          totals: { subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0, savings: 0 },
          currency: 'INR',
          lastUpdated: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
      
      try {
        const response = await apiRequest('POST', '/api/cart/guest', { items: guestCart });
        return await response.json();
      } catch (error) {
        console.warn('Guest cart API error, using local data:', error);
        return {
          id: `guest_cart_${Date.now()}`,
          items: guestCart.map(item => ({
            ...item,
            unitPrice: 0,
            originalPrice: 0,
            discount: 0,
            appliedCoupons: [],
            customizations: item.customizations || {},
            notes: item.notes || '',
            savedForLater: false,
            createdAt: new Date(item.addedAt),
            updatedAt: new Date()
          })),
          totals: { subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0, savings: 0 },
          currency: 'INR',
          lastUpdated: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
    },
    enabled: !isAuthenticated,
    refetchOnWindowFocus: false,
  });

  // Select the appropriate cart data
  const cart: Cart | undefined = isAuthenticated ? authenticatedCartQuery.data : guestCartQuery.data;
  const isLoading = isAuthenticated ? authenticatedCartQuery.isLoading : guestCartQuery.isLoading;
  const error = isAuthenticated ? authenticatedCartQuery.error : guestCartQuery.error;

  // Add item mutation
  const addItemMutation = useMutation({
    mutationFn: async ({ productId, serviceId, quantity = 1 }: {
      productId?: string;
      serviceId?: string;
      quantity?: number;
    }) => {
      if (isAuthenticated) {
        const response = await apiRequest('POST', '/api/cart', {
          productId,
          serviceId,
          quantity,
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Add to cart error:', errorText);
          throw new Error('Failed to add item to cart');
        }
        return await response.json();
      } else {
        // Add to guest cart
        addToGuestCart(productId, serviceId, quantity);
        return Promise.resolve();
      }
    },
    onSuccess: () => {
      // Invalidate appropriate cart queries
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/cart/guest"] });
      }
      
      // Show success toast only for authenticated users (guest cart shows locally)
      if (isAuthenticated) {
        toast({
          title: "Added to cart",
          description: "Item added to your cart successfully.",
          duration: 2000,
        });
      }
    },
    onError: (error) => {
      console.error('Error adding item to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      if (isAuthenticated) {
        const response = await apiRequest('DELETE', `/api/cart/items/${itemId}`);
        if (!response.ok) throw new Error('Failed to remove item');
        return await response.json();
      } else {
        removeFromGuestCart(itemId);
        return Promise.resolve();
      }
    },
    onSuccess: () => {
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/cart/guest"] });
      }
      toast({
        title: "Item removed",
        description: "Item removed from cart",
        duration: 1000
      });
    }
  });

  // Update quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (isAuthenticated) {
        const response = await apiRequest('PUT', `/api/cart/items/${itemId}`, { quantity });
        if (!response.ok) throw new Error('Failed to update quantity');
        return await response.json();
      } else {
        updateGuestCartQuantity(itemId, quantity);
        return Promise.resolve();
      }
    },
    onSuccess: () => {
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/cart/guest"] });
      }
    }
  });

  // Get cart items count
  const getItemsCount = () => {
    if (isAuthenticated) {
      return cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
    } else {
      return getCartItemsCount();
    }
  };

  return {
    cart,
    isLoading,
    error,
    addItem: addItemMutation.mutate,
    removeItem: removeItemMutation.mutate,
    updateQuantity: updateQuantityMutation.mutate,
    getItemsCount,
    isAuthenticated,
    // Expose guest cart functions for direct access if needed
    guestCart,
    addToGuestCart,
    removeFromGuestCart,
    updateGuestCartQuantity
  };
}