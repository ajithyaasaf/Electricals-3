import { useState, memo } from "react";
import { SmartLink } from "@/components/navigation/smart-link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LazyImage } from "@/components/ui/lazy-image";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useCartContext } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatPrice } from "@/lib/currency";
import { Heart, ShoppingCart, Star } from "lucide-react";
import type { ProductWithCategory } from "@/lib/types";

interface ProductCardProps {
  product: ProductWithCategory;
  showCategory?: boolean;
}

export const ProductCard = memo(function ProductCard({ product, showCategory = false }: ProductCardProps) {
  const { addItem } = useCartContext();
  const { isAuthenticated } = useFirebaseAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await addItem(product.id.toString(), undefined, 1, undefined, product);
    },
    onSuccess: () => {
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
        duration: 2000,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Allow both authenticated and guest users to add to cart
    addToCartMutation.mutate();
  };

  const imageUrl = product.imageUrls?.[0] || "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300";
  const rating = parseFloat(product.price ? "4.5" : "0"); // Placeholder logic if rating missing, reusing price field check just to be safe or use product.rating
  const validRating = parseFloat(product.rating || "0");
  const reviewCount = product.reviewCount || 0;
  const price = parseFloat(product.price);
  const originalPrice = product.originalPrice ? parseFloat(product.originalPrice) : null;
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercentage = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div className="group h-full flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      <SmartLink href={`/products/${product.slug}`} className="flex flex-col h-full">
        {/* Image Container with consistent aspect ratio */}
        <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
          <LazyImage
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            fallback="/api/placeholder/400/300"
          />

          {/* Overlay Gradient for better text readability if needed, mostly for bottom, but here just subtle hover effect */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

          {/* Badges - refined positioning and look */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {product.isFeatured && (
              <Badge className="bg-amber-500 hover:bg-amber-600 border-none shadow-sm text-[10px] uppercase tracking-wider px-2 py-0.5 h-auto">
                Best Seller
              </Badge>
            )}
            {hasDiscount && (
              <Badge className="bg-green-600 hover:bg-green-700 border-none shadow-sm text-[10px] uppercase tracking-wider px-2 py-0.5 h-auto">
                {discountPercentage}% OFF
              </Badge>
            )}
            {product.stock === 0 && (
              <Badge variant="destructive" className="shadow-sm text-[10px] uppercase tracking-wider px-2 py-0.5 h-auto">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Wishlist Button - improved visibility */}
          <div className="absolute top-3 right-3 z-10 transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
            <WishlistButton
              productId={product.id.toString()}
              variant="icon"
              size="sm"
              addedFrom="listing_page"
              showText={false}
              className="bg-white/90 backdrop-blur-sm shadow-md hover:bg-white text-gray-700 hover:text-red-500 rounded-full h-8 w-8"
            />
          </div>
        </div>

        {/* Content Section - better padding and hierarchy */}
        <div className="flex flex-col flex-grow p-4 md:p-5">
          {/* Category Tag */}
          {showCategory && product.category && (
            <div className="text-xs font-semibold tracking-wider text-copper-600 uppercase mb-2">
              {product.category.name}
            </div>
          )}

          {/* Title */}
          <h3 className="text-base font-medium text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-copper-700 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i < Math.floor(validRating) ? "fill-current" : "text-gray-200"}`}
                />
              ))}
            </div>
            {reviewCount > 0 && (
              <span className="text-xs text-gray-400 ml-1">({reviewCount})</span>
            )}
          </div>

          {/* Spacer to push bottom section down */}
          <div className="flex-grow" />

          {/* Price and Action Section */}
          <div className="pt-3 border-t border-gray-50 flex items-end justify-between gap-3 mt-2">
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
              <span className="text-lg font-bold text-gray-900 leading-none">
                {formatPrice(price)}
              </span>
            </div>

            {/* Compact Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending || product.stock === 0}
              size="sm"
              className={`
                rounded-lg transition-all duration-300 shadow-none hover:shadow-md
                ${product.stock === 0
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-copper-50 text-copper-700 hover:bg-copper-600 hover:text-white border border-copper-100 hover:border-copper-600'
                }
              `}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="sr-only">Add to Cart</span>
            </Button>
          </div>
        </div>
      </SmartLink>
    </div>
  );
});
