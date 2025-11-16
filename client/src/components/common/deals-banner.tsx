import { Link } from "wouter";
import { LazyImage } from "@/components/ui/lazy-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/currency";
import { Clock, Tag, Zap } from "lucide-react";

interface Deal {
  id: string;
  title: string;
  description: string;
  image: string;
  discount: string;
  originalPrice: number;
  salePrice: number;
  timeLeft?: string;
  link: string;
  category: string;
}

interface DealsBannerProps {
  deals: Deal[];
}

export function DealsBanner({ deals }: DealsBannerProps) {
  if (!deals || deals.length === 0) {
    return null;
  }

  const mainDeal = deals[0];
  const smallDeals = deals.slice(1, 4);

  return (
    <div className="bg-white py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 flex-wrap">
          <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Today's Deals</h2>
          <Badge className="bg-teal-600 text-white hover:bg-teal-700">
            Limited Time
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Main Featured Deal */}
          <div className="lg:col-span-2">
            <Link href={mainDeal.link} className="block group">
              <div className="relative bg-gradient-to-r from-teal-50 to-teal-light-50 rounded-xl p-4 sm:p-6 border border-teal-200 hover:shadow-lg transition-shadow duration-300">
                {/* Deal Badge */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                  <Badge className="bg-teal-600 text-white px-2 py-1 sm:px-3 text-xs sm:text-sm font-bold">
                    {mainDeal.discount}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center">
                  {/* Deal Content */}
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors line-clamp-2">
                        {mainDeal.title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-2">{mainDeal.description}</p>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <span className="text-2xl sm:text-3xl font-bold text-teal-600">
                          {formatPrice(mainDeal.salePrice)}
                        </span>
                        <span className="text-base sm:text-lg text-gray-500 line-through">
                          {formatPrice(mainDeal.originalPrice)}
                        </span>
                        <span className="text-xs sm:text-sm text-teal-light-600 font-medium bg-teal-light-50 px-2 py-1 rounded">
                          Save {formatPrice(mainDeal.originalPrice - mainDeal.salePrice)}
                        </span>
                      </div>

                      {mainDeal.timeLeft && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-teal-700">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="font-medium">Ends in {mainDeal.timeLeft}</span>
                        </div>
                      )}
                    </div>

                    <Button className="bg-teal-600 hover:bg-teal-700 text-white font-medium w-full sm:w-auto">
                      Shop Deal Now
                    </Button>
                  </div>

                  {/* Deal Image */}
                  <div className="relative">
                    <LazyImage
                      src={mainDeal.image}
                      alt={mainDeal.title}
                      className="w-full h-48 object-cover rounded-lg"
                      fallback="/api/placeholder/300/200"
                    />
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Smaller Deals Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {smallDeals.map((deal) => (
              <Link key={deal.id} href={deal.link} className="block group">
                <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow duration-200 h-full">
                  {/* Small Deal Image */}
                  <div className="relative mb-3">
                    <LazyImage
                      src={deal.image}
                      alt={deal.title}
                      className="w-full h-28 sm:h-32 object-cover rounded-md"
                      fallback="/api/placeholder/200/128"
                    />
                    <Badge className="absolute top-2 left-2 bg-teal-600 text-white text-xs font-medium">
                      {deal.discount}
                    </Badge>
                  </div>

                  {/* Small Deal Content */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-teal-600 transition-colors leading-tight">
                      {deal.title}
                    </h4>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base sm:text-lg font-bold text-teal-600">
                        {formatPrice(deal.salePrice)}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500 line-through">
                        {formatPrice(deal.originalPrice)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 capitalize">{deal.category}</p>
                      <span className="text-xs text-teal-light-600 font-medium">
                        {Math.round(((deal.originalPrice - deal.salePrice) / deal.originalPrice) * 100)}% off
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* View All Deals Link */}
        <div className="text-center mt-6">
          <Link 
            href="/deals" 
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
          >
            <Zap className="w-4 h-4" />
            View All Deals & Offers
          </Link>
        </div>
      </div>
    </div>
  );
}