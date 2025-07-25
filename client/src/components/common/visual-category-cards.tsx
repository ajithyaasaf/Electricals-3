import { Link } from "wouter";
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
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Shop by Department</h2>
          <p className="text-gray-600">Discover our comprehensive electrical product categories</p>
        </div>

        {/* Featured Categories - Large Cards */}
        {featuredCategories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredCategories.map((category) => (
              <Link
                key={category.slug}
                href={category.slug === "services" ? "/services" : `/products?category=${category.slug}`}
                className="group block"
              >
                <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                  {/* Category Image */}
                  <div className="relative h-48 overflow-hidden">
                    <LazyImage
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      fallback="/api/placeholder/400/200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300" />
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-white bg-opacity-90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-900">
                        {category.itemCount}+ Items
                      </span>
                    </div>
                  </div>

                  {/* Category Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-copper-600 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {category.description}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-copper-600 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 ml-4" />
                    </div>

                    <div className="text-copper-600 font-medium text-sm group-hover:text-copper-700 transition-colors">
                      Shop Now →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Regular Categories - Compact Grid */}
        {regularCategories.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {regularCategories.map((category) => (
              <Link
                key={category.slug}
                href={category.slug === "services" ? "/services" : `/products?category=${category.slug}`}
                className="group block"
              >
                <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                  {/* Compact Category Image */}
                  <div className="relative h-32 overflow-hidden">
                    <LazyImage
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      fallback="/api/placeholder/200/128"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-0 transition-all duration-300" />
                  </div>

                  {/* Compact Category Content */}
                  <div className="p-3">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-copper-600 transition-colors line-clamp-1">
                      {category.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {category.itemCount}+ items
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}