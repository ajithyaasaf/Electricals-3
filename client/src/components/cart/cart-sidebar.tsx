// Cart Sidebar - Real-time cart preview with quick actions
import { useState } from 'react';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatPrice } from '@/lib/currency';
import { useUnifiedCart } from '@/hooks/useUnifiedCart';
import { cn } from '@/lib/utils';

interface CartSidebarProps {
  children: React.ReactNode;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CartSidebar({ children, className, open = false, onOpenChange }: CartSidebarProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;
  
  const {
    cart,
    isLoading,
    updateQuantity,
    removeItem,
    getItemsCount
  } = useUnifiedCart();
  
  const cartItems = cart?.items || [];
  const itemCount = getItemsCount();
  const totals = cart?.totals;

  // Quick item component for sidebar
  const QuickCartItem = ({ item }: { item: any }) => {
    const productOrService = item.product || item.service;
    if (!productOrService) return null;

    return (
      <div className="flex gap-3 py-3">
        <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
          {productOrService.imageUrls?.[0] ? (
            <img 
              src={productOrService.imageUrls[0]}
              alt={productOrService.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No Image
            </div>
          )}
        </div>

        <div className="flex-grow min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {productOrService.name}
          </h4>
          
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateQuantity({ itemId: item.id, quantity: item.quantity - 1 })}
                disabled={item.quantity <= 1 || isLoading}
                className="h-6 w-6 p-0"
              >
                <Minus className="w-3 h-3" />
              </Button>
              
              <span className="text-sm font-medium px-2">
                {item.quantity}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateQuantity({ itemId: item.id, quantity: item.quantity + 1 })}
                disabled={item.quantity >= 99 || isLoading}
                className="h-6 w-6 p-0"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeItem(item.id)}
              disabled={isLoading}
              className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>

          <p className="text-sm font-semibold text-gray-900 mt-1">
            {formatPrice(item.unitPrice * item.quantity)}
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* This div is just for the children, the sheet is controlled externally */}
      <div className={cn("relative", className)}>
        {children}
      </div>
      
      <Sheet open={isOpen} onOpenChange={setIsOpen}>

      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Shopping Cart ({itemCount})
          </SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Add some items to get started
            </p>
            <Button 
              onClick={() => setIsOpen(false)}
              asChild
            >
              <Link href="/products">
                Start Shopping
              </Link>
            </Button>
          </div>
        ) : (
          // Cart items
          <div className="flex flex-col h-full">
            {/* Items list */}
            <ScrollArea className="flex-grow py-4">
              <div className="space-y-1">
                {cartItems.map((item) => (
                  <QuickCartItem key={item.id} item={item} />
                ))}
              </div>
            </ScrollArea>

            <Separator />

            {/* Cart summary */}
            <div className="py-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(totals?.subtotal || 0)}</span>
              </div>

              {(totals?.discount || 0) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(totals?.discount || 0)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {(totals?.shipping || 0) > 0 ? formatPrice(totals?.shipping || 0) : 'Free'}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatPrice(totals?.total || 0)}</span>
              </div>

              {(totals?.savings || 0) > 0 && (
                <div className="text-center text-sm text-green-600 bg-green-50 py-2 rounded-md">
                  You're saving {formatPrice(totals?.savings || 0)}!
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-4 border-t">
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => setIsOpen(false)}
                asChild
              >
                <Link href="/cart">
                  <span className="flex items-center justify-center gap-2">
                    View Cart
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </Button>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsOpen(false)}
                asChild
              >
                <Link href="/checkout">
                  Quick Checkout
                </Link>
              </Button>

              <p className="text-xs text-gray-500 text-center pt-2">
                Free shipping on orders over ₹8,300
              </p>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}
      </SheetContent>
    </Sheet>
    </>
  );
}