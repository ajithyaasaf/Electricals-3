// Empty Cart Component - Professional empty state with CTAs
import { Link } from 'wouter';
import { ShoppingCart, ArrowRight, Zap, Shield, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyCartProps {
  savedItemsCount?: number;
  className?: string;
}

export function EmptyCart({ savedItemsCount = 0, className }: EmptyCartProps) {
  return (
    <div className={className}>
      {/* Empty Cart Illustration */}
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingCart className="w-12 h-12 text-gray-400" />
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Your cart is empty
        </h2>

        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Looks like you haven't added anything to your cart yet.
          Start shopping to fill it up with amazing electrical products and services!
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/products">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
              <span className="flex items-center gap-2">
                Shop Products
                <ArrowRight className="w-4 h-4" />
              </span>
            </Button>
          </Link>

          <Link href="/services">
            <Button variant="outline" size="lg">
              <span className="flex items-center gap-2">
                Browse Services
                <ArrowRight className="w-4 h-4" />
              </span>
            </Button>
          </Link>
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
                Fast 1-2 day delivery in Madurai | Weight-based shipping from ₹50
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