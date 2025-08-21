// Simple Cart Page - Clean wishlist-style design
import { useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Package2, ShoppingBag, AlertCircle, CheckCircle, ShoppingCart } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BreadcrumbNavigation } from '@/components/navigation/breadcrumb-navigation';
import { CartItem } from '@/components/cart/cart-item';
import { CartSummary } from '@/components/cart/cart-summary';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCartContext } from '@/contexts/cart-context';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useToast } from '@/hooks/use-toast';
import { formatPrice as formatCurrency } from '@/lib/currency';

export default function Cart() {
  const { isAuthenticated, loading: authLoading } = useFirebaseAuth();
  const { toast } = useToast();
  
  const {
    cart,
    isLoading,
    error,
    itemsCount,
    totalQuantity,
    removeItem,
    updateQuantity,
    updateNotes,
    clearCart
  } = useCartContext();

  // Handle guest checkout warning
  useEffect(() => {
    if (!authLoading && !isAuthenticated && cart && cart.items.length > 0) {
      toast({
        title: "Guest Cart",
        description: "Sign in at checkout to save your cart and complete your order.",
        duration: 5000
      });
    }
  }, [isAuthenticated, authLoading, cart, toast]);

  // Handle cart notes update  
  const handleUpdateNotes = async (itemId: string, notes: string) => {
    await updateNotes(itemId, notes);
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-48"></div>
            <div className="h-4 bg-gray-200 rounded mb-8 w-32"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load cart. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate cart total
  const cartTotal = cart?.totals?.total || 0;


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/products">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <ShoppingBag className="h-8 w-8 text-copper-600" />
                Shopping Cart
              </h1>
              <p className="text-gray-600 mt-1">
                {itemsCount} {itemsCount === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
            
            {itemsCount > 0 && (
              <div className="text-right">
                <div className="text-2xl font-bold text-copper-600">
                  {formatCurrency(cartTotal)}
                </div>
                <div className="text-sm text-gray-600">
                  Total for {itemsCount} items
                </div>
              </div>
            )}
          </div>
          
          {/* Clear Cart Button */}
          {itemsCount > 0 && (
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={clearCart}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                {isLoading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                ) : null}
                Clear Cart
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Guest User Notice */}
        {!isAuthenticated && itemsCount > 0 && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Sign in to save your cart and access member benefits</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  document.dispatchEvent(new CustomEvent('openAuth'));
                }}
              >
                Sign In
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {itemsCount === 0 ? (
          // Empty state
          <div className="text-center py-16">
            <Package2 className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start adding items to your cart to begin shopping. 
              Items in your cart are saved {isAuthenticated ? 'to your account' : 'locally'}.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/products">
                <Button>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Browse Products
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline">
                  Browse Services
                </Button>
              </Link>
            </div>
            
            {!isAuthenticated && (
              <div className="mt-8 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
                <p className="text-sm text-blue-800">
                  <strong>Sign in</strong> to sync your cart across devices and save items permanently.
                </p>
                <Link href="/auth">
                  <Button variant="outline" size="sm" className="mt-2">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items Section */}
            <div className="lg:col-span-2 space-y-4">
              {cart && cart.items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={(itemId, quantity) => updateQuantity(itemId, quantity)}
                  onRemove={removeItem}
                  onSaveForLater={() => {}}
                  onMoveToCart={() => {}}
                  onUpdateNotes={handleUpdateNotes}
                  isUpdating={isLoading}
                />
              ))}
            </div>

            {/* Cart Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <CartSummary
                  totals={cart?.totals || { subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0, savings: 0 }}
                  itemCount={itemsCount}
                  appliedCoupons={cart?.appliedCoupons || []}
                  onApplyCoupon={() => console.log('Apply coupon')}
                  onRemoveCoupon={(code) => {
                    console.log('Remove coupon:', code);
                  }}
                  isApplyingCoupon={false}
                />

                {/* Trust Indicators */}
                <div className="mt-6 p-4 bg-white rounded-lg border">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>30-day money-back guarantee</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>Free shipping on orders over ₹8,300</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>Expert technical support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}