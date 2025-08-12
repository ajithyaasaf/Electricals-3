import { useState, useEffect, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BreadcrumbNavigation } from "@/components/navigation/breadcrumb-navigation";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductGridSkeleton } from "@/components/common/skeleton-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter, X } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDebounce } from "@/hooks/use-debounce";
import { SearchInput } from "@/components/common/search-input";
import { useProducts, useCategories } from "@/features/products/hooks/useProducts";
import { useEnterpriseNavigation } from "@/hooks/use-enterprise-navigation";
import type { ProductFilters } from "@/features/products/types";

export default function Products() {
  const searchParams = useSearch();
  const [, setLocation] = useLocation();
  const isMobile = useIsMobile();
  
  // Enable enterprise navigation features
  const { navigationState } = useEnterpriseNavigation();
  
  // Parse URL parameters
  const urlParams = new URLSearchParams(searchParams);
  const initialCategory = urlParams.get("category") || "";
  const initialSearch = urlParams.get("search") || "";
  const initialFeatured = urlParams.get("featured") === "true";
  
  // Filter state
  const [filters, setFilters] = useState<ProductFilters>({
    categoryId: initialCategory ? CATEGORIES.find(c => c.slug === initialCategory)?.id : undefined,
    search: initialSearch,
    featured: initialFeatured,
    minPrice: 0,
    maxPrice: 100000,
    sortBy: "newest",
    sortOrder: "desc"
  });

  // Debounce search and price inputs to reduce API calls
  const debouncedSearch = useDebounce(filters.search, 300);
  const debouncedMinPrice = useDebounce(filters.minPrice, 500);
  const debouncedMaxPrice = useDebounce(filters.maxPrice, 500);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const itemsPerPage = 20;

  // Fetch categories using custom hook
  const { data: categories = [] } = useCategories();

  // Completely isolated local state for price inputs to prevent re-renders
  const [localMinPrice, setLocalMinPrice] = useState(0);
  const [localMaxPrice, setLocalMaxPrice] = useState(100000);

  // Initialize local price state only once on mount
  useEffect(() => {
    setLocalMinPrice(filters.minPrice);
    setLocalMaxPrice(filters.maxPrice);
  }, []); // Empty dependency array - only run once

  // No need to sync debounced values with filter state - the query uses debounced values directly

  // Memoize query parameters to prevent unnecessary re-renders
  const queryParams = useMemo(() => ({
    categoryId: filters.categoryId,
    search: debouncedSearch, // Use debounced search
    featured: filters.featured,
    minPrice: debouncedMinPrice, // Use debounced price
    maxPrice: debouncedMaxPrice, // Use debounced price
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage
  }), [filters.categoryId, filters.featured, filters.sortBy, filters.sortOrder, debouncedSearch, debouncedMinPrice, debouncedMaxPrice, currentPage, itemsPerPage]);

  // Fetch products using custom hook
  const { data: productsData, isLoading } = useProducts(queryParams);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.search) params.set("search", filters.search);
    if (filters.categoryId) {
      const category = categories.find(c => c.id === filters.categoryId);
      if (category) params.set("category", category.slug);
    }
    if (filters.featured) params.set("featured", "true");
    
    const newUrl = `/products${params.toString() ? `?${params.toString()}` : ""}`;
    setLocation(newUrl, { replace: true });
  }, [filters, categories, setLocation]);

  const updateFilter = (key: string, value: any) => {
    // Store current scroll position to prevent jumping
    const scrollY = window.scrollY;
    
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    
    // Restore scroll position after a brief delay to allow DOM updates
    setTimeout(() => {
      window.scrollTo({ top: scrollY, behavior: 'instant' });
    }, 50);
  };

  const clearFilters = () => {
    setFilters({
      categoryId: undefined,
      search: "",
      featured: false,
      minPrice: 0,
      maxPrice: 100000,
      sortBy: "newest",
      sortOrder: "desc"
    });
    setCurrentPage(1);
  };

  const totalPages = Math.ceil((productsData?.total || 0) / itemsPerPage);

  // Get active filters count for better UX
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.categoryId) count++;
    if (filters.search) count++;
    if (filters.featured) count++;
    if (debouncedMinPrice > 0 || debouncedMaxPrice < 100000) count++;
    return count;
  }, [filters.categoryId, filters.search, filters.featured, debouncedMinPrice, debouncedMaxPrice]);

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">
              Active Filters ({activeFiltersCount})
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-copper-600 hover:text-copper-700 hover:bg-copper-50 h-auto p-1"
            >
              Clear all
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.categoryId && (
              <Badge variant="secondary" className="bg-copper-100 text-copper-800 hover:bg-copper-200">
                {categories.find(c => c.id === filters.categoryId)?.name}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilter("categoryId", undefined)}
                  className="ml-1 h-auto p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.search && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                Search: "{filters.search}"
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilter("search", "")}
                  className="ml-1 h-auto p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.featured && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                Featured Only
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilter("featured", false)}
                  className="ml-1 h-auto p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {(debouncedMinPrice > 0 || debouncedMaxPrice < 100000) && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                ₹{debouncedMinPrice.toLocaleString('en-IN')} - ₹{debouncedMaxPrice.toLocaleString('en-IN')}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLocalMinPrice(0);
                    setLocalMaxPrice(100000);
                  }}
                  className="ml-1 h-auto p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Categories */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          Categories
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => updateFilter("categoryId", undefined)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              !filters.categoryId 
                ? "bg-copper-100 text-copper-900 border-2 border-copper-300" 
                : "text-gray-700 hover:bg-gray-100 border-2 border-transparent"
            }`}
          >
            All Categories
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => updateFilter("categoryId", category.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filters.categoryId === category.id 
                  ? "bg-copper-100 text-copper-900 border-2 border-copper-300" 
                  : "text-gray-700 hover:bg-gray-100 border-2 border-transparent"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Range</h3>
        <div className="space-y-6">
          <div className="px-2">
            <Slider
              value={[localMinPrice, localMaxPrice]}
              onValueChange={([min, max]) => {
                setLocalMinPrice(min);
                setLocalMaxPrice(max);
                updateFilter("minPrice", min);
                updateFilter("maxPrice", max);
              }}
              max={100000}
              step={500}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm font-medium text-gray-900 bg-gray-50 rounded-lg p-3">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Minimum</div>
              <div>₹{(localMinPrice || 0).toLocaleString('en-IN')}</div>
            </div>
            <div className="text-gray-400">—</div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Maximum</div>
              <div>₹{(localMaxPrice || 100000).toLocaleString('en-IN')}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min price"
              value={localMinPrice === 0 ? "" : localMinPrice}
              onChange={(e) => {
                const rawValue = e.target.value;
                if (rawValue === "") {
                  setLocalMinPrice(0);
                } else {
                  const value = parseInt(rawValue);
                  if (!isNaN(value) && value >= 0) {
                    setLocalMinPrice(value);
                  }
                }
              }}
              className="text-sm"
            />
            <Input
              type="number"
              placeholder="Max price"
              value={localMaxPrice === 100000 ? "" : localMaxPrice}
              onChange={(e) => {
                const rawValue = e.target.value;
                if (rawValue === "") {
                  setLocalMaxPrice(100000);
                } else {
                  const value = parseInt(rawValue);
                  if (!isNaN(value) && value >= 0) {
                    setLocalMaxPrice(value);
                  }
                }
              }}
              className="text-sm"
            />
          </div>
        </div>
      </div>

      {/* Special Filters */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Filters</h3>
        <div className="space-y-3">
          <button
            onClick={() => updateFilter("featured", !filters.featured)}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between ${
              filters.featured 
                ? "bg-green-100 text-green-900 border-2 border-green-300" 
                : "text-gray-700 hover:bg-gray-100 border-2 border-transparent"
            }`}
          >
            <span>Featured Products</span>
            {filters.featured && (
              <Badge variant="secondary" className="bg-green-200 text-green-800 text-xs">
                Active
              </Badge>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Enterprise Breadcrumb Navigation */}
        <BreadcrumbNavigation />

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Electrical Products</h1>
          <p className="text-gray-600">
            Professional-grade electrical products for every project
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          {!isMobile && (
            <div className="lg:w-72 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
                  {activeFiltersCount > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="bg-copper-100 text-copper-800"
                    >
                      {activeFiltersCount} active
                    </Badge>
                  )}
                </div>
                <FilterContent />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Loading State Overlay */}
            {navigationState.isNavigating && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-copper-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading products...</p>
                </div>
              </div>
            )}
            
            {/* Enhanced Toolbar */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <div className="flex flex-col gap-4">
                {/* Top Row - Search and Results */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <SearchInput
                      placeholder="Search electrical products..."
                      value={filters.search}
                      onChange={(value) => updateFilter("search", value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">
                      {productsData?.total || 0} products found
                    </span>
                  </div>
                </div>

                {/* Bottom Row - Filters and Sort */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Mobile Filter Button */}
                  {isMobile && (
                    <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                      <SheetTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full sm:w-auto border-copper-200 hover:bg-copper-50 hover:border-copper-300"
                        >
                          <Filter className="w-4 h-4 mr-2" />
                          Filters
                          {activeFiltersCount > 0 && (
                            <Badge 
                              variant="secondary" 
                              className="ml-2 bg-copper-600 text-white hover:bg-copper-700 text-xs"
                            >
                              {activeFiltersCount}
                            </Badge>
                          )}
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="w-80 p-0">
                        <div className="p-6 h-full overflow-y-auto">
                          <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
                            {activeFiltersCount > 0 && (
                              <Badge 
                                variant="secondary" 
                                className="bg-copper-100 text-copper-800"
                              >
                                {activeFiltersCount} active
                              </Badge>
                            )}
                          </div>
                          <FilterContent />
                        </div>
                      </SheetContent>
                    </Sheet>
                  )}

                  {/* Active Filters Preview for Mobile */}
                  {isMobile && activeFiltersCount > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {filters.categoryId && (
                        <Badge variant="secondary" className="bg-copper-100 text-copper-800">
                          {categories.find(c => c.id === filters.categoryId)?.name}
                        </Badge>
                      )}
                      {filters.featured && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Featured
                        </Badge>
                      )}
                      {(debouncedMinPrice > 0 || debouncedMaxPrice < 100000) && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          Price Range
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Sort */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Sort by:</span>
                    <Select 
                      value={`${filters.sortBy}-${filters.sortOrder}`}
                      onValueChange={(value) => {
                        const [sortBy, sortOrder] = value.split("-");
                        updateFilter("sortBy", sortBy);
                        updateFilter("sortOrder", sortOrder);
                      }}
                    >
                      <SelectTrigger className="w-40 border-gray-200 focus:border-copper-300 focus:ring-copper-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest-desc">Newest First</SelectItem>
                        <SelectItem value="name-asc">Name A-Z</SelectItem>
                        <SelectItem value="name-desc">Name Z-A</SelectItem>
                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                        <SelectItem value="rating-desc">Highest Rated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              <div className="flex flex-wrap gap-2 mt-4">
                {filters.search && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: {filters.search}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => updateFilter("search", "")}
                    />
                  </Badge>
                )}
                {filters.categoryId && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {categories.find(c => c.id === filters.categoryId)?.name}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => updateFilter("categoryId", undefined)}
                    />
                  </Badge>
                )}
                {filters.featured && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Featured Only
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => updateFilter("featured", false)}
                    />
                  </Badge>
                )}
              </div>

              {/* Results Count */}
              <div className="mt-4 text-sm text-gray-600">
                {productsData && (
                  <span>
                    Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, productsData.total)} of {productsData.total} products
                  </span>
                )}
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <ProductGridSkeleton count={12} />
            ) : (
              <ProductGrid products={(productsData?.products || []) as any} showCategory />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => setCurrentPage(page)}
                          className="w-10"
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === currentPage - 3 || page === currentPage + 3) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}
                  
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
