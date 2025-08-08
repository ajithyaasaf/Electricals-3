import { useState, useEffect, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
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
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import type { ProductFilters } from "@/features/products/types";

export default function Products() {
  const searchParams = useSearch();
  const [, setLocation] = useLocation();
  const isMobile = useIsMobile();
  
  // Enable scroll restoration for category navigation
  useScrollRestoration();
  
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

  // Debounce search to reduce API calls
  const debouncedSearch = useDebounce(filters.search, 300);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const itemsPerPage = 20;

  // Fetch categories using custom hook
  const { data: categories = [] } = useCategories();

  // Memoize query parameters to prevent unnecessary re-renders
  const queryParams = useMemo(() => ({
    ...filters,
    search: debouncedSearch, // Use debounced search
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage
  }), [filters, debouncedSearch, currentPage, itemsPerPage]);

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
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
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

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="all-categories"
              checked={!filters.categoryId}
              onCheckedChange={() => updateFilter("categoryId", undefined)}
            />
            <label htmlFor="all-categories" className="text-sm text-gray-700">All Categories</label>
          </div>
          {categories.map(category => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`category-${category.id}`}
                checked={filters.categoryId === category.id}
                onCheckedChange={() => 
                  updateFilter("categoryId", filters.categoryId === category.id ? undefined : category.id)
                }
              />
              <label htmlFor={`category-${category.id}`} className="text-sm text-gray-700">
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
        <div className="space-y-4">
          <div>
            <Slider
              value={[filters.minPrice, filters.maxPrice]}
              onValueChange={([min, max]) => {
                updateFilter("minPrice", min);
                updateFilter("maxPrice", max);
              }}
              max={100000}
              step={500}
              className="w-full"
            />
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>₹{filters.minPrice.toLocaleString('en-IN')}</span>
            <span>-</span>
            <span>₹{filters.maxPrice.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="featured"
            checked={filters.featured}
            onCheckedChange={(checked) => updateFilter("featured", checked)}
          />
          <label htmlFor="featured" className="text-sm font-medium text-gray-900">
            Featured Products Only
          </label>
        </div>
      </div>

      {/* Clear Filters */}
      <Button variant="outline" onClick={clearFilters} className="w-full">
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-6">
          <span>Home</span> / <span className="text-gray-900">Products</span>
        </nav>

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
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg p-6 sticky top-24">
                <h2 className="font-semibold text-gray-900 mb-4">Filters</h2>
                <FilterContent />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-lg p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Mobile Filter Button */}
                {isMobile && (
                  <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="w-full sm:w-auto">
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80">
                      <div className="py-6">
                        <h2 className="font-semibold text-gray-900 mb-4">Filters</h2>
                        <FilterContent />
                      </div>
                    </SheetContent>
                  </Sheet>
                )}

                {/* Search */}
                <div className="flex-1 max-w-md">
                  <SearchInput
                    placeholder="Search products..."
                    value={filters.search}
                    onChange={(value) => updateFilter("search", value)}
                  />
                </div>

                {/* Sort */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <Select 
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onValueChange={(value) => {
                      const [sortBy, sortOrder] = value.split("-");
                      updateFilter("sortBy", sortBy);
                      updateFilter("sortOrder", sortOrder);
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest-desc">Newest</SelectItem>
                      <SelectItem value="name-asc">Name A-Z</SelectItem>
                      <SelectItem value="name-desc">Name Z-A</SelectItem>
                      <SelectItem value="price-asc">Price Low-High</SelectItem>
                      <SelectItem value="price-desc">Price High-Low</SelectItem>
                      <SelectItem value="rating-desc">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>
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
              <ProductGrid products={productsData?.products || []} showCategory />
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
