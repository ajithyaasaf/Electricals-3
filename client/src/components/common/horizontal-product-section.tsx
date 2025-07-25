import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/ui/lazy-image";
import { Card, CardContent } from "@/components/ui/card";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
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

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="bg-white py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            {dealBadge && (
              <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-medium">
                {dealBadge}
              </span>
            )}
          </div>
          {viewAllLink && (
            <Link href={viewAllLink} className="text-copper-600 hover:text-copper-700 font-medium text-sm">
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
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="flex-shrink-0 w-48 group cursor-pointer"
              >
                <Card className="h-full border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-3">
                    {/* Product Image */}
                    <div className="relative mb-3">
                      <LazyImage
                        src={product.image}
                        alt={product.name}
                        className="w-full h-40 object-cover rounded-lg"
                        fallback="/api/placeholder/200/160"
                      />
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                          {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-copper-600 transition-colors">
                        {product.name}
                      </h3>
                      
                      {product.rating && (
                        <div className="flex items-center gap-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span 
                                key={i}
                                className={`text-xs ${i < product.rating! ? 'text-yellow-400' : 'text-gray-300'}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">({product.rating})</span>
                        </div>
                      )}

                      {showPrices && (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">
                            ${product.price.toFixed(2)}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-sm text-gray-500 line-through">
                              ${product.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500 capitalize">{product.category}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}