// Simple Wishlist Item Component - Clean e-commerce style
import React from 'react';
import { Link } from 'wouter';
import { X, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useWishlist } from '@/contexts/wishlist-context';
import type { WishlistItemWithDetails } from '@shared/wishlist-types';
import { formatPrice as formatCurrency } from '@/lib/currency';

interface WishlistItemProps {
  item: WishlistItemWithDetails;
}

export function WishlistItem({ item }: WishlistItemProps) {
  const { removeFromWishlist } = useWishlist();
  const product = item.product;
  const service = item.service;
  
  const name = product?.name || service?.name || 'Unknown Item';
  const price = item.currentPrice || product?.price || service?.price || 0;
  const originalPrice = item.originalPrice || price;
  const imageUrl = (product?.imageUrls?.[0] || service?.imageUrls?.[0]) || '';
  const slug = product?.slug || service?.slug || '';
  const isOnSale = originalPrice > price;
  const rating = product?.rating || service?.rating || 0;
  const reviewCount = product?.reviewCount || service?.reviewCount || 0;
  
  const handleRemove = async () => {
    await removeFromWishlist(item.productId || item.id, item.serviceId);
  };
  const productUrl = product ? `/product/${slug}` : `/service/${slug}`;

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
      <div className="relative">
        {/* Remove Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          className="absolute top-2 right-2 z-10 h-8 w-8 p-0 bg-white/80 hover:bg-white"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Product Image */}
        <Link href={productUrl}>
          <div className="aspect-square overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <ShoppingCart className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
        </Link>

        {/* Sale Badge */}
        {isOnSale && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-medium rounded">
            Sale
          </div>
        )}
      </div>

      <CardContent className="p-3">
        {/* Product Name */}
        <Link href={productUrl}>
          <h3 className="font-medium text-sm text-gray-900 hover:text-copper-600 transition-colors line-clamp-2 mb-2">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">({reviewCount})</span>
          </div>
        )}

        {/* Price */}
        <div className="mb-3">
          <div className="font-bold text-copper-600">
            {formatCurrency(price)}
          </div>
          {isOnSale && (
            <div className="text-xs text-gray-500 line-through">
              {formatCurrency(originalPrice)}
            </div>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button size="sm" className="w-full">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
}