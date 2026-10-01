import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/ui/lazy-image";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice, calculateDiscount } from "@/lib/currency";
import { useCartContext } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string; // Kept optional for backward compatibility
  imageUrls?: string[]; // Added for real API data
  slug?: string; // Added for SEO friendly links
  category: string;
  rating?: number;
  originalPrice?: number;
}

interface HorizontalProductSectionProps {
  title: string;
  products: Product[];
  viewAllLink?: string;
  showPrices?: boolean;
  dealBadge?: string;
}

export function HorizontalProductSection({
  title,
  products,
  viewAllLink,
  showPrices = true,
  dealBadge
}: HorizontalProductSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const { addItem } = useCartContext();
  const { toast } = useToast();

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      return () => container.removeEventListener('scroll', checkScrollButtons);
    }
  }, [products]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = scrollContainerRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount);

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleQuickAdd = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addItem(product.id.toString(), undefined, 1, undefined, product);
      toast({
        title: "Added to Cart!",
        description: `${product.name} added to your cart.`,
      });
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="bg-white py-3 sm:py-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-5">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <h2 className="text-base sm:text-xl font-bold text-gray-900">{title}</h2>
            {dealBadge && (
              <span className="bg-teal-600 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium">
                {dealBadge}
              </span>
            )}
          </div>
          {viewAllLink && (
            <Link href={viewAllLink} className="text-teal-600 hover:text-teal-700 font-medium text-xs sm:text-sm self-start sm:self-auto">
              See all →
            </Link>
          )}
        </div>

        {/* Horizontal Scrolling Product Container */}
        <div className="relative">
          {/* Left Arrow - hidden on mobile swipe, positioned neatly on tablet/desktop */}
          {canScrollLeft && (
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:bg-gray-50 w-9 h-9 rounded-full p-0 items-center justify-center"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}

          {/* Right Arrow - hidden on mobile swipe, positioned neatly on tablet/desktop */}
          {canScrollRight && (
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:bg-gray-50 w-9 h-9 rounded-full p-0 items-center justify-center"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          )}

          {/* Scrollable Product Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-2.5 sm:gap-4 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((product) => {
              const displayImage = product.imageUrls?.[0] || product.image || "/placeholder.png";
              const rawRating = typeof product.rating === 'number' ? product.rating : parseFloat((product.rating as any) || "0");
              const numRating = !isNaN(rawRating) ? rawRating : 0;
              const hasRating = numRating > 0;

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug || product.id}`}
                  className="flex-shrink-0 w-36 sm:w-44 md:w-48 group cursor-pointer"
                >
                  <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group-hover:border-teal-200 flex flex-col">
                    <CardContent className="p-2 sm:p-3 flex flex-col justify-between h-full">
                      <div className="flex flex-col">
                        {/* Product Image */}
                        <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-50 mb-2">
                          <LazyImage
                            src={displayImage}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            fallback="/api/placeholder/200/160"
                          />
                          {product.originalPrice && product.originalPrice > product.price && (
                            <div className="absolute top-1.5 left-1.5 bg-teal-600 text-white px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-semibold shadow-sm">
                              {calculateDiscount(product.originalPrice, product.price)}% OFF
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="space-y-1">
                          <h3 className="text-xs sm:text-sm font-semibold sm:font-medium text-gray-900 line-clamp-2 group-hover:text-teal-600 transition-colors leading-snug min-h-[2rem]">
                            {product.name}
                          </h3>

                          {/* Star Rating - Always 5 stars (yellow if rated, gray if unrated). Never outputs raw 0 */}
                          <div className="flex items-center gap-1">
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    hasRating && i < Math.floor(numRating)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "fill-gray-100 text-gray-200"
                                  }`}
                                />
                              ))}
                            </div>
                            {hasRating ? (
                              <span className="text-[10px] sm:text-xs text-gray-400 ml-0.5">({numRating})</span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Price and Add to Cart Section - aligned horizontally on the same row */}
                      {showPrices && (
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-1.5 mt-2">
                          <div className="flex flex-col min-w-0">
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-[10px] sm:text-xs text-gray-400 line-through leading-none">
                                {formatPrice(product.originalPrice)}
                              </span>
                            )}
                            <span className="text-xs sm:text-sm md:text-base font-bold text-gray-900 leading-tight">
                              {formatPrice(product.price)}
                            </span>
                          </div>

                          <Button
                            size="sm"
                            aria-label={`Add ${product.name} to cart`}
                            className="h-7 w-7 sm:h-8 sm:w-auto p-0 sm:px-2.5 rounded-lg bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white border border-teal-100 hover:border-teal-600 transition-colors flex items-center justify-center gap-1 flex-shrink-0"
                            onClick={(e) => handleQuickAdd(e, product)}
                          >
                            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline text-xs font-medium">Add</span>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}