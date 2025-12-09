import { Link } from "wouter";
import { LazyImage } from "@/components/ui/lazy-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/currency";
import { Clock, Tag, Zap } from "lucide-react";
import type { Product } from "@shared/types";

interface DealsBannerProps {
  products: Product[];
}

export function DealsBanner({ products }: DealsBannerProps) {
  if (!products || products.length === 0) {
    return null;
  }

  // Helper to format product data for display
  const getDealData = (product: Product) => {
    const originalPrice = product.originalPrice || product.price * 1.2; // Fallback for demo if data missing
    const salePrice = product.price;
    const discountPercent = Math.round(((originalPrice - salePrice) / originalPrice) * 100);

    return {
      id: product.id,
      title: product.name,
      description: product.description || product.shortDescription || "Limited time offer on this premium item.",
      image: product.imageUrls?.[0] || "/api/placeholder/400/400",
      discount: `${discountPercent}% OFF`,
      originalPrice,
      salePrice,
      link: `/products/${product.slug}`,
      category: "Special Offer" // We could fetch category name if needed, but keeping it simple
    };
  };

  const mainDeal = getDealData(products[0]);
  const smallDeals = products.slice(1, 4).map(getDealData);

  return (
    <div className="bg-white py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-copper-100 rounded-lg">
            <Tag className="w-5 h-5 text-copper-700" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Today's Deals</h2>
          <Badge className="bg-gradient-to-r from-copper-600 to-copper-700 text-white border-0 shadow-sm px-3 py-1">
            Limited Time Offers
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Main Featured Deal */}
          <div className="lg:col-span-2 h-full">
            <Link href={mainDeal.link} className="block group h-full">
              <div className="relative h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row">
                {/* Deal Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-red-600 text-white px-3 py-1.5 text-sm font-bold shadow-sm">
                    {mainDeal.discount}
                  </Badge>
                </div>

                {/* Deal Image */}
                <div className="sm:w-1/2 relative overflow-hidden">
                  <LazyImage
                    src={mainDeal.image}
                    alt={mainDeal.title}
                    className="w-full h-64 sm:h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    fallback="/api/placeholder/400/400"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent sm:bg-gradient-to-r" />
                </div>

                {/* Deal Content */}
                <div className="sm:w-1/2 p-6 flex flex-col justify-center bg-gradient-to-b from-white to-gray-50/50">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-copper-700 transition-colors leading-tight">
                        {mainDeal.title}
                      </h3>
                      <p className="text-gray-600 line-clamp-2 text-sm leading-relaxed">{mainDeal.description}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <span className="text-3xl font-bold text-gray-900">
                          {formatPrice(mainDeal.salePrice)}
                        </span>
                        <span className="text-lg text-gray-400 line-through decoration-1">
                          {formatPrice(mainDeal.originalPrice)}
                        </span>
                      </div>

                      <div className="inline-flex items-center gap-2 text-sm text-green-700 bg-green-50 px-2.5 py-1 rounded-md border border-green-100 w-fit">
                        <span className="font-medium">Save {formatPrice(mainDeal.originalPrice - mainDeal.salePrice)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-copper-700 font-medium">
                        <Clock className="w-4 h-4" />
                        <span>Ends Soon</span>
                      </div>
                    </div>

                    <Button className="w-full bg-gray-900 hover:bg-copper-600 text-white transition-colors shadow-lg shadow-gray-200 hover:shadow-copper-100">
                      View Deal
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Smaller Deals Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {smallDeals.length > 0 ? smallDeals.map((deal) => (
              <Link key={deal.id} href={deal.link} className="block group">
                <div className="bg-white border border-gray-100 rounded-xl p-3 sm:p-4 hover:shadow-xl hover:border-copper-100 transition-all duration-300 h-full flex flex-col">
                  {/* Small Deal Image */}
                  <div className="relative mb-3 overflow-hidden rounded-lg bg-gray-50 aspect-[4/3]">
                    <LazyImage
                      src={deal.image}
                      alt={deal.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      fallback="/api/placeholder/200/128"
                    />
                    <Badge className="absolute top-2 left-2 bg-white/90 backdrop-blur text-gray-900 border border-gray-100 text-xs font-bold shadow-sm">
                      {deal.discount}
                    </Badge>
                  </div>

                  {/* Small Deal Content */}
                  <div className="flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <p className="text-xs text-copper-600 font-medium tracking-wide uppercase mb-1">{deal.category}</p>
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-copper-700 transition-colors">
                        {deal.title}
                      </h4>
                    </div>

                    <div className="pt-2 border-t border-gray-50 flex items-end justify-between">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-gray-900">
                            {formatPrice(deal.salePrice)}
                          </span>
                          <span className="text-xs text-gray-400 line-through">
                            {formatPrice(deal.originalPrice)}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                        -{Math.round(((deal.originalPrice - deal.salePrice) / deal.originalPrice) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )) : (
              // Empty state for small deals if not enough products
              <div className="col-span-2 flex items-center justify-center p-8 text-gray-400 border border-dashed rounded-xl">
                No other deals available at the moment
              </div>
            )}
          </div>
        </div>

        {/* View All Deals Link */}
        <div className="text-center mt-6">
          <Link
            href="/deals"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-copper-600 font-medium transition-colors border-b border-transparent hover:border-copper-600 pb-0.5"
          >
            <Zap className="w-4 h-4" />
            View All Deals & Offers
          </Link>
        </div>
      </div>
    </div>
  );
}