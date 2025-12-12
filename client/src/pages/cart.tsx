// Enhanced Cart Page - Enterprise-grade shopping cart with all features
import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  Package2,
  Heart,
  ShoppingBag,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BreadcrumbNavigation } from "@/components/navigation/breadcrumb-navigation";
import { CartItem } from "@/components/cart/cart-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { EmptyCart } from "@/components/cart/empty-cart";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartContext } from "@/contexts/cart-context";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { signInWithGoogle } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export default function Cart() {
  const { isAuthenticated, loading: authLoading } = useFirebaseAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("cart");

  const {
    cart,
    isLoading,
    error,
    itemsCount,
    totalQuantity,
    addItem,
    removeItem,
    updateQuantity,
    updateNotes,
    clearCart,
  } = useCartContext();

  // Handle guest checkout warning
  useEffect(() => {
    if (!authLoading && !isAuthenticated && cart && cart.items.length > 0) {
      toast({
        title: "Guest Cart",
        description:
          "Sign in at checkout to save your cart and complete your order.",
        duration: 5000,
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
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-20 h-20" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="w-3/4 h-4" />
                      <Skeleton className="w-1/2 h-4" />
                      <Skeleton className="w-1/4 h-6" />
                    </div>
                    <Skeleton className="w-24 h-8" />
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="w-full h-96" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load cart. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <BreadcrumbNavigation />

          <EmptyCart savedItemsCount={0} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <BreadcrumbNavigation />

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600 mt-1">
              {itemsCount} {itemsCount === 1 ? "item" : "items"} in your cart
            </p>
          </div>

          {cart && cart.items.length > 0 && (
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
          )}
        </div>

        {/* Guest User Notice */}
        {!isAuthenticated && cart && cart.items.length > 0 && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Sign in to save your cart and access member benefits</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Open auth modal instead of direct Google sign-in
                  document.dispatchEvent(new CustomEvent("openAuth"));
                }}
              >
                Sign In
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Section */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="cart" className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Cart ({itemsCount})
                </TabsTrigger>
                <TabsTrigger
                  value="saved"
                  className="flex items-center gap-2"
                  disabled={true}
                >
                  <Heart className="w-4 h-4" />
                  Saved (0)
                </TabsTrigger>
              </TabsList>

              {/* Cart Items */}
              <TabsContent value="cart" className="space-y-4">
                {!cart || cart.items.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg border">
                    <Package2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Your cart is empty
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Add some items to get started
                    </p>
                    <Link href="/products">
                      <Button>Continue Shopping</Button>
                    </Link>
                  </div>
                ) : (
                  cart.items.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={(itemId, quantity) =>
                        updateQuantity(itemId, quantity)
                      }
                      onRemove={removeItem}
                      onSaveForLater={() => { }}
                      onMoveToCart={() => { }}
                      onUpdateNotes={handleUpdateNotes}
                      isUpdating={isLoading}
                    />
                  ))
                )}
              </TabsContent>

              {/* Saved Items */}
              <TabsContent value="saved" className="space-y-4">
                {true ? (
                  <div className="text-center py-12 bg-white rounded-lg border">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No saved items
                    </h3>
                    <p className="text-gray-600">
                      Items you save for later will appear here
                    </p>
                  </div>
                ) : null}
              </TabsContent>
            </Tabs>
          </div>

          {/* Cart Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <CartSummary
                totals={
                  cart?.totals || {
                    subtotal: 0,
                    discount: 0,
                    shipping: 0,
                    tax: 0,
                    total: 0,
                    savings: 0,
                  }
                }
                itemCount={itemsCount}
                appliedCoupons={cart?.appliedCoupons || []}
                onApplyCoupon={() => console.log("Apply coupon")}
                onRemoveCoupon={(code) => {
                  console.log("Remove coupon:", code);
                }}
                isApplyingCoupon={false}
              />

              {/* Continue Shopping */}
              <div className="mt-6">
                <Link href="/products">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Continue Shopping
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-6 p-4 bg-white rounded-lg border">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>30-day money-back guarantee</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Fast 1-2 day delivery in Madurai</span>
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
      </div>

      <Footer />
    </div>
  );
}
