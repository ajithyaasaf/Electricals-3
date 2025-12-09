import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ServiceCard } from "@/components/service/service-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter, X, Wrench, ClipboardCheck, Tag, Clock, Shield, Phone } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Services() {
  const searchParams = useSearch();
  const [, setLocation] = useLocation();
  const isMobile = useIsMobile();
  
  // Parse URL parameters
  const urlParams = new URLSearchParams(searchParams);
  const initialCategory = urlParams.get("category") || "";
  const initialSearch = urlParams.get("search") || "";
  
  // Filter state
  const [filters, setFilters] = useState({
    categoryId: initialCategory ? CATEGORIES.find(c => c.slug === initialCategory)?.id : undefined,
    search: initialSearch,
    sortBy: "newest" as "name" | "price" | "rating" | "newest",
    sortOrder: "desc" as "asc" | "desc"
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const itemsPerPage = 12;

  // Fetch categories (filter to service categories)
  const { data: allCategories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const serviceCategories = allCategories.filter(cat => 
    cat.slug.includes("services") || cat.slug.includes("consulting") || cat.slug.includes("maintenance")
  );

  // Fetch services
  const { data: servicesData, isLoading } = useQuery({
    queryKey: ["/api/services", {
      ...filters,
      limit: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage
    }],
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.search) params.set("search", filters.search);
    if (filters.categoryId) {
      const category = serviceCategories.find(c => c.id === filters.categoryId);
      if (category) params.set("category", category.slug);
    }
    
    const newUrl = `/services${params.toString() ? `?${params.toString()}` : ""}`;
    setLocation(newUrl, { replace: true });
  }, [filters, serviceCategories, setLocation]);

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      categoryId: undefined,
      search: "",
      sortBy: "newest",
      sortOrder: "desc"
    });
    setCurrentPage(1);
  };

  const totalPages = Math.ceil((servicesData?.total || 0) / itemsPerPage);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Service Categories</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="all-services"
              checked={!filters.categoryId}
              onCheckedChange={() => updateFilter("categoryId", undefined)}
            />
            <label htmlFor="all-services" className="text-sm text-gray-700">All Services</label>
          </div>
          {serviceCategories.map(category => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`service-category-${category.id}`}
                checked={filters.categoryId === category.id}
                onCheckedChange={() => 
                  updateFilter("categoryId", filters.categoryId === category.id ? undefined : category.id)
                }
              />
              <label htmlFor={`service-category-${category.id}`} className="text-sm text-gray-700">
                {category.name}
              </label>
            </div>
          ))}
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
          <span>Home</span> / <span className="text-gray-900">Services</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Professional Electrical Services</h1>
          <p className="text-gray-600">
            Licensed electricians providing comprehensive electrical services for residential and commercial properties
          </p>
        </div>

        {/* Service Features Banner */}
        <div className="bg-gradient-to-r from-copper-50 to-lime-50 rounded-xl p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-copper-100 rounded-full flex items-center justify-center mb-3">
                <Tag className="text-copper-600 text-lg" />
              </div>
              <h5 className="font-semibold text-gray-900 mb-1">Licensed & Insured</h5>
              <p className="text-sm text-gray-600">All our electricians are fully licensed and insured professionals</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-lime-100 rounded-full flex items-center justify-center mb-3">
                <Clock className="text-lime-600 text-lg" />
              </div>
              <h5 className="font-semibold text-gray-900 mb-1">Same-Day Service</h5>
              <p className="text-sm text-gray-600">Available for most electrical repairs and installations</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Shield className="text-green-600 text-lg" />
              </div>
              <h5 className="font-semibold text-gray-900 mb-1">Warranty Included</h5>
              <p className="text-sm text-gray-600">All work comes with our comprehensive warranty protection</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                <Phone className="text-orange-600 text-lg" />
              </div>
              <h5 className="font-semibold text-gray-900 mb-1">24/7 Support</h5>
              <p className="text-sm text-gray-600">Round-the-clock customer support for your electrical needs</p>
            </div>
          </div>
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
                  <Input
                    placeholder="Search services..."
                    value={filters.search}
                    onChange={(e) => updateFilter("search", e.target.value)}
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
                    {serviceCategories.find(c => c.id === filters.categoryId)?.name}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => updateFilter("categoryId", undefined)}
                    />
                  </Badge>
                )}
              </div>

              {/* Results Count */}
              <div className="mt-4 text-sm text-gray-600">
                {servicesData && (
                  <span>
                    Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, servicesData.total)} of {servicesData.total} services
                  </span>
                )}
              </div>
            </div>

            {/* Services Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl p-6">
                    <Skeleton className="w-full h-32 mb-4" />
                    <Skeleton className="w-3/4 h-6 mb-3" />
                    <Skeleton className="w-full h-4 mb-2" />
                    <Skeleton className="w-full h-4 mb-4" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="w-24 h-6" />
                      <Skeleton className="w-32 h-10" />
                    </div>
                  </div>
                ))}
              </div>
            ) : servicesData?.services && servicesData.services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {servicesData.services.map((service) => (
                  <ServiceCard key={service.id} service={service} showCategory />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
              </div>
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
