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
  const unitPrice = item.unitPrice || productOrService.price;
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
      "bg-white rounded-lg border p-6 transition-all duration-200",
      isUpdating && "opacity-70 pointer-events-none",
      item.savedForLater && "border-amber-200 bg-amber-50",
      className
    )}>
      <div className="flex gap-4">
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
            <div className="flex-grow pr-4">
              <h3 className="font-semibold text-gray-900 mb-1 truncate">
                {productOrService.name}
              </h3>
              
              {/* Product/Service Type Badge */}
              <div className="flex items-center gap-2 mb-2">
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
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {productOrService.shortDescription}
                </p>
              )}

              {/* Customizations */}
              {item.customizations && Object.keys(item.customizations).length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Customizations:</p>
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
                <div className="mb-3">
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
              className="text-gray-400 hover:text-red-500 p-1"
              disabled={isUpdating}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Price and Quantity Row */}
          <div className="flex items-center justify-between mt-4">
            {/* Quantity Controls */}
            <div className="flex items-center gap-3">
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
                  value={quantity}
                  onChange={(e) => {
                    const newQuantity = parseInt(e.target.value) || 1;
                    handleQuantityChange(newQuantity);
                  }}
                  className="w-16 h-8 text-center border-0 focus-visible:ring-0"
                  min="1"
                  max="99"
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
              <div className="flex items-center gap-2">
                {item.savedForLater ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMoveToCart(item.id)}
                    disabled={isUpdating}
                    className="text-xs"
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
                    className="text-xs"
                  >
                    <Save className="w-3 h-3 mr-1" />
                    Save for Later
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotes(!showNotes)}
                  className="text-xs text-gray-500"
                >
                  Add Note
                </Button>
              </div>
            </div>

            {/* Price */}
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg text-gray-900">
                  {formatPrice(totalPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(totalOriginalPrice)}
                  </span>
                )}
              </div>
              
              {hasDiscount && (
                <div className="text-sm text-green-600 font-medium">
                  Save {formatPrice(savings)}
                </div>
              )}
              
              <div className="text-xs text-gray-500 mt-1">
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
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
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
            </>
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