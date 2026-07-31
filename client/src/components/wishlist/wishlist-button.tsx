// Wishlist Button Component - Add/Remove items from wishlist
import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/contexts/wishlist-context';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  productId?: string;
  serviceId?: string;
  variant?: 'default' | 'icon' | 'text';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  addedFrom?: 'product_page' | 'listing_page' | 'search' | 'recommendation' | 'other';
  showText?: boolean;
  priority?: 'low' | 'medium' | 'high';
}

export function WishlistButton({
  productId,
  serviceId,
  variant = 'default',
  size = 'default',
  className,
  addedFrom = 'other',
  showText = true,
  priority = 'medium',
}: WishlistButtonProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist, loading } = useWishlist();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const inWishlist = isInWishlist(productId, serviceId);
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Fire non-blocking optimistic update immediately
    if (inWishlist) {
      removeFromWishlist(productId || '', serviceId || '').catch(err => console.error('Error removing from wishlist:', err));
    } else {
      addToWishlist(productId, serviceId, {
        addedFrom,
        priority,
      }).catch(err => console.error('Error adding to wishlist:', err));
    }
  };

  const isLoading = false; // Optimistic execution — UI responds instantly (0ms delay)
  
  if (variant === 'icon') {
    return (
      <Button
        variant="outline"
        size={size}
        className={cn(
          "relative overflow-hidden transition-all duration-200",
          inWishlist && "border-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900",
          className
        )}
        onClick={handleClick}
        disabled={isLoading}
        data-testid={`wishlist-button-${productId || serviceId}`}
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-all duration-200",
            inWishlist ? "fill-red-500 text-red-500" : "text-gray-500 hover:text-red-500",
            isLoading && "animate-pulse"
          )}
        />
      </Button>
    );
  }
  
  if (variant === 'text') {
    return (
      <Button
        variant="ghost"
        size={size}
        className={cn(
          "text-sm font-medium transition-all duration-200",
          inWishlist ? "text-red-600 hover:text-red-700" : "text-gray-600 hover:text-red-600",
          className
        )}
        onClick={handleClick}
        disabled={isLoading}
        data-testid={`wishlist-text-${productId || serviceId}`}
      >
        <Heart
          className={cn(
            "mr-2 h-4 w-4 transition-all duration-200",
            inWishlist ? "fill-red-500 text-red-500" : "text-gray-500"
          )}
        />
        {isLoading ? 'Updating...' : inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
      </Button>
    );
  }
  
  return (
    <Button
      variant={inWishlist ? "default" : "outline"}
      size={size}
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        inWishlist && "bg-red-600 hover:bg-red-700 border-red-600 text-white",
        className
      )}
      onClick={handleClick}
      disabled={isLoading}
      data-testid={`wishlist-default-${productId || serviceId}`}
    >
      <Heart
        className={cn(
          "mr-2 h-4 w-4 transition-all duration-200",
          inWishlist ? "fill-white text-white" : "text-gray-500"
        )}
      />
      {showText && (
        <span>
          {isLoading ? 'Updating...' : inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
        </span>
      )}
    </Button>
  );
}