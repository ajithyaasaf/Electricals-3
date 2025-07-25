import { Link } from "wouter";
import { LazyImage } from "@/components/ui/lazy-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <div className="bg-white py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-6">
          <Tag className="w-6 h-6 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900">Today's Deals</h2>
          <Badge variant="destructive" className="bg-red-500">
            Limited Time
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Featured Deal */}
          <div className="lg:col-span-2">
            <Link href={mainDeal.link} className="block group">
              <div className="relative bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-100 hover:shadow-lg transition-shadow duration-300">
                {/* Deal Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-red-500 text-white px-3 py-1 text-sm font-bold">
                    {mainDeal.discount}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* Deal Content */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                        {mainDeal.title}
                      </h3>
                      <p className="text-gray-600 mb-4">{mainDeal.description}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-red-600">
                          ${mainDeal.salePrice.toFixed(2)}
                        </span>
                        <span className="text-lg text-gray-500 line-through">
                          ${mainDeal.originalPrice.toFixed(2)}
                        </span>
                      </div>

                      {mainDeal.timeLeft && (
                        <div className="flex items-center gap-2 text-sm text-orange-600">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">Ends in {mainDeal.timeLeft}</span>
                        </div>
                      )}
                    </div>

                    <Button className="bg-red-600 hover:bg-red-700 text-white font-medium">
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
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {smallDeals.map((deal) => (
              <Link key={deal.id} href={deal.link} className="block group">
                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 h-full">
                  {/* Small Deal Image */}
                  <div className="relative mb-3">
                    <LazyImage
                      src={deal.image}
                      alt={deal.title}
                      className="w-full h-32 object-cover rounded-md"
                      fallback="/api/placeholder/200/128"
                    />
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
                      {deal.discount}
                    </Badge>
                  </div>

                  {/* Small Deal Content */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors">
                      {deal.title}
                    </h4>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-red-600">
                        ${deal.salePrice.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        ${deal.originalPrice.toFixed(2)}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 capitalize">{deal.category}</p>
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
            className="inline-flex items-center gap-2 text-copper-600 hover:text-copper-700 font-medium"
          >
            <Zap className="w-4 h-4" />
            View All Deals & Offers
          </Link>
        </div>
      </div>
    </div>
  );
}