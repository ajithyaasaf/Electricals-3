import { useState, useEffect, useRef } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { formatPrice } from "@/lib/currency";

interface Product {
  id: string;
  name: string;
  slug?: string;
  price: number;
  imageUrls?: string[];
  image?: string;
  category: string;
}

export function SearchBar() {
  const [, setLocation] = useLocation();
  const searchParams = useSearch();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Sync state with URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(searchParams);
    const urlCategory = urlParams.get("category") || "all";
    const urlSearch = urlParams.get("search") || "";
    
    setSelectedCategory(urlCategory);
    setSearchQuery(urlSearch);
  }, [searchParams]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch search suggestions
  const { data: searchResponse, isLoading } = useQuery<{ products: Product[] }>({
    queryKey: ['/api/products', { search: searchQuery, limit: 6 }],
    enabled: searchQuery.trim().length > 1 && showSuggestions,
  });

  const suggestions = searchResponse?.products || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }
    
    if (selectedCategory !== "all") {
      params.set("category", selectedCategory);
    }

    const queryString = params.toString();
    setLocation(queryString ? `/products?${queryString}` : '/products');
    setShowSuggestions(false);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }
    
    if (value !== "all") {
      params.set("category", value);
    }
    
    const queryString = params.toString();
    setLocation(queryString ? `/products?${queryString}` : '/products');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(e.target.value.trim().length > 1);
  };

  const handleSuggestionClick = (product: Product) => {
    setLocation(`/products/${product.slug || product.id}`);
    setShowSuggestions(false);
    setSearchQuery("");
  };

  return (
    <div ref={searchRef} className="relative w-full" data-testid="search-bar-container">
      <form onSubmit={handleSearch} className="relative" data-testid="search-bar-form">
        <div className="flex">
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger 
              className="w-36 rounded-r-none border-r-0 bg-gray-100"
              data-testid="select-category"
              aria-label="Select product category"
            >
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Electrical</SelectItem>
              {CATEGORIES.map((category) => (
                <SelectItem 
                  key={category.slug} 
                  value={category.slug}
                  data-testid={`category-option-${category.slug}`}
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Input
            type="text"
            placeholder="Search electrical products..."
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => searchQuery.trim().length > 1 && setShowSuggestions(true)}
            className="flex-1 rounded-none border-l-0 border-r-0 focus:ring-0 focus:ring-offset-0"
            data-testid="input-search"
          />
          
          <Button 
            type="submit"
            className="rounded-l-none bg-teal-600 hover:bg-teal-700 text-white"
            data-testid="button-search"
            aria-label="Search products"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Instant Search Suggestions Dropdown */}
      {showSuggestions && searchQuery.trim().length > 1 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-[9999] max-h-96 overflow-y-auto scrollbar-modern">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-teal-600" />
              <p className="text-sm">Searching electrical products...</p>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-2">
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <span>Matching Products ({suggestions.length})</span>
                <span className="text-[10px] text-teal-600 font-normal">Press Enter to view all</span>
              </div>
              {suggestions.map((product) => {
                const img = product.imageUrls?.[0] || product.image || "/placeholder.png";

                return (
                  <button
                    key={product.id}
                    onClick={() => handleSuggestionClick(product)}
                    className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-teal-50/60 transition-colors text-left border-b border-gray-50 last:border-0"
                    data-testid={`suggestion-${product.id}`}
                  >
                    <img 
                      src={img} 
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded border border-gray-200 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {product.category}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-teal-700 flex-shrink-0">
                      {formatPrice(product.price)}
                    </p>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <Search className="h-6 w-6 mx-auto mb-2 opacity-30 text-gray-400" />
              <p className="text-sm">No electrical products found for "{searchQuery}"</p>
              <Button
                onClick={handleSearch}
                variant="outline"
                size="sm"
                className="mt-3 text-teal-700 border-teal-200 hover:bg-teal-50"
              >
                Browse all products
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
