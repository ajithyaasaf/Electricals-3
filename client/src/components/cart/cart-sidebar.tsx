// Cart Sidebar - Real-time cart preview with quick actions
import { useState } from 'react';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Package, Sparkles } from 'lucide-react';
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
import { useCartContext } from '@/contexts/cart-context';
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
    totalQuantity
  } = useCartContext();

  const cartItems = cart?.items || [];
  const itemCount = totalQuantity;
  const totals = cart?.totals;

  // Quick item component for sidebar - Enhanced design
  const QuickCartItem = ({ item }: { item: any }) => {
    const productOrService = item.product || item.service;
    if (!productOrService) return null;

    const hasDiscount = productOrService.compareAtPrice && productOrService.compareAtPrice > item.unitPrice;
    const discountPercent = hasDiscount
      ? Math.round((1 - item.unitPrice / productOrService.compareAtPrice) * 100)
      : 0;

    return (
      <div className="group relative bg-white border border-gray-100 rounded-xl p-3 hover:border-copper-200 hover:shadow-md transition-all duration-200">
        {/* Discount badge */}
        {hasDiscount && (
          <Badge className="absolute -top-2 -left-2 bg-red-500 text-white text-xs px-2 py-0.5 z-10">
            -{discountPercent}%
          </Badge>
        )}

        <div className="flex gap-3">
          {/* Product Image - Enhanced */}
          <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
            {productOrService.imageUrls?.[0] ? (
              <img
                src={productOrService.imageUrls[0]}
                alt={productOrService.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Package className="w-6 h-6" />
              </div>
            )}
          </div>

          <div className="flex-grow min-w-0">
            {/* Product Name */}
            <h4 className="text-sm font-semibold text-gray-900 truncate leading-tight">
              {productOrService.name}
            </h4>

            {/* Category badge if available */}
            {productOrService.category && (
              <span className="inline-block text-[10px] text-copper-600 bg-copper-50 px-1.5 py-0.5 rounded mt-1">
                {productOrService.category}
              </span>
            )}

            {/* Price section */}
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-base font-bold text-copper-700">
                {formatPrice(item.unitPrice * item.quantity)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(productOrService.compareAtPrice * item.quantity)}
                </span>
              )}
            </div>

            {/* Quantity controls - Enhanced */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1 || isLoading}
                  className="h-7 w-7 p-0 rounded-md hover:bg-copper-100 transition-all disabled:opacity-40"
                >
                  <Minus className="w-3 h-3 text-gray-700" />
                </Button>

                <span className="text-sm font-semibold px-3 min-w-[2rem] text-center">
                  {item.quantity}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= 99 || isLoading}
                  className="h-7 w-7 p-0 rounded-md hover:bg-copper-100 transition-all disabled:opacity-40"
                >
                  <Plus className="w-3 h-3 text-gray-700" />
                </Button>
              </div>

              {/* Remove button - Enhanced with trash icon */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(item.id)}
                disabled={isLoading}
                className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
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

        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
          {/* Header - Enhanced with gradient */}
          <div className="bg-gradient-to-r from-copper-600 to-copper-700 text-white p-4">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-white">
                <ShoppingBag className="w-5 h-5" />
                Shopping Cart
                <Badge className="bg-white/20 text-white border-0 ml-2">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </Badge>
              </SheetTitle>
            </SheetHeader>
          </div>

          {cartItems.length === 0 ? (
            // Empty state - Enhanced
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-gray-50 to-white">
              <div className="w-20 h-20 bg-copper-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-copper-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-500 mb-6 text-sm max-w-xs">
                Looks like you haven't added any electrical products yet. Start shopping to fill your cart!
              </p>
              <Button
                onClick={() => setIsOpen(false)}
                className="bg-lime-600 hover:bg-lime-700 text-white"
                asChild
              >
                <Link href="/products">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Explore Products
                </Link>
              </Button>
            </div>
          ) : (
            // Cart items - Enhanced layout
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Items list */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <QuickCartItem key={item.id} item={item} />
                  ))}
                </div>
              </ScrollArea>

              {/* Cart summary - Sticky footer with enhanced design */}
              <div className="border-t border-gray-200 bg-gradient-to-t from-gray-50 to-white p-4 space-y-3">
                {/* Summary details */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium text-gray-900">{formatPrice(totals?.subtotal || 0)}</span>
                  </div>

                  {(totals?.discount || 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Discount
                      </span>
                      <span className="font-medium text-green-600">-{formatPrice(totals?.discount || 0)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="font-medium text-gray-900">
                      {(totals?.shipping || 0) > 0 ? formatPrice(totals?.shipping || 0) : (
                        <span className="text-green-600">Free</span>
                      )}
                    </span>
                  </div>
                </div>

                <Separator className="my-2" />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-copper-700">{formatPrice(totals?.total || 0)}</span>
                </div>

                {/* Savings banner */}
                {(totals?.savings || 0) > 0 && (
                  <div className="flex items-center justify-center gap-2 text-sm text-green-700 bg-green-100 py-2 px-3 rounded-lg border border-green-200">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-medium">You're saving {formatPrice(totals?.savings || 0)}!</span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="space-y-2 pt-2">
                  <Button
                    className="w-full bg-lime-600 hover:bg-lime-700 text-white h-12 text-base font-semibold shadow-lg shadow-lime-600/20"
                    size="lg"
                    onClick={() => setIsOpen(false)}
                    asChild
                  >
                    <Link href="/checkout">
                      <span className="flex items-center justify-center gap-2">
                        Proceed to Checkout
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-copper-300 text-copper-700 hover:bg-copper-50 h-10"
                    onClick={() => setIsOpen(false)}
                    asChild
                  >
                    <Link href="/cart">
                      View Full Cart
                    </Link>
                  </Button>

                  <p className="text-xs text-gray-500 text-center pt-1 flex items-center justify-center gap-1">
                    <Package className="w-3 h-3" />
                    Free shipping on orders over ₹10,000
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin w-8 h-8 border-3 border-copper-600 border-t-transparent rounded-full" />
                <span className="text-sm text-gray-600">Updating cart...</span>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}