import { useState, useEffect, useRef } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrls: string[];
  categoryId: string | null;
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
  const { data: suggestions, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', { search: searchQuery, limit: 5 }],
    enabled: searchQuery.length > 2 && showSuggestions,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.set("search", searchQuery);
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
    
    // Add search query if present
    if (searchQuery.trim()) {
      params.set("search", searchQuery);
    }
    
    // Add category if not "all"
    if (value !== "all") {
      params.set("category", value);
    }
    
    const queryString = params.toString();
    setLocation(queryString ? `/products?${queryString}` : '/products');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(e.target.value.length > 2);
  };

  const handleSuggestionClick = (product: Product) => {
    setLocation(`/products/${product.id}`);
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
            placeholder="Search electrical products and services..."
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => searchQuery.length > 2 && setShowSuggestions(true)}
            className="flex-1 rounded-none border-l-0 border-r-0 focus:ring-0 focus:ring-offset-0"
            data-testid="input-search"
          />
          
          <Button 
            type="submit"
            className="rounded-l-none bg-copper-600 hover:bg-copper-700 text-white"
            data-testid="button-search"
            aria-label="Search products"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && searchQuery.length > 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto scrollbar-modern">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
              <p className="text-sm">Searching products...</p>
            </div>
          ) : suggestions && suggestions.length > 0 ? (
            <div className="py-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Suggested Products
              </div>
              {suggestions.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSuggestionClick(product)}
                  className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                  data-testid={`suggestion-${product.id}`}
                >
                  {product.imageUrls && product.imageUrls.length > 0 ? (
                    <img 
                      src={product.imageUrls[0]} 
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded border border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                      <Search className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-copper-600">
                    ₹{product.price.toLocaleString('en-IN')}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No products found for "{searchQuery}"</p>
              <Button
                onClick={handleSearch}
                variant="outline"
                size="sm"
                className="mt-3"
              >
                Search all products
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
