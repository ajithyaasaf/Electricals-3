// Cart Item Component - Enterprise-grade cart item with all features
import { useState } from 'react';
import { Minus, Plus, X, Heart, Save, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { formatPrice } from '@/lib/currency';
import { cn } from '@/lib/utils';
import type { CartItemWithDetails } from '@shared/cart-types';

interface CartItemProps {
  item: CartItemWithDetails;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  onSaveForLater: (itemId: string) => void;
  onMoveToCart: (itemId: string) => void;
  onUpdateNotes: (itemId: string, notes: string) => void;
  isUpdating?: boolean;
  className?: string;
}

export function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  onSaveForLater,
  onMoveToCart,
  onUpdateNotes,
  isUpdating = false,
  className
}: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(item.notes || '');

  // Get product or service details
  const productOrService = item.product || item.service;
  const isProduct = !!item.product;
  const isService = !!item.service;

  if (!productOrService) {
    return null; // Don't render if no product/service data
  }

  // Calculate prices
  const unitPrice = item.unitPrice || (isProduct ? item.product?.price : item.service?.startingPrice) || 0;
  const originalPrice = item.originalPrice || (isProduct && item.product?.originalPrice) || unitPrice;
  const totalPrice = unitPrice * quantity;
  const totalOriginalPrice = originalPrice * quantity;
  const savings = totalOriginalPrice - totalPrice;
  const hasDiscount = savings > 0;

  // Handle quantity changes
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  const handleNotesUpdate = () => {
    onUpdateNotes(item.id, notes);
    setShowNotes(false);
  };

  return (
    <div className={cn(
      "bg-white rounded-lg border p-4 sm:p-6 transition-all duration-200",
      isUpdating && "opacity-70 pointer-events-none",
      item.savedForLater && "border-amber-200 bg-amber-50",
      className
    )}>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-4 min-w-0 flex-grow">
          {/* Product Image */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
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
          </div>

          {/* Item Details */}
          <div className="flex-grow min-w-0">
            <div className="flex justify-between items-start">
              <div className="flex-grow pr-2">
                <h3 className="font-semibold text-gray-900 mb-1 break-words line-clamp-2">
                  {productOrService.name}
                </h3>
                
                {/* Product/Service Type Badge */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <Badge variant={isProduct ? "default" : "secondary"} className="text-xs">
                    {isProduct ? "Product" : "Service"}
                  </Badge>
                  
                  {item.appliedCoupons.length > 0 && (
                    <Badge variant="outline" className="text-xs text-green-600">
                      Coupon Applied
                    </Badge>
                  )}
                </div>

                {/* Short Description */}
                {productOrService.shortDescription && (
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
                    {productOrService.shortDescription}
                  </p>
                )}

                {/* Customizations */}
                {item.customizations && Object.keys(item.customizations).length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-medium text-gray-700 mb-1">Customizations:</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(item.customizations).map(([key, value]) => (
                        <Badge key={key} variant="outline" className="text-xs">
                          {key}: {String(value)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock Warning */}
                {isProduct && item.product && item.product.stock <= 5 && (
                  <div className="mb-2">
                    <Badge variant="destructive" className="text-xs">
                      Only {item.product.stock} left in stock
                    </Badge>
                  </div>
                )}
              </div>

              {/* Remove Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(item.id)}
                className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0"
                disabled={isUpdating}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Price and Quantity Section */}
        <div className="w-full pt-2 border-t sm:border-t-0 sm:pt-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Quantity Controls & Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1 || isUpdating}
                  className="px-2 py-1 h-8"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                
                <Input
                  type="number"
                  min="1"
                  max="99"
                  step="1"
                  onKeyDown={(e) => {
                    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  value={quantity}
                  onChange={(e) => {
                    const newQuantity = parseInt(e.target.value) || 1;
                    handleQuantityChange(newQuantity);
                  }}
                  className="w-12 sm:w-16 h-8 text-center border-0 focus-visible:ring-0 text-sm"
                  disabled={isUpdating}
                />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= 99 || isUpdating}
                  className="px-2 py-1 h-8"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {item.savedForLater ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMoveToCart(item.id)}
                    disabled={isUpdating}
                    className="text-xs h-8 px-2.5"
                  >
                    <ArrowRight className="w-3 h-3 mr-1" />
                    Move to Cart
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSaveForLater(item.id)}
                    disabled={isUpdating}
                    className="text-xs h-8 px-2.5"
                  >
                    <Save className="w-3 h-3 mr-1" />
                    Save for Later
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotes(!showNotes)}
                  className="text-xs text-gray-500 h-8 px-2"
                >
                  Add Note
                </Button>
              </div>
            </div>

            {/* Price */}
            <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base sm:text-lg text-gray-900">
                  {formatPrice(totalPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-xs sm:text-sm text-gray-500 line-through">
                    {formatPrice(totalOriginalPrice)}
                  </span>
                )}
              </div>
              
              {hasDiscount && (
                <div className="text-xs sm:text-sm text-green-600 font-medium">
                  Save {formatPrice(savings)}
                </div>
              )}
              
              <div className="text-xs text-gray-500">
                {formatPrice(unitPrice)} each
                {hasDiscount && (
                  <span className="ml-1 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {showNotes && (
            <div className="mt-4 pt-4 border-t space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Special Instructions
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any special instructions or notes..."
                className="resize-none"
                rows={2}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotes(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleNotesUpdate}
                >
                  Save Note
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
}