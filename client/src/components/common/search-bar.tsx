import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

export function SearchBar() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

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
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    if (value !== "all" && !searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set("category", value);
      setLocation(`/products?${params.toString()}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative" data-testid="search-bar-form">
      <div className="flex">
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger 
            className="w-36 rounded-r-none border-r-0 bg-gray-100"
            data-testid="select-category"
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
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 rounded-none border-l-0 border-r-0 focus:ring-0 focus:ring-offset-0"
          data-testid="input-search"
        />
        
        <Button 
          type="submit"
          className="rounded-l-none bg-copper-600 hover:bg-copper-700 text-white"
          data-testid="button-search"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
