import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

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
  };

  const removeFromGuestCart = (itemId: string) => {
    setGuestCart(prev => prev.filter(item => item.id !== itemId));
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
  };

  const clearGuestCart = () => {
    setGuestCart([]);
    localStorage.removeItem('copperbear_guest_cart');
  };

  const getCartItemsCount = () => {
    return guestCart.reduce((total, item) => total + item.quantity, 0);
  };

  // Migrate guest cart to authenticated user cart
  const migrateToUserCart = async (userId: string) => {
    // This will be called when user signs in
    // Transfer all guest cart items to user's account
    try {
      for (const item of guestCart) {
        await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: item.productId,
            serviceId: item.serviceId,
            quantity: item.quantity,
          }),
        });
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