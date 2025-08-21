// Simple Wishlist Grid - Clean display of wishlist items
import { useState } from 'react';
import { Search, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { WishlistItem } from './wishlist-item';
import { useWishlist } from '@/contexts/wishlist-context';

export function WishlistGrid() {
  const { items, loading } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter items based on search
  const filteredItems = items.filter(item => {
    if (!searchQuery) return true;
    
    const product = item.product;
    const service = item.service;
    const name = product?.name || service?.name || '';
    const description = product?.description || service?.description || '';
    
    const query = searchQuery.toLowerCase();
    return name.toLowerCase().includes(query) || 
           description.toLowerCase().includes(query);
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg aspect-[3/4]"></div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
        <p className="text-gray-500">
          Start adding items to your wishlist to keep track of products and services you love.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search wishlist..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No items match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredItems.map((item) => (
            <WishlistItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}