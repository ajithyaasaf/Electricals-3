import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export interface GuestCartItem {
  id: string;
  productId?: string;
  serviceId?: string;
  quantity: number;
  addedAt: string;
}

export function useGuestCart() {
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('copperbear_guest_cart');
    if (savedCart) {
      try {
        setGuestCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading guest cart:', error);
        localStorage.removeItem('copperbear_guest_cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('copperbear_guest_cart', JSON.stringify(guestCart));
  }, [guestCart]);

  const addToGuestCart = (productId?: string, serviceId?: string, quantity = 1) => {
    const itemId = `${productId || serviceId}-${Date.now()}`;
    
    // Check if item already exists
    const existingItemIndex = guestCart.findIndex(
      item => item.productId === productId && item.serviceId === serviceId
    );

    if (existingItemIndex >= 0) {
      // Update quantity
      const updatedCart = [...guestCart];
      updatedCart[existingItemIndex].quantity += quantity;
      setGuestCart(updatedCart);
    } else {
      // Add new item
      const newItem: GuestCartItem = {
        id: itemId,
        productId,
        serviceId,
        quantity,
        addedAt: new Date().toISOString(),
      };
      setGuestCart(prev => [...prev, newItem]);
    }

    toast({
      title: "Added to cart",
      description: "Item added successfully. Sign in at checkout to complete your order.",
      duration: 2000, // 2 seconds instead of default 5 seconds
    });

    // Invalidate cart queries to refresh the cart sidebar
    queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    queryClient.invalidateQueries({ queryKey: ["/api/cart/guest"] });
  };

  const removeFromGuestCart = (itemId: string) => {
    setGuestCart(prev => prev.filter(item => item.id !== itemId));
    queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    queryClient.invalidateQueries({ queryKey: ["/api/cart/guest"] });
  };

  const updateGuestCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromGuestCart(itemId);
      return;
    }

    setGuestCart(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
    queryClient.invalidateQueries({ queryKey: ["/api/cart/guest"] });
  };

  const clearGuestCart = () => {
    setGuestCart([]);
    localStorage.removeItem('copperbear_guest_cart');
    queryClient.invalidateQueries({ queryKey: ["/api/cart/guest"] });
  };

  const getCartItemsCount = () => {
    return guestCart.reduce((total, item) => total + item.quantity, 0);
  };

  // Migrate guest cart to authenticated user cart
  const migrateToUserCart = async (userId: string) => {
    // This will be called when user signs in
    // Transfer all guest cart items to user's account
    try {
      const { auth } = await import('@/lib/firebase');
      const user = auth.currentUser;
      
      if (!user || guestCart.length === 0) {
        clearGuestCart();
        return true;
      }

      // Get auth token for authenticated requests
      const token = await user.getIdToken(true); // Force refresh to get fresh token
      
      for (const item of guestCart) {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: item.productId,
            serviceId: item.serviceId,
            quantity: item.quantity,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to migrate item: ${response.statusText}`);
        }
      }
      clearGuestCart();
      return true;
    } catch (error) {
      console.error('Error migrating guest cart:', error);
      return false;
    }
  };

  return {
    guestCart,
    addToGuestCart,
    removeFromGuestCart,
    updateGuestCartQuantity,
    clearGuestCart,
    getCartItemsCount,
    migrateToUserCart,
  };
}