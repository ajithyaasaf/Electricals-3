import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartItem } from "@/components/cart/cart-item";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { ShoppingCart, ArrowLeft, CreditCard } from "lucide-react";
import { useEffect } from "react";

export default function Cart() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to view your cart.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
    }
  }, [isAuthenticated, authLoading, toast]);

  // Fetch cart items with product details
  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      // Clear cart by removing all items
      for (const item of cartItems) {
        await apiRequest("DELETE", `/api/cart/${item.id}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear cart.",
        variant: "destructive",
      });
    },
  });

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="w-full h-96" />
        </div>
      </div>
    );
  }

  // Calculate totals
  const subtotal = cartItems.reduce((total: number, item: any) => {
    const price = parseFloat(item.product?.price || "0");
    return total + (price * item.quantity);
  }, 0);

  const shipping = subtotal > 100 ? 0 : 15.99; // Free shipping over $100
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-20 h-20" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="w-3/4 h-4" />
                      <Skeleton className="w-1/2 h-4" />
                    </div>
                    <Skeleton className="w-24 h-8" />
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="w-full h-64" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          {" / "}
          <span className="text-gray-900">Shopping Cart</span>
        </nav>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <Link href="/products">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some electrical products to get started.</p>
            <Button asChild className="bg-copper-600 hover:bg-copper-700">
              <Link href="/products">Shop Products</Link>
            </Button>
          </div>
        ) : (
          /* Cart with Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Cart Items ({cartItems.length})
                    </h2>
                    {cartItems.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => clearCartMutation.mutate()}
                        disabled={clearCartMutation.isPending}
                      >
                        {clearCartMutation.isPending ? "Clearing..." : "Clear Cart"}
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item: any) => (
                    <div key={item.id} className="p-6">
                      <CartItem item={item} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-600 font-medium">FREE</span>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {subtotal < 100 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Add ${(100 - subtotal).toFixed(2)} more for free shipping!
                    </p>
                  </div>
                )}

                <Button 
                  asChild 
                  className="w-full mt-6 bg-electric-blue-600 hover:bg-electric-blue-700 text-white"
                  size="lg"
                >
                  <Link href="/checkout">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Proceed to Checkout
                  </Link>
                </Button>

                {/* Security Notice */}
                <div className="mt-4 text-center text-sm text-gray-500">
                  <p>🔒 Secure checkout with SSL encryption</p>
                </div>

                {/* Additional Info */}
                <div className="mt-6 space-y-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span>✓</span>
                    <span>30-day return policy</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>✓</span>
                    <span>Manufacturer warranty included</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>✓</span>
                    <span>Expert customer support</span>
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
