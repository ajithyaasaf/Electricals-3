// Enhanced Cart Summary Component - Comprehensive order summary with totals
import { useState } from 'react';
import { Link } from 'wouter';
import { Tag, Truck, Shield, CreditCard, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';
import { POLICY_TEXT } from '@/lib/constants';
import type { CartTotals, ShippingOption } from '@shared/cart-types';

interface CartSummaryProps {
  totals: CartTotals;
  itemCount: number;
  appliedCoupons: string[];
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: (code: string) => void;
  isApplyingCoupon?: boolean;
  className?: string;
}

export function CartSummary({
  totals,
  itemCount,
  appliedCoupons = [],
  onApplyCoupon,
  onRemoveCoupon,
  isApplyingCoupon = false,
  className
}: CartSummaryProps) {
  const [couponCode, setCouponCode] = useState('');
  const { toast } = useToast();

  // Handle coupon application
  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast({
        title: "Enter coupon code",
        description: "Please enter a valid coupon code",
        variant: "destructive"
      });
      return;
    }

    onApplyCoupon(couponCode.toUpperCase());
    setCouponCode('');
  };

  // Calculate free shipping progress - Updated per client requirements
  const freeShippingThreshold = 10000; // ₹10,000
  const progressToFreeShipping = Math.min((totals.subtotal / freeShippingThreshold) * 100, 100);
  const amountForFreeShipping = Math.max(freeShippingThreshold - totals.subtotal, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Order Summary</CardTitle>
        <p className="text-sm text-gray-600">
          {itemCount} {itemCount === 1 ? 'item' : 'items'} in cart
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Price Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between text-base">
            <span>Subtotal</span>
            <span>{formatPrice(totals.subtotal)}</span>
          </div>

          {totals.discount > 0 && (
            <div className="flex justify-between text-base text-green-600">
              <span>Discount</span>
              <span>-{formatPrice(totals.discount)}</span>
            </div>
          )}

          <div className="flex justify-between text-base">
            <div className="flex items-center gap-2">
              <span>Shipping</span>
              {totals.shipping === 0 && totals.subtotal > 0 && (
                <Badge variant="secondary" className="text-xs">
                  FREE
                </Badge>
              )}
            </div>
            <span>
              {totals.shipping > 0 ? formatPrice(totals.shipping) : 'Free'}
            </span>
          </div>

          <div className="flex justify-between text-base">
            <span>Tax</span>
            <span>{formatPrice(totals.tax)}</span>
          </div>

          <Separator />

          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(totals.total)}</span>
          </div>

          {totals.savings > 0 && (
            <div className="bg-green-50 p-3 rounded-md">
              <div className="text-center text-green-800">
                <span className="text-sm font-medium">
                  You're saving {formatPrice(totals.savings)} on this order!
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Free Shipping Progress */}
        {totals.shipping > 0 && amountForFreeShipping > 0 && (
          <div className="bg-blue-50 p-4 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Free Shipping Progress
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
            
            <p className="text-xs text-blue-700">
              Add {formatPrice(amountForFreeShipping)} more to qualify for free shipping!
            </p>
          </div>
        )}

        {/* Coupon Section */}
        <div className="space-y-3">
          {/* Applied Coupons */}
          {appliedCoupons.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Applied Coupons:</p>
              {appliedCoupons.map((coupon) => (
                <div 
                  key={coupon}
                  className="flex items-center justify-between bg-green-50 p-2 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <Tag className="w-3 h-3 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      {coupon}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveCoupon(coupon)}
                    className="text-green-700 hover:text-green-900 h-6 px-2 text-xs"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add Coupon */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Have a coupon?</p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-grow"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleApplyCoupon();
                  }
                }}
              />
              <Button
                onClick={handleApplyCoupon}
                disabled={isApplyingCoupon || !couponCode.trim()}
                size="sm"
              >
                {isApplyingCoupon ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  'Apply'
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Policy Information */}
        <div className="space-y-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-900">Shipping & Returns</h4>
          <div className="text-xs text-blue-800 space-y-1">
            <div>• Free delivery on orders above ₹10,000</div>
            <div>• Delivery in 1-3 business days (Tamil Nadu only)</div>
            <div>• Returns: 5-7 days, 2.5% return shipping charge</div>
            <div>• COD available (Tamil Nadu, no extra charges)</div>
          </div>
        </div>

        {/* Security Badges */}
        <div className="flex items-center justify-center gap-4 py-3 border rounded-md bg-gray-50">
          <div className="flex items-center gap-1">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-xs text-gray-600">Secure Checkout</span>
          </div>
          <div className="flex items-center gap-1">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-gray-600">Multiple Payment Options</span>
          </div>
        </div>

        {/* Checkout Button */}
        <div className="space-y-3">
          <Link href="/checkout">
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-white py-3"
              size="lg"
              disabled={totals.total <= 0}
            >
              <span className="flex items-center justify-center gap-2">
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </span>
            </Button>
          </Link>

          <Link href="/products">
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Additional Info */}
        <div className="text-center space-y-1">
          <p className="text-xs text-gray-500">
            Free returns within 30 days
          </p>
          <p className="text-xs text-gray-500">
            Questions? Call us at 1-800-COPPER
          </p>
        </div>
      </CardContent>
    </Card>
  );
}