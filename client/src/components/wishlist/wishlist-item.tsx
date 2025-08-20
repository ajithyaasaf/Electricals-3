// Wishlist Item Component - Display individual wishlist items
import { useState } from 'react';
import { Heart, ShoppingCart, Trash2, Edit, Star, Package, Wrench, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWishlist } from '@/contexts/wishlist-context';
import type { WishlistItemWithDetails } from '@shared/wishlist-types';
import { formatPrice as formatCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';

interface WishlistItemProps {
  item: WishlistItemWithDetails;
  className?: string;
  showControls?: boolean;
  compact?: boolean;
}

export function WishlistItem({
  item,
  className,
  showControls = true,
  compact = false,
}: WishlistItemProps) {
  const { removeFromWishlist, moveToCart, updateWishlistItem } = useWishlist();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  
  const product = item.product;
  const service = item.service;
  const isProduct = !!product;
  const isService = !!service;
  
  const name = product?.name || service?.name || 'Unknown Item';
  const price = item.currentPrice || 0;
  const originalPrice = item.originalPrice || price;
  const imageUrl = (product?.imageUrls?.[0] || service?.imageUrls?.[0]) || '';
  const slug = product?.slug || service?.slug || '';
  const description = product?.shortDescription || service?.shortDescription || '';
  
  const handleRemove = async () => {
    if (isRemoving) return;
    setIsRemoving(true);
    try {
      await removeFromWishlist(item.id);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    } finally {
      setIsRemoving(false);
    }
  };
  
  const handleMoveToCart = async () => {
    if (isMoving) return;
    setIsMoving(true);
    try {
      await moveToCart(item.id, 1, true);
    } catch (error) {
      console.error('Error moving to cart:', error);
    } finally {
      setIsMoving(false);
    }
  };
  
  const handleUpdatePriority = async (priority: 'low' | 'medium' | 'high') => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await updateWishlistItem(item.id, { priority });
    } catch (error) {
      console.error('Error updating priority:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <ArrowUp className="h-3 w-3" />;
      case 'medium': return <Minus className="h-3 w-3" />;
      case 'low': return <ArrowDown className="h-3 w-3" />;
      default: return null;
    }
  };
  
  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors",
          className
        )}
        data-testid={`wishlist-item-compact-${item.id}`}
      >
        {/* Image */}
        <div className="flex-shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-12 h-12 object-cover rounded-md"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
              {isProduct ? <Package className="h-6 w-6 text-gray-400" /> : <Wrench className="h-6 w-6 text-gray-400" />}
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-semibold text-copper-600">
              {formatCurrency(price)}
            </span>
            {item.isOnSale && originalPrice > price && (
              <span className="text-xs text-gray-500 line-through">
                {formatCurrency(originalPrice)}
              </span>
            )}
          </div>
        </div>
        
        {/* Actions */}
        {showControls && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMoveToCart}
              disabled={isMoving}
              data-testid={`move-to-cart-${item.id}`}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={isRemoving}
              data-testid={`remove-wishlist-${item.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <Card
      className={cn(
        "group hover:shadow-md transition-all duration-200 overflow-hidden",
        className
      )}
      data-testid={`wishlist-item-${item.id}`}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Image */}
          <div className="flex-shrink-0">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="w-20 h-20 object-cover rounded-lg"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                {isProduct ? <Package className="h-8 w-8 text-gray-400" /> : <Wrench className="h-8 w-8 text-gray-400" />}
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-copper-600 transition-colors">
                  {name}
                </h3>
                {description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {description}
                  </p>
                )}
              </div>
              
              {/* Price */}
              <div className="text-right">
                <div className="font-bold text-lg text-copper-600">
                  {formatCurrency(price)}
                </div>
                {item.isOnSale && originalPrice > price && (
                  <div className="text-sm text-gray-500 line-through">
                    {formatCurrency(originalPrice)}
                  </div>
                )}
                {item.priceDifference && item.priceDifference > 0 && (
                  <div className="text-xs text-green-600 font-medium">
                    Saved {formatCurrency(item.priceDifference)}
                  </div>
                )}
              </div>
            </div>
            
            {/* Meta Information */}
            <div className="flex items-center gap-3 mb-3">
              {/* Type Badge */}
              <Badge variant="secondary" className="text-xs">
                {isProduct ? 'Product' : 'Service'}
              </Badge>
              
              {/* Priority */}
              <Badge
                className={cn("text-xs border", getPriorityColor(item.priority))}
                data-testid={`priority-${item.priority}`}
              >
                {getPriorityIcon(item.priority)}
                <span className="ml-1 capitalize">{item.priority}</span>
              </Badge>
              
              {/* Stock Status */}
              {item.stockStatus && (
                <Badge
                  variant={item.stockStatus === 'in_stock' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {item.stockStatus === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                </Badge>
              )}
              
              {/* Sale Badge */}
              {item.isOnSale && (
                <Badge variant="destructive" className="text-xs">
                  On Sale
                </Badge>
              )}
            </div>
            
            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {item.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Notes */}
            {item.notes && (
              <div className="text-sm text-gray-600 mb-3 p-2 bg-gray-50 rounded-md">
                <strong>Notes:</strong> {item.notes}
              </div>
            )}
            
            {/* Actions */}
            {showControls && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Priority Controls */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpdatePriority('high')}
                      disabled={isUpdating || item.priority === 'high'}
                      className="text-red-600 hover:text-red-700"
                      data-testid={`priority-high-${item.id}`}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpdatePriority('medium')}
                      disabled={isUpdating || item.priority === 'medium'}
                      className="text-yellow-600 hover:text-yellow-700"
                      data-testid={`priority-medium-${item.id}`}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpdatePriority('low')}
                      disabled={isUpdating || item.priority === 'low'}
                      className="text-green-600 hover:text-green-700"
                      data-testid={`priority-low-${item.id}`}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMoveToCart}
                    disabled={isMoving || item.stockStatus === 'out_of_stock'}
                    data-testid={`move-to-cart-${item.id}`}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {isMoving ? 'Moving...' : 'Add to Cart'}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    disabled={isRemoving}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    data-testid={`remove-wishlist-${item.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}