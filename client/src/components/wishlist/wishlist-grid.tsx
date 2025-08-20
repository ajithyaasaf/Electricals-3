// Wishlist Grid Component - Display wishlist items in a grid layout
import { useState } from 'react';
import { Heart, Filter, SortAsc, Grid, List, Search, Package, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { WishlistItem } from './wishlist-item';
import { useWishlist } from '@/contexts/wishlist-context';
import type { WishlistItemWithDetails } from '@shared/wishlist-types';
import { cn } from '@/lib/utils';

// Format currency in INR
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface WishlistGridProps {
  className?: string;
}

type SortOption = 'newest' | 'oldest' | 'price-high' | 'price-low' | 'name' | 'priority';
type FilterOption = 'all' | 'products' | 'services' | 'on-sale' | 'in-stock' | 'high-priority';
type ViewMode = 'grid' | 'list';

export function WishlistGrid({ className }: WishlistGridProps) {
  const { items, loading, totalItems, totalValue, analytics } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Filter items based on search and filter criteria
  const filteredItems = items.filter(item => {
    const product = item.product;
    const service = item.service;
    const name = product?.name || service?.name || '';
    const description = product?.description || service?.description || '';
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        name.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query) ||
        item.notes?.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query));
      
      if (!matchesSearch) return false;
    }
    
    // Category filter
    switch (filterBy) {
      case 'products':
        return !!product;
      case 'services':
        return !!service;
      case 'on-sale':
        return item.isOnSale === true;
      case 'in-stock':
        return item.stockStatus === 'in_stock';
      case 'high-priority':
        return item.priority === 'high';
      default:
        return true;
    }
  });
  
  // Sort filtered items
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'price-high':
        return (b.currentPrice || 0) - (a.currentPrice || 0);
      case 'price-low':
        return (a.currentPrice || 0) - (b.currentPrice || 0);
      case 'name':
        const aName = a.product?.name || a.service?.name || '';
        const bName = b.product?.name || b.service?.name || '';
        return aName.localeCompare(bName);
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      default:
        return 0;
    }
  });
  
  const getFilterCount = (filter: FilterOption): number => {
    return items.filter(item => {
      switch (filter) {
        case 'products': return !!item.product;
        case 'services': return !!item.service;
        case 'on-sale': return item.isOnSale === true;
        case 'in-stock': return item.stockStatus === 'in_stock';
        case 'high-priority': return item.priority === 'high';
        default: return true;
      }
    }).length;
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        {/* Loading skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
        <p className="text-gray-500 mb-6">
          Start adding items to your wishlist to keep track of products and services you love.
        </p>
        <Button onClick={() => window.location.href = '/products'}>
          <Package className="h-4 w-4 mr-2" />
          Browse Products
        </Button>
      </div>
    );
  }
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Wishlist</h2>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
            <span>{totalItems} items</span>
            <span>•</span>
            <span>Total value: ₹{totalValue.toLocaleString()}</span>
            {analytics && (
              <>
                <span>•</span>
                <span>{analytics.addedThisWeek} added this week</span>
              </>
            )}
          </div>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            data-testid="view-grid"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            data-testid="view-list"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search your wishlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="wishlist-search"
            />
          </div>
        </div>
        
        {/* Filter */}
        <Select value={filterBy} onValueChange={(value) => setFilterBy(value as FilterOption)}>
          <SelectTrigger className="w-48" data-testid="wishlist-filter">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items ({items.length})</SelectItem>
            <SelectItem value="products">Products ({getFilterCount('products')})</SelectItem>
            <SelectItem value="services">Services ({getFilterCount('services')})</SelectItem>
            <SelectItem value="on-sale">On Sale ({getFilterCount('on-sale')})</SelectItem>
            <SelectItem value="in-stock">In Stock ({getFilterCount('in-stock')})</SelectItem>
            <SelectItem value="high-priority">High Priority ({getFilterCount('high-priority')})</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Sort */}
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="w-48" data-testid="wishlist-sort">
            <SortAsc className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Filter Tabs */}
      <Tabs value={filterBy} onValueChange={(value) => setFilterBy(value as FilterOption)} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all" className="text-xs">
            All
          </TabsTrigger>
          <TabsTrigger value="products" className="text-xs">
            <Package className="h-3 w-3 mr-1" />
            Products
          </TabsTrigger>
          <TabsTrigger value="services" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            Services
          </TabsTrigger>
          <TabsTrigger value="on-sale" className="text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />
            Sale
          </TabsTrigger>
          <TabsTrigger value="in-stock" className="text-xs">
            In Stock
          </TabsTrigger>
          <TabsTrigger value="high-priority" className="text-xs">
            Priority
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Results Info */}
      {filteredItems.length !== items.length && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Showing {filteredItems.length} of {items.length} items</span>
          {searchQuery && (
            <Badge variant="secondary">
              Search: "{searchQuery}"
            </Badge>
          )}
          {filterBy !== 'all' && (
            <Badge variant="secondary">
              Filter: {filterBy.replace('-', ' ')}
            </Badge>
          )}
        </div>
      )}
      
      {/* Items Grid/List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500">
            No items match your current filters.
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setFilterBy('all');
            }}
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          )}
          data-testid="wishlist-items-container"
        >
          {sortedItems.map((item) => (
            <WishlistItem
              key={item.id}
              item={item}
              compact={viewMode === 'list'}
              showControls={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}