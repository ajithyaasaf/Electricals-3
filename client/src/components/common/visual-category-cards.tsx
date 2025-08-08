import { SmartLink } from "@/components/navigation/smart-link";
import { LazyImage } from "@/components/ui/lazy-image";
import { ArrowRight } from "lucide-react";

interface CategoryCard {
  name: string;
  slug: string;
  image: string;
  description: string;
  itemCount: number;
  featured?: boolean;
}

interface VisualCategoryCardsProps {
  categories: CategoryCard[];
}

export function VisualCategoryCards({ categories }: VisualCategoryCardsProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  // Split into featured and regular categories
  const featuredCategories = categories.filter(cat => cat.featured);
  const regularCategories = categories.filter(cat => !cat.featured);

  return (
    <div className="bg-gray-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Shop by Department</h2>
          <p className="text-sm sm:text-base text-gray-600">Discover our comprehensive electrical product categories</p>
        </div>

        {/* Featured Categories - Large Cards */}
        {featuredCategories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {featuredCategories.map((category) => (
              <SmartLink
                key={category.slug}
                href={category.slug === "services" ? "/services" : `/products?category=${category.slug}`}
                className="group block"
              >
                <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full group-hover:scale-[1.02]">
                  {/* Category Image */}
                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    <LazyImage
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      fallback="/api/placeholder/400/200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300" />
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                      <span className="bg-white bg-opacity-95 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-gray-900 shadow-sm">
                        {category.itemCount}+ Items
                      </span>
                    </div>

                    {/* Popular Badge for Featured */}
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                      <span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                        Popular
                      </span>
                    </div>
                  </div>

                  {/* Category Content */}
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-copper-600 transition-colors line-clamp-1">
                          {category.name}
                        </h3>
                        <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                          {category.description}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-copper-600 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 ml-3 sm:ml-4" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-copper-600 font-medium text-xs sm:text-sm group-hover:text-copper-700 transition-colors">
                        Shop Now →
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                        {category.itemCount}+ products
                      </div>  
                    </div>
                  </div>
                </div>
              </SmartLink>
            ))}
          </div>
        )}

        {/* Regular Categories - Horizontal Scrolling on Mobile */}
        {regularCategories.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">More Categories</h3>
              <span className="text-xs sm:text-sm text-gray-500">Scroll to explore →</span>
            </div>
            
            {/* Mobile: Horizontal Scroll, Desktop: Grid */}
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 sm:grid sm:grid-cols-4 lg:grid-cols-6 sm:gap-4 sm:overflow-visible sm:pb-0">
              {regularCategories.map((category) => (
                <SmartLink
                  key={category.slug}
                  href={category.slug === "services" ? "/services" : `/products?category=${category.slug}`}
                  className="group block flex-shrink-0 w-32 sm:w-auto"
                >
                  <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group-hover:scale-[1.02]">
                    {/* Compact Category Image */}
                    <div className="relative h-24 sm:h-32 overflow-hidden">
                      <LazyImage
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        fallback="/api/placeholder/200/128"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-0 transition-all duration-300" />
                    </div>

                    {/* Compact Category Content */}
                    <div className="p-2 sm:p-3">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1 group-hover:text-copper-600 transition-colors line-clamp-2">
                        {category.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {category.itemCount}+ items
                      </p>
                    </div>
                  </div>
                </SmartLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}