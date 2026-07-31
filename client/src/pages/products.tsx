import { useState, useEffect, useMemo, useRef, useCallback, memo } from "react";
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
import { CATEGORIES, MAX_PRODUCT_PRICE } from "@/lib/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDebounce } from "@/hooks/use-debounce";
import { SearchInput } from "@/components/common/search-input";
import { useProducts, useCategories } from "@/features/products/hooks/useProducts";
import { ELECTRICAL_CATEGORIES } from "@shared/data/categories";
import { useEnterpriseNavigation } from "@/hooks/use-enterprise-navigation";
import { useSEO, useCategorySEO } from "@/hooks/use-seo";
import type { ProductFilters } from "@/features/products/types";

// Minimal isolated inputs with debugging - moved outside main component
const PriceInputs = ({
  minPrice,
  maxPrice,
  onMinChange,
  onMaxChange,
  maxLimit
}: {
  minPrice: number;
  maxPrice: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  maxLimit: number;
}) => {
  // Local state for inputs to allow typing freely
  const [minStr, setMinStr] = useState(minPrice.toString());
  const [maxStr, setMaxStr] = useState(maxPrice.toString());

  // Sync local state when props change (e.g. from slider)
  // We only sync if the values are different to avoid cursor jumps if we were syncing on change
  // But since we sync on blur/enter for the parent, this effect mainly handles slider updates
  useEffect(() => {
    setMinStr(minPrice.toString());
  }, [minPrice]);

  useEffect(() => {
    setMaxStr(maxPrice.toString());
  }, [maxPrice]);

  const handleMinCommit = () => {
    let val = parseInt(minStr);
    if (isNaN(val)) val = 0;

    // Clamping
    if (val < 0) val = 0;
    if (val > maxLimit) val = maxLimit;

    // Cross-over check: Min cannot be greater than current Max
    if (val > maxPrice) {
      val = maxPrice;
    }

    setMinStr(val.toString());
    onMinChange(val);
  };

  const handleMaxCommit = () => {
    let val = parseInt(maxStr);
    if (isNaN(val)) val = maxLimit;

    // Clamping
    if (val < 0) val = 0;
    if (val > maxLimit) val = maxLimit;

    // Cross-over check: Max cannot be less than current Min
    if (val < minPrice) {
      val = minPrice;
    }

    setMaxStr(val.toString());
    onMaxChange(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent, commitFn: () => void) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.currentTarget as HTMLInputElement).blur(); // Triggers onBlur which calls commitFn
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1">
        <label className="text-xs text-gray-500 font-medium ml-1">Minimum</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
          <Input
            type="number"
            value={minStr}
            onChange={(e) => setMinStr(e.target.value)}
            onBlur={handleMinCommit}
            onKeyDown={(e) => handleKeyDown(e, handleMinCommit)}
            className="pl-7 text-sm"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs text-gray-500 font-medium ml-1">Maximum</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
          <Input
            type="number"
            value={maxStr}
            onChange={(e) => setMaxStr(e.target.value)}
            onBlur={handleMaxCommit}
            onKeyDown={(e) => handleKeyDown(e, handleMaxCommit)}
            className="pl-7 text-sm"
          />
        </div>
      </div>
    </div>
  );
};

// FilterContent component moved outside to prevent recreation on every render
const FilterContent = ({
  filters,
  categories,
  activeFiltersCount,
  debouncedMinPrice,
  debouncedMaxPrice,
  updateFilter,
  clearFilters,
  setMinPriceString,
  setMaxPriceString,
  minPriceNumber,
  maxPriceNumber
}: {
  filters: any;
  categories: any[];
  activeFiltersCount: number;
  debouncedMinPrice: number;
  debouncedMaxPrice: number;
  updateFilter: (key: string, value: any) => void;
  clearFilters: () => void;
  setMinPriceString: (value: string) => void;
  setMaxPriceString: (value: string) => void;
  minPriceNumber: number;
  maxPriceNumber: number;
}) => (
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
            <Badge variant="secondary" className="bg-copper-100 text-copper-800 hover:bg-copper-200 inline-flex items-center gap-1">
              {categories.find(c => c.id === filters.categoryId)?.name}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  updateFilter("categoryId", undefined);
                }}
                className="ml-1 hover:bg-copper-300 rounded-full p-0.5 transition-colors"
                data-testid="button-remove-category-filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.search && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 inline-flex items-center gap-1">
              Search: "{filters.search}"
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  updateFilter("search", "");
                }}
                className="ml-1 hover:bg-blue-300 rounded-full p-0.5 transition-colors"
                data-testid="button-remove-search-filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.featured && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 inline-flex items-center gap-1">
              Featured Only
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  updateFilter("featured", false);
                }}
                className="ml-1 hover:bg-green-300 rounded-full p-0.5 transition-colors"
                data-testid="button-remove-featured-filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {(debouncedMinPrice > 0 || debouncedMaxPrice < MAX_PRODUCT_PRICE) && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200 inline-flex items-center gap-1">
              ₹{debouncedMinPrice.toLocaleString('en-IN')} - ₹{debouncedMaxPrice.toLocaleString('en-IN')}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMinPriceString("");
                  setMaxPriceString("");
                }}
                className="ml-1 hover:bg-purple-300 rounded-full p-0.5 transition-colors"
                data-testid="button-remove-price-filter"
              >
                <X className="h-3 w-3" />
              </button>
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
          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${!filters.categoryId
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
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filters.categoryId === category.id
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
            value={[minPriceNumber, maxPriceNumber]}
            onValueChange={([min, max]) => {
              setMinPriceString(min.toString());
              setMaxPriceString(max.toString());
            }}
            max={MAX_PRODUCT_PRICE}
            step={500}
            className="w-full"
          />
        </div>
        <PriceInputs
          minPrice={minPriceNumber}
          maxPrice={maxPriceNumber}
          onMinChange={(val) => setMinPriceString(val.toString())}
          onMaxChange={(val) => setMaxPriceString(val.toString())}
          maxLimit={MAX_PRODUCT_PRICE}
        />
      </div>
    </div>

    {/* Special Filters */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Filters</h3>
      <div className="space-y-3">
        <button
          onClick={() => updateFilter("featured", !filters.featured)}
          className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between ${filters.featured
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

// Add display name for debugging
PriceInputs.displayName = 'PriceInputs';

export default function Products() {
  const searchParams = useSearch();
  const [, setLocation] = useLocation();
  const isMobile = useIsMobile();

  // Enable enterprise navigation features
  const { navigationState } = useEnterpriseNavigation();

  // Enterprise Single Source of Truth (SSoT) URL state management
  const searchUrlParams = useMemo(() => new URLSearchParams(searchParams), [searchParams]);

  const urlCategory = searchUrlParams.get("category") || "";
  const urlSearch = searchUrlParams.get("search") || "";
  const urlFeatured = searchUrlParams.get("featured") === "true";
  const urlSortBy = searchUrlParams.get("sortBy") || "featured";
  const urlSortOrder = searchUrlParams.get("sortOrder") || "desc";
  const urlPage = searchUrlParams.get("page") ? parseInt(searchUrlParams.get("page")!) || 1 : 1;

  // SEO optimization for products page
  useSEO();

  // Fetch categories using custom hook
  const { data: rawCategories = [] } = useCategories();
  const categories = useMemo(() => {
    if (Array.isArray(rawCategories) && rawCategories.length > 0) {
      return rawCategories;
    }
    return ELECTRICAL_CATEGORIES;
  }, [rawCategories]);

  // Derive current category object and ID directly from URL
  const currentCategoryObj = useMemo(() => {
    if (!urlCategory) return null;
    return categories.find((c: any) => c.slug === urlCategory || c.id === urlCategory) || null;
  }, [urlCategory, categories]);

  const categoryId = currentCategoryObj?.id || (urlCategory ? urlCategory : undefined);

  // Price filter input strings
  const [minPriceString, setMinPriceString] = useState("");
  const [maxPriceString, setMaxPriceString] = useState("");

  const minPriceNumber = minPriceString === "" ? 0 : parseInt(minPriceString) || 0;
  const maxPriceNumber = maxPriceString === "" ? MAX_PRODUCT_PRICE : parseInt(maxPriceString) || MAX_PRODUCT_PRICE;

  const itemsPerPage = 20;

  // Debounce search and price inputs to prevent excessive API hits
  const debouncedSearch = useDebounce(urlSearch, 300);
  const debouncedMinPrice = useDebounce(minPriceNumber, 500);
  const debouncedMaxPrice = useDebounce(maxPriceNumber, 500);

  // Derived filter object for UI components
  const filters = useMemo(() => ({
    categoryId,
    categorySlug: urlCategory,
    search: urlSearch,
    featured: urlFeatured,
    minPrice: minPriceNumber,
    maxPrice: maxPriceNumber,
    sortBy: urlSortBy,
    sortOrder: urlSortOrder
  }), [categoryId, urlCategory, urlSearch, urlFeatured, minPriceNumber, maxPriceNumber, urlSortBy, urlSortOrder]);

  // Memoize query parameters for TanStack Query
  const queryParams = useMemo(() => ({
    categoryId,
    category: urlCategory || undefined,
    search: debouncedSearch,
    featured: urlFeatured,
    minPrice: debouncedMinPrice * 100,
    maxPrice: debouncedMaxPrice * 100,
    sortBy: urlSortBy,
    sortOrder: urlSortOrder,
    limit: itemsPerPage,
    offset: (urlPage - 1) * itemsPerPage
  }), [categoryId, urlCategory, debouncedSearch, urlFeatured, debouncedMinPrice, debouncedMaxPrice, urlSortBy, urlSortOrder, urlPage]);

  // Fetch products with TanStack Query
  const { data: productsData, isLoading, isFetching } = useProducts(queryParams);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Clean, unified URL filter update handler
  const updateFilter = useCallback((key: string | Record<string, any>, value?: any) => {
    const params = new URLSearchParams(window.location.search);

    const applySingle = (k: string, v: any) => {
      if (k === "categoryId") {
        if (!v) {
          params.delete("category");
        } else {
          const catObj = categories.find((c: any) => c.id === v || c.slug === v);
          params.set("category", catObj ? catObj.slug : String(v));
        }
      } else if (v === undefined || v === null || v === "" || v === false) {
        params.delete(k);
      } else {
        params.set(k, String(v));
      }
    };

    if (typeof key === "object" && key !== null) {
      Object.entries(key).forEach(([k, v]) => applySingle(k, v));
      params.delete("page");
    } else {
      applySingle(key as string, value);
      if (key !== "page") {
        params.delete("page");
      }
    }

    const newQuery = params.toString();
    setLocation(`/products${newQuery ? `?${newQuery}` : ''}`);
  }, [categories, setLocation]);

  const clearFilters = useCallback(() => {
    setMinPriceString("");
    setMaxPriceString("");
    setLocation('/products');
  }, [setLocation]);

  const totalPages = Math.ceil((productsData?.total || 0) / itemsPerPage);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (urlCategory) count++;
    if (urlSearch) count++;
    if (urlFeatured) count++;
    if (debouncedMinPrice > 0 || debouncedMaxPrice < MAX_PRODUCT_PRICE) count++;
    return count;
  }, [urlCategory, urlSearch, urlFeatured, debouncedMinPrice, debouncedMaxPrice]);



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
              <div className="bg-white rounded-lg shadow-sm border sticky top-24 overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 7rem)' }}>
                {/* Fixed Header */}
                <div className="flex items-center justify-between p-6 pb-4 border-b bg-white">
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

                {/* Scrollable Filter Content */}
                <div className="overflow-y-auto overflow-x-hidden p-6 pt-4 flex-1 scrollbar-modern">
                  <FilterContent
                    filters={filters}
                    categories={categories}
                    activeFiltersCount={activeFiltersCount}
                    debouncedMinPrice={debouncedMinPrice}
                    debouncedMaxPrice={debouncedMaxPrice}
                    updateFilter={updateFilter}
                    clearFilters={clearFilters}
                    setMinPriceString={setMinPriceString}
                    setMaxPriceString={setMaxPriceString}
                    minPriceNumber={minPriceNumber}
                    maxPriceNumber={maxPriceNumber}
                  />
                </div>
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
                          <FilterContent
                            filters={filters}
                            categories={categories}
                            activeFiltersCount={activeFiltersCount}
                            debouncedMinPrice={debouncedMinPrice}
                            debouncedMaxPrice={debouncedMaxPrice}
                            updateFilter={updateFilter}
                            clearFilters={clearFilters}
                            setMinPriceString={setMinPriceString}
                            setMaxPriceString={setMaxPriceString}
                            minPriceNumber={minPriceNumber}
                            maxPriceNumber={maxPriceNumber}
                          />
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
                      {(debouncedMinPrice > 0 || debouncedMaxPrice < MAX_PRODUCT_PRICE) && (
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
                        updateFilter({ sortBy, sortOrder });
                      }}
                    >
                      <SelectTrigger className="w-40 border-gray-200 focus:border-copper-300 focus:ring-copper-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="featured-desc">Featured</SelectItem>
                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                        <SelectItem value="rating-desc">Good Customer Reviews</SelectItem>
                        <SelectItem value="newest-desc">Newest Arrivals</SelectItem>
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
                    Showing {((urlPage - 1) * itemsPerPage) + 1}-{Math.min(urlPage * itemsPerPage, productsData.total)} of {productsData.total} products
                  </span>
                )}
              </div>
            </div>

            {/* Products Grid */}
            {isLoading || isFetching ? (
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
                    disabled={urlPage === 1}
                    onClick={() => {
                      updateFilter("page", urlPage - 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Previous
                  </Button>

                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (page === 1 || page === totalPages || (page >= urlPage - 2 && page <= urlPage + 2)) {
                      return (
                        <Button
                          key={page}
                          variant={urlPage === page ? "default" : "outline"}
                          onClick={() => {
                            updateFilter("page", page);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="w-10"
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === urlPage - 3 || page === urlPage + 3) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}

                  <Button
                    variant="outline"
                    disabled={urlPage === totalPages}
                    onClick={() => {
                      updateFilter("page", urlPage + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
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
    </div >
  );
}
