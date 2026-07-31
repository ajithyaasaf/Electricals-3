import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, ShoppingBag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/ui/lazy-image";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice, formatSavings, calculateDiscount } from "@/lib/currency";
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
    <div className="bg-white py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h2>
            {dealBadge && (
              <span className="bg-teal-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                {dealBadge}
              </span>
            )}
          </div>
          {viewAllLink && (
            <Link href={viewAllLink} className="text-teal-600 hover:text-teal-700 font-medium text-sm self-start sm:self-auto">
              See all →
            </Link>
          )}
        </div>

        {/* Horizontal Scrolling Product Container */}
        <div className="relative">
          {/* Left Arrow */}
          {canScrollLeft && (
            <Button
              variant="outline"
              size="sm"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:bg-gray-50 w-10 h-10 rounded-full p-0"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}

          {/* Right Arrow */}
          {canScrollRight && (
            <Button
              variant="outline"
              size="sm"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:bg-gray-50 w-10 h-10 rounded-full p-0"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          )}

          {/* Scrollable Product Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((product) => {
              const displayImage = product.imageUrls?.[0] || product.image || "/placeholder.png";

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug || product.id}`}
                  className="flex-shrink-0 w-44 sm:w-48 group cursor-pointer"
                >
                  <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group-hover:border-teal-200">
                    <CardContent className="p-3 flex flex-col justify-between h-full">
                      <div>
                        {/* Product Image */}
                        <div className="relative mb-3">
                          <LazyImage
                            src={displayImage}
                            alt={product.name}
                            className="w-full h-36 sm:h-40 object-cover rounded-lg"
                            fallback="/api/placeholder/200/160"
                          />
                          {product.originalPrice && product.originalPrice > product.price && (
                            <div className="absolute top-2 left-2 bg-teal-600 text-white px-2 py-1 rounded text-xs font-medium shadow-sm">
                              {calculateDiscount(product.originalPrice, product.price)}% OFF
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-teal-600 transition-colors leading-tight">
                            {product.name}
                          </h3>

                          {product.rating && (
                            <div className="flex items-center gap-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    className={`text-xs ${i < product.rating! ? 'text-teal-500' : 'text-gray-300'}`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">({product.rating})</span>
                            </div>
                          )}

                          {showPrices && (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-base sm:text-lg font-bold text-gray-900">
                                  {formatPrice(product.price)}
                                </span>
                                {product.originalPrice && product.originalPrice > product.price && (
                                  <span className="text-xs sm:text-sm text-gray-500 line-through">
                                    {formatPrice(product.originalPrice)}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quick Add to Cart CTA */}
                      <div className="mt-3 pt-2 border-t border-gray-100">
                        <Button
                          size="sm"
                          className="w-full bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white font-medium text-xs h-8 transition-colors flex items-center justify-center gap-1.5"
                          onClick={(e) => handleQuickAdd(e, product)}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </Button>
                      </div>
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