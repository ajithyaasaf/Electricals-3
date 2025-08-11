// Enterprise Cart Service - Client-side cart management with real-time updates
import { apiRequest } from '@/lib/queryClient';
import type { 
  EnhancedCartItem, 
  CreateEnhancedCartItem, 
  Cart, 
  CartTotals, 
  Coupon,
  CartItemWithDetails,
  ShippingOption,
  TaxConfig 
} from '@shared/cart-types';

class CartService {
  private static instance: CartService;
  private sessionId: string;
  private cartCache: Cart | null = null;
  private listeners: Set<(cart: Cart) => void> = new Set();

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  static getInstance(): CartService {
    if (!CartService.instance) {
      CartService.instance = new CartService();
    }
    return CartService.instance;
  }

  // Session Management
  private generateSessionId(): string {
    return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  // Real-time Updates
  subscribe(listener: (cart: Cart) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(cart: Cart): void {
    this.cartCache = cart;
    this.listeners.forEach(listener => listener(cart));
  }

  // Cart Operations
  async getCart(): Promise<Cart> {
    try {
      const response = await apiRequest('GET', '/api/cart/enhanced');
      if (response.ok) {
        const cart = await response.json();
        this.notifyListeners(cart);
        return cart;
      }
      throw new Error('Failed to fetch cart');
    } catch (error) {
      console.error('Error fetching cart:', error);
      return this.getEmptyCart();
    }
  }

  async addItem(
    productId?: string, 
    serviceId?: string, 
    quantity: number = 1,
    customizations?: Record<string, any>
  ): Promise<Cart> {
    try {
      const response = await apiRequest('POST', '/api/cart/enhanced/items', {
        productId,
        serviceId,
        quantity,
        customizations,
        sessionId: this.sessionId
      });

      if (response.ok) {
        const cart = await response.json();
        this.notifyListeners(cart);
        return cart;
      }
      throw new Error('Failed to add item to cart');
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  }

  async updateItem(itemId: string, updates: Partial<CreateEnhancedCartItem>): Promise<Cart> {
    try {
      const response = await apiRequest('PUT', `/api/cart/enhanced/items/${itemId}`, updates);
      
      if (response.ok) {
        const cart = await response.json();
        this.notifyListeners(cart);
        return cart;
      }
      throw new Error('Failed to update cart item');
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  }

  async removeItem(itemId: string): Promise<Cart> {
    try {
      const response = await apiRequest('DELETE', `/api/cart/enhanced/items/${itemId}`);
      
      if (response.ok) {
        const cart = await response.json();
        this.notifyListeners(cart);
        return cart;
      }
      throw new Error('Failed to remove cart item');
    } catch (error) {
      console.error('Error removing cart item:', error);
      throw error;
    }
  }

  async updateQuantity(itemId: string, quantity: number): Promise<Cart> {
    if (quantity <= 0) {
      return this.removeItem(itemId);
    }
    return this.updateItem(itemId, { quantity });
  }

  async clearCart(): Promise<Cart> {
    try {
      const response = await apiRequest('DELETE', '/api/cart/enhanced');
      
      if (response.ok) {
        const cart = await response.json();
        this.notifyListeners(cart);
        return cart;
      }
      throw new Error('Failed to clear cart');
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  async saveForLater(itemId: string): Promise<Cart> {
    return this.updateItem(itemId, { savedForLater: true });
  }

  async moveToCart(itemId: string): Promise<Cart> {
    return this.updateItem(itemId, { savedForLater: false });
  }

  // Coupon Management
  async applyCoupon(couponCode: string): Promise<Cart> {
    try {
      const response = await apiRequest('POST', '/api/cart/enhanced/coupons', {
        code: couponCode,
        sessionId: this.sessionId
      });
      
      if (response.ok) {
        const cart = await response.json();
        this.notifyListeners(cart);
        return cart;
      }
      
      const error = await response.json();
      throw new Error(error.message || 'Failed to apply coupon');
    } catch (error) {
      console.error('Error applying coupon:', error);
      throw error;
    }
  }

  async removeCoupon(couponCode: string): Promise<Cart> {
    try {
      const response = await apiRequest('DELETE', `/api/cart/enhanced/coupons/${couponCode}`);
      
      if (response.ok) {
        const cart = await response.json();
        this.notifyListeners(cart);
        return cart;
      }
      throw new Error('Failed to remove coupon');
    } catch (error) {
      console.error('Error removing coupon:', error);
      throw error;
    }
  }

  // Shipping and Tax
  async updateShippingAddress(address: any): Promise<Cart> {
    try {
      const response = await apiRequest('PUT', '/api/cart/enhanced/shipping', address);
      
      if (response.ok) {
        const cart = await response.json();
        this.notifyListeners(cart);
        return cart;
      }
      throw new Error('Failed to update shipping address');
    } catch (error) {
      console.error('Error updating shipping address:', error);
      throw error;
    }
  }

  async getShippingOptions(): Promise<ShippingOption[]> {
    try {
      const response = await apiRequest('GET', '/api/cart/enhanced/shipping-options');
      return response.ok ? await response.json() : [];
    } catch (error) {
      console.error('Error fetching shipping options:', error);
      return [];
    }
  }

  // Validation and Business Rules
  async validateCart(): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const response = await apiRequest('POST', '/api/cart/enhanced/validate');
      return response.ok ? await response.json() : { isValid: false, errors: ['Validation failed'] };
    } catch (error) {
      console.error('Error validating cart:', error);
      return { isValid: false, errors: ['Validation failed'] };
    }
  }

  // Utilities
  private getEmptyCart(): Cart {
    return {
      id: this.sessionId,
      sessionId: this.sessionId,
      items: [],
      appliedCoupons: [],
      totals: {
        subtotal: 0,
        discount: 0,
        shipping: 0,
        tax: 0,
        total: 0,
        savings: 0
      },
      currency: 'INR',
      lastUpdated: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Calculate totals (client-side backup calculation)
  calculateTotals(items: CartItemWithDetails[], coupons: Coupon[] = []): CartTotals {
    const subtotal = items
      .filter(item => !item.savedForLater)
      .reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

    let discount = items
      .filter(item => !item.savedForLater)
      .reduce((sum, item) => sum + (item.discount * item.quantity), 0);

    // Apply coupon discounts
    coupons.forEach(coupon => {
      if (coupon.type === 'percentage') {
        discount += subtotal * (coupon.value / 100);
      } else if (coupon.type === 'fixed') {
        discount += coupon.value;
      }
    });

    const shipping = this.calculateShipping(subtotal);
    const tax = this.calculateTax(subtotal - discount, shipping);
    const total = subtotal - discount + shipping + tax;
    const savings = discount;

    return { subtotal, discount, shipping, tax, total, savings };
  }

  private calculateShipping(subtotal: number): number {
    // Free shipping over ₹8,300 (approx $100)
    return subtotal > 8300 ? 0 : 1329;
  }

  private calculateTax(taxableAmount: number, shipping: number): number {
    // 8% tax on taxable amount (excluding shipping in this example)
    return taxableAmount * 0.08;
  }
}

export const cartService = CartService.getInstance();
export default cartService;