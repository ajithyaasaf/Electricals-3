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
      await addItem(product.id.toString());
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
  const rating = parseFloat(product.rating || "0");
  const reviewCount = product.reviewCount || 0;
  const price = parseFloat(product.price);
  const originalPrice = product.originalPrice ? parseFloat(product.originalPrice) : null;
  const hasDiscount = originalPrice && originalPrice > price;

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 group">
      <SmartLink href={`/products/${product.slug}`}>
        <div className="relative overflow-hidden rounded-t-lg">
          <LazyImage
            src={imageUrl}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            fallback="/api/placeholder/400/300"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 space-y-2">
            {product.isFeatured && (
              <Badge className="bg-red-500 hover:bg-red-600">Best Seller</Badge>
            )}
            {hasDiscount && (
              <Badge className="bg-green-500 hover:bg-green-600">Sale</Badge>
            )}
            {product.stock === 0 && (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <WishlistButton
              productId={product.id.toString()}
              variant="icon"
              size="sm"
              addedFrom="listing_page"
              showText={false}
              className="bg-white shadow-md hover:shadow-lg"
            />
          </div>
        </div>

        <div className="p-4">
          {showCategory && product.category && (
            <p className="text-sm text-gray-500 mb-1">{product.category.name}</p>
          )}
          
          <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
            {product.name}
          </h4>

          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center mb-2">
              <div className="flex text-yellow-400 text-sm">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-current" : ""}`}
                  />
                ))}
              </div>
              <span className="text-gray-500 text-sm ml-2">({reviewCount})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(price)}
              </span>
              {originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending || product.stock === 0}
            className="w-full bg-copper-600 hover:bg-copper-700 text-white"
          >
            {addToCartMutation.isPending ? (
              "Adding..."
            ) : product.stock === 0 ? (
              "Out of Stock"
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </SmartLink>
    </div>
  );
});
