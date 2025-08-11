// Cart Hook - Real-time cart management with enterprise features
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { cartService } from '@/lib/cart-service';
import type { 
  Cart, 
  CartItem, 
  CartItemWithDetails, 
  Coupon,
  ShippingOption 
} from '@shared/cart-types';

// Cart hook with real-time updates
export function useCart() {
  const { isAuthenticated } = useFirebaseAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Real-time cart query
  const {
    data: cart,
    isLoading: cartLoading,
    error: cartError
  } = useQuery({
    queryKey: ['cart', cartService.getSessionId()],
    queryFn: () => cartService.getCart(),
    refetchOnWindowFocus: true,
    refetchInterval: isAuthenticated ? false : 30000, // Refresh guest cart every 30s
  });

  // Cart mutations with optimistic updates
  const addItemMutation = useMutation({
    mutationFn: async ({ productId, serviceId, quantity, customizations }: {
      productId?: string;
      serviceId?: string;
      quantity?: number;
      customizations?: Record<string, any>;
    }) => {
      return cartService.addItem(productId, serviceId, quantity, customizations);
    },
    onMutate: async (newItem) => {
      setIsLoading(true);
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cart'] });

      // Snapshot the previous value for rollback
      const previousCart = queryClient.getQueryData(['cart', cartService.getSessionId()]);

      // Optimistically update cart
      if (previousCart && cart) {
        const optimisticCart = { ...cart };
        
        // Add optimistic item (simplified)
        const optimisticItem: CartItemWithDetails = {
          id: `temp_${Date.now()}`,
          productId: newItem.productId,
          serviceId: newItem.serviceId,
          quantity: newItem.quantity || 1,
          unitPrice: 0, // Will be updated from server
          originalPrice: 0,
          discount: 0,
          appliedCoupons: [],
          customizations: newItem.customizations || {},
          notes: '',
          savedForLater: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        optimisticCart.items = [...optimisticCart.items, optimisticItem];
        queryClient.setQueryData(['cart', 'cart', cartService.getSessionId()], optimisticCart);
      }

      return { previousCart };
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart', 'cart', cartService.getSessionId()], updatedCart);
      
      toast({
        title: "Added to cart",
        description: "Item added successfully!",
        duration: 2000
      });
    },
    onError: (error, newItem, context) => {
      // Rollback on error
      if (context?.previousCart) {
        queryClient.setQueryData(['cart', 'cart', cartService.getSessionId()], context.previousCart);
      }
      
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsLoading(false);
      queryClient.invalidateQueries({ queryKey: ['cart', 'cart'] });
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, updates }: {
      itemId: string;
      updates: Partial<CartItem>;
    }) => {
      return cartService.updateItem(itemId, updates);
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart', 'cart', cartService.getSessionId()], updatedCart);
      
      toast({
        title: "Cart updated",
        description: "Item updated successfully!",
        duration: 1000
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update item. Please try again.",
        variant: "destructive"
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', 'cart'] });
    }
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return cartService.removeItem(itemId);
    },
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ['cart', 'cart'] });
      const previousCart = queryClient.getQueryData(['cart', 'cart', cartService.getSessionId()]);

      // Optimistically remove item
      if (previousCart && cart) {
        const optimisticCart = { ...cart };
        optimisticCart.items = optimisticCart.items.filter(item => item.id !== itemId);
        queryClient.setQueryData(['cart', 'cart', cartService.getSessionId()], optimisticCart);
      }

      return { previousCart };
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart', 'cart', cartService.getSessionId()], updatedCart);
      
      toast({
        title: "Item removed",
        description: "Item removed from cart successfully!",
        duration: 1000
      });
    },
    onError: (error, itemId, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart', 'cart', cartService.getSessionId()], context.previousCart);
      }
      
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive"
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', 'cart'] });
    }
  });

  const clearCartMutation = useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart', 'cart', cartService.getSessionId()], updatedCart);
      
      toast({
        title: "Cart cleared",
        description: "All items removed from cart.",
        duration: 2000
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear cart. Please try again.",
        variant: "destructive"
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', 'cart'] });
    }
  });

  const applyCouponMutation = useMutation({
    mutationFn: (couponCode: string) => cartService.applyCoupon(couponCode),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart', 'cart', cartService.getSessionId()], updatedCart);
      
      toast({
        title: "Coupon applied",
        description: "Discount applied successfully!",
        duration: 2000
      });
    },
    onError: (error: any) => {
      toast({
        title: "Coupon error",
        description: error.message || "Invalid coupon code",
        variant: "destructive"
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', 'cart'] });
    }
  });

  // Helper functions
  const addItem = useCallback((
    productId?: string, 
    serviceId?: string, 
    quantity = 1,
    customizations?: Record<string, any>
  ) => {
    addItemMutation.mutate({ productId, serviceId, quantity, customizations });
  }, [addItemMutation]);

  const updateItem = useCallback((itemId: string, updates: Partial<CartItem>) => {
    updateItemMutation.mutate({ itemId, updates });
  }, [updateItemMutation]);

  const removeItem = useCallback((itemId: string) => {
    removeItemMutation.mutate(itemId);
  }, [removeItemMutation]);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
    } else {
      updateItem(itemId, { quantity });
    }
  }, [updateItem, removeItem]);

  const clearCart = useCallback(() => {
    clearCartMutation.mutate();
  }, [clearCartMutation]);

  const applyCoupon = useCallback((couponCode: string) => {
    applyCouponMutation.mutate(couponCode);
  }, [applyCouponMutation]);

  const saveForLater = useCallback((itemId: string) => {
    updateItem(itemId, { savedForLater: true });
  }, [updateItem]);

  const moveToCart = useCallback((itemId: string) => {
    updateItem(itemId, { savedForLater: false });
  }, [updateItem]);

  // Computed values
  const cartItems = cart?.items?.filter(item => !item.savedForLater) || [];
  const savedItems = cart?.items?.filter(item => item.savedForLater) || [];
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const isEmpty = cartItems.length === 0;
  const totals = cart?.totals || {
    subtotal: 0,
    discount: 0,
    shipping: 0,
    tax: 0,
    total: 0,
    savings: 0
  };

  // Real-time updates subscription
  useEffect(() => {
    const unsubscribe = cartService.subscribe((updatedCart) => {
      queryClient.setQueryData(['cart', 'cart', cartService.getSessionId()], updatedCart);
    });

    return unsubscribe;
  }, [queryClient]);

  return {
    // Data
    cart,
    cartItems,
    savedItems,
    itemCount,
    isEmpty,
    totals,
    
    // Loading states
    isLoading: cartLoading || isLoading,
    isAddingItem: addItemMutation.isPending,
    isUpdatingItem: updateItemMutation.isPending,
    isRemovingItem: removeItemMutation.isPending,
    isClearingCart: clearCartMutation.isPending,
    isApplyingCoupon: applyCouponMutation.isPending,
    
    // Actions
    addItem,
    updateItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyCoupon,
    saveForLater,
    moveToCart,
    
    // Errors
    error: cartError
  };
}

export default useCart;