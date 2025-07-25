import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { CartItem } from "@/components/cart/cart-item";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useGuestCart } from "@/hooks/use-guest-cart";
import { apiRequest } from "@/lib/queryClient";
import { formatPrice } from "@/lib/currency";
import { ShoppingCart, CreditCard, X } from "lucide-react";

interface CartSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSidebar({ open, onOpenChange }: CartSidebarProps) {
  const { isAuthenticated } = useFirebaseAuth();
  const { guestCart, removeFromGuestCart, updateGuestCartQuantity, clearGuestCart } = useGuestCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch authenticated user cart items
  const { data: authCartItems = [], isLoading } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated && open,
  });

  // Fetch guest cart items with product details
  const { data: guestCartItems = [], isLoading: guestCartLoading } = useQuery({
    queryKey: ["/api/cart/guest", guestCart],
    queryFn: async () => {
      if (guestCart.length === 0) return [];
      
      const response = await fetch("/api/cart/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: guestCart }),
      });
      
      if (!response.ok) throw new Error("Failed to fetch guest cart");
      return response.json();
    },
    enabled: !isAuthenticated && open && guestCart.length > 0,
  });

  // Use appropriate cart items based on authentication status
  const cartItems = isAuthenticated ? authCartItems : guestCartItems;

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (isAuthenticated) {
        for (const item of cartItems) {
          await apiRequest("DELETE", `/api/cart/${item.id}`);
        }
      } else {
        clearGuestCart();
      }
    },
    onSuccess: () => {
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/cart/guest"] });
      }
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
        duration: 2000,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear cart.",
        variant: "destructive",
        duration: 2000,
      });
    },
  });

  // Calculate totals
  const subtotal = cartItems.reduce((total: number, item: any) => {
    const price = parseFloat(item.product?.price || "0");
    return total + (price * item.quantity);
  }, 0);

  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 8300 ? 0 : 1329; // Free shipping over ₹8,300
  const total = subtotal + tax + shipping;

  const handleCheckout = () => {
    onOpenChange(false); // Close the sidebar
    // Navigation to checkout will be handled by the Link component
  };

  // Handle loading state for both authenticated and guest users
  const isLoadingState = isAuthenticated ? isLoading : guestCartLoading;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-96 flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Shopping Cart ({cartItems.length})
            </div>
            {cartItems.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearCartMutation.mutate()}
                disabled={clearCartMutation.isPending}
              >
                Clear All
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        {isLoadingState ? (
          <div className="space-y-4 flex-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-16 w-16 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-4">Add some electrical products to get started!</p>
            <Button asChild onClick={() => onOpenChange(false)}>
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4">
                {cartItems.map((item: any) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </ScrollArea>

            {/* Cart Summary */}
            <div className="border-t pt-4 mt-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping:</span>
                  <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-2">
                {!isAuthenticated && (
                  <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-center">
                    <p className="text-sm text-blue-700">Sign in at checkout to complete your order</p>
                  </div>
                )}
                <Button 
                  asChild 
                  className="w-full" 
                  size="lg"
                  onClick={handleCheckout}
                >
                  <Link href="/checkout">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Proceed to Checkout
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => onOpenChange(false)}
                  asChild
                >
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </div>

              {/* Free Shipping Notice */}
              {subtotal < 100 && (
                <div className="mt-4 p-3 bg-copper-50 rounded-lg text-center">
                  <p className="text-sm text-copper-700">
                    Add ${(100 - subtotal).toFixed(2)} more for free shipping!
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}