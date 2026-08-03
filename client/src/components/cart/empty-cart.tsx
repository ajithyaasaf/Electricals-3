import { Link } from 'wouter';
import { ShoppingCart, ArrowRight, Zap, Shield, Truck, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CATEGORIES } from '@/lib/constants';
import { getDynamicDeliveryEstimate } from '@shared/delivery-zones';

interface EmptyCartProps {
  savedItemsCount?: number;
  className?: string;
}

export function EmptyCart({ savedItemsCount = 0, className }: EmptyCartProps) {
  const deliveryEstimate = getDynamicDeliveryEstimate('625001');
  return (
    <div className={className}>
      {/* Empty Cart Illustration */}
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingCart className="w-12 h-12 text-teal-600" />
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Your cart is empty
        </h2>

        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Looks like you haven't added anything to your cart yet.
          Start shopping to fill it up with amazing electrical products and services!
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link href="/products">
            <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white font-medium">
              <span className="flex items-center gap-2">
                Browse All Products
                <ArrowRight className="w-4 h-4" />
              </span>
            </Button>
          </Link>

          <Link href="/services">
            <Button variant="outline" size="lg" className="border-teal-200 text-teal-700 hover:bg-teal-50">
              <span className="flex items-center gap-2">
                Browse Services
                <ArrowRight className="w-4 h-4" />
              </span>
            </Button>
          </Link>
        </div>

        {/* Popular Category Quick Links */}
        <div className="max-w-2xl mx-auto mb-12 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center justify-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-teal-600" />
            <span>Popular Categories</span>
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} href={`/products?category=${cat.slug}`}>
                <span className="bg-gray-50 hover:bg-teal-50 text-gray-700 hover:text-teal-700 border border-gray-200 hover:border-teal-200 px-3 py-1.5 rounded-full text-xs font-medium transition-colors inline-block cursor-pointer">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Premium Quality</h3>
              <p className="text-sm text-gray-600">
                Professional-grade electrical products from trusted brands
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-sm text-gray-600">
                {deliveryEstimate.badgeText} | Free shipping on orders ₹2,999+
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Expert Support</h3>
              <p className="text-sm text-gray-600">
                Get help from our electrical experts and professional services
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Saved Items Notice */}
        {savedItemsCount > 0 && (
          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800">
              You have {savedItemsCount} {savedItemsCount === 1 ? 'item' : 'items'} saved for later.
              <Button variant="link" className="ml-2 p-0 h-auto text-amber-600 underline">
                View saved items
              </Button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}