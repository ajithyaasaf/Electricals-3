// Coupon Management Service - Enterprise coupon and discount system
import { apiRequest } from '@/lib/queryClient';
import type { Coupon } from '@shared/cart-types';

export interface CouponValidationResult {
  isValid: boolean;
  coupon?: Coupon;
  error?: string;
  discount?: {
    type: 'percentage' | 'fixed' | 'shipping';
    value: number;
    appliedAmount: number;
  };
}

class CouponService {
  private static instance: CouponService;

  static getInstance(): CouponService {
    if (!CouponService.instance) {
      CouponService.instance = new CouponService();
    }
    return CouponService.instance;
  }

  // Validate coupon code
  async validateCoupon(
    code: string, 
    cartTotal: number = 0
  ): Promise<CouponValidationResult> {
    try {
      const response = await apiRequest('POST', '/api/cart/enhanced/coupons/validate', {
        code,
        cartTotal
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      }

      const error = await response.json();
      return {
        isValid: false,
        error: error.message || 'Invalid coupon code'
      };
    } catch (error) {
      console.error('Error validating coupon:', error);
      return {
        isValid: false,
        error: 'Failed to validate coupon'
      };
    }
  }

  // Apply coupon to cart
  async applyCoupon(code: string): Promise<any> {
    try {
      const response = await apiRequest('POST', '/api/cart/enhanced/coupons', {
        code: code.toUpperCase()
      });

      if (response.ok) {
        return await response.json();
      }

      const error = await response.json();
      throw new Error(error.message || 'Failed to apply coupon');
    } catch (error) {
      console.error('Error applying coupon:', error);
      throw error;
    }
  }

  // Remove coupon from cart
  async removeCoupon(code: string): Promise<any> {
    try {
      const response = await apiRequest('DELETE', `/api/cart/enhanced/coupons/${code}`);

      if (response.ok) {
        return await response.json();
      }

      const error = await response.json();
      throw new Error(error.message || 'Failed to remove coupon');
    } catch (error) {
      console.error('Error removing coupon:', error);
      throw error;
    }
  }

  // Get available coupons for user (if implemented)
  async getAvailableCoupons(): Promise<Coupon[]> {
    try {
      const response = await apiRequest('GET', '/api/cart/enhanced/coupons/available');
      
      if (response.ok) {
        return await response.json();
      }

      return [];
    } catch (error) {
      console.error('Error fetching available coupons:', error);
      return [];
    }
  }

  // Calculate discount amount
  calculateDiscount(coupon: Coupon, subtotal: number): number {
    if (!coupon.isActive) return 0;

    // Check minimum order amount
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return 0;
    }

    let discount = 0;

    switch (coupon.type) {
      case 'percentage':
        discount = subtotal * (coupon.value / 100);
        // Apply maximum discount limit if specified
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
        break;

      case 'fixed':
        discount = coupon.value;
        // Don't exceed the subtotal
        if (discount > subtotal) {
          discount = subtotal;
        }
        break;

      case 'shipping':
        // Shipping coupons are handled differently in cart totals
        discount = coupon.value;
        break;

      default:
        discount = 0;
    }

    return Math.max(0, discount);
  }

  // Check if coupon is expired
  isCouponExpired(coupon: Coupon): boolean {
    if (!coupon.expiresAt) return false;
    return new Date(coupon.expiresAt) < new Date();
  }

  // Check if coupon usage limit is reached
  isCouponLimitReached(coupon: Coupon): boolean {
    if (!coupon.usageLimit) return false;
    return coupon.usedCount >= coupon.usageLimit;
  }

  // Get coupon error message
  getCouponErrorMessage(coupon: Coupon, cartTotal: number): string | null {
    if (!coupon.isActive) {
      return 'This coupon is no longer active';
    }

    if (this.isCouponExpired(coupon)) {
      return 'This coupon has expired';
    }

    if (this.isCouponLimitReached(coupon)) {
      return 'This coupon has reached its usage limit';
    }

    if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
      return `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`;
    }

    return null;
  }

  // Format coupon description for display
  formatCouponDescription(coupon: Coupon): string {
    let description = '';

    switch (coupon.type) {
      case 'percentage':
        description = `${coupon.value}% off`;
        if (coupon.maxDiscount) {
          description += ` (up to ₹${coupon.maxDiscount})`;
        }
        break;

      case 'fixed':
        description = `₹${coupon.value} off`;
        break;

      case 'shipping':
        description = 'Free shipping';
        break;
    }

    if (coupon.minOrderAmount) {
      description += ` on orders over ₹${coupon.minOrderAmount}`;
    }

    return description;
  }
}

export const couponService = CouponService.getInstance();
export default couponService;