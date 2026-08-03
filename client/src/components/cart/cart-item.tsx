// Cart Item Component - Enterprise-grade cart item with responsive mobile/desktop layout
import { useState } from 'react';
import { Minus, Plus, Trash2, Save, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

  if (!productOrService) {
    return null;
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
      "relative bg-white rounded-xl border border-gray-200/80 p-3.5 sm:p-5 transition-all duration-200 hover:border-gray-300 shadow-sm space-y-3",
      isUpdating && "opacity-70 pointer-events-none",
      item.savedForLater && "border-amber-200 bg-amber-50/50",
      className
    )}>
      
      {/* Top Row: Image + Title/Details + Price */}
      <div className="flex items-start justify-between gap-3">
        
        {/* Left: Image + Title & Details */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Image */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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

          {/* Details */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight truncate">
                {productOrService.name}
              </h3>
              <Badge variant={isProduct ? "default" : "secondary"} className="text-[10px] px-1.5 py-0 font-medium bg-teal-600 hover:bg-teal-700">
                {isProduct ? "Product" : "Service"}
              </Badge>
            </div>

            {productOrService.shortDescription && (
              <p className="text-xs text-gray-500 line-clamp-1">
                {productOrService.shortDescription}
              </p>
            )}

            {/* Customizations */}
            {item.customizations && Object.keys(item.customizations).length > 0 && (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {Object.entries(item.customizations).map(([key, value]) => (
                  <Badge key={key} variant="outline" className="text-[10px] text-gray-600 bg-gray-50 px-1.5 py-0">
                    {key}: {String(value)}
                  </Badge>
                ))}
              </div>
            )}

            {/* Stock Warning */}
            {isProduct && item.product && item.product.stock <= 5 && (
              <p className="text-[11px] text-amber-700 font-medium">
                Only {item.product.stock} left in stock
              </p>
            )}
          </div>
        </div>

        {/* Right: Price Display */}
        <div className="text-right flex-shrink-0">
          <div className="font-bold text-base sm:text-lg text-gray-900">
            {formatPrice(totalPrice)}
          </div>
          {hasDiscount && (
            <div className="text-xs text-gray-400 line-through">
              {formatPrice(totalOriginalPrice)}
            </div>
          )}
          <div className="text-[11px] text-gray-500 font-normal">
            {formatPrice(unitPrice)} each
          </div>
        </div>

      </div>

      {/* Bottom Controls Row: Quantity Selector (Left) + Actions (Right) */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
        
        {/* Quantity Picker Box */}
        <div className="inline-flex items-center border border-gray-200 rounded-lg bg-gray-50/80 p-0.5 shadow-sm gap-0.5">
          {quantity <= 1 ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(item.id)}
              disabled={isUpdating}
              className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md"
              title="Remove item"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={isUpdating}
              className="h-7 w-7 text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 rounded-md"
              title="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </Button>
          )}

          <Input
            type="number"
            min="1"
            max="99"
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1;
              handleQuantityChange(val);
            }}
            className="w-9 h-7 text-center font-bold text-xs text-gray-900 border-0 bg-transparent p-0 focus-visible:ring-0"
            disabled={isUpdating}
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= 99 || isUpdating}
            className="h-7 w-7 text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 rounded-md"
            title="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Save for Later & Note Buttons */}
        <div className="flex items-center gap-1.5">
          {item.savedForLater ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMoveToCart(item.id)}
              disabled={isUpdating}
              className="text-xs h-7 px-2 text-teal-700 border-teal-200 hover:bg-teal-50"
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
              className="text-xs h-7 px-2.5 text-gray-700 border-gray-200 hover:bg-gray-50"
            >
              <Save className="w-3 h-3 mr-1 text-gray-500" />
              Save for Later
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotes(!showNotes)}
            className="text-xs text-gray-500 hover:text-gray-800 h-7 px-2"
          >
            {showNotes ? "Cancel" : "Add Note"}
          </Button>
        </div>

      </div>

      {/* Notes Form Section */}
      {showNotes && (
        <div className="pt-2 border-t border-gray-100 space-y-2">
          <label className="text-xs font-medium text-gray-700">
            Special Instructions / Order Note
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any special instructions or notes for this item..."
            className="resize-none text-xs bg-gray-50/50"
            rows={2}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotes(false)}
              className="text-xs h-7"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleNotesUpdate}
              className="text-xs h-7 bg-teal-600 hover:bg-teal-700 text-white"
            >
              Save Note
            </Button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
          <div className="animate-spin w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
}