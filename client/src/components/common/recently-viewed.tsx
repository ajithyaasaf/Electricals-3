import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { HorizontalProductSection } from "./horizontal-product-section";

interface StoredRecentlyViewedItem {
  id: string;
  name?: string;
  price?: number;
  image?: string;
  slug?: string;
  category?: string;
  viewedAt: number;
}

export function RecentlyViewed() {
  const [storedItems, setStoredItems] = useState<StoredRecentlyViewedItem[]>([]);

  // Fetch live products to validate existence and get current pricing/images
  const { data: productsData, isLoading } = useQuery<{ products: any[] }>({
    queryKey: ["/api/products", { limit: 100 }],
    staleTime: 60 * 1000, // 1 minute fresh cache
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('copperbear_recently_viewed');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setStoredItems(parsed.sort((a, b) => (b.viewedAt || 0) - (a.viewedAt || 0)));
        }
      }
    } catch (error) {
      console.error('Error loading recently viewed items:', error);
    }
  }, []);

  // Filter against live products and enrich with live data
  const validatedProducts = useMemo(() => {
    if (storedItems.length === 0) return [];

    // If live products are loaded, validate against them
    const liveProducts = productsData?.products;
    if (!liveProducts) {
      return [];
    }

    const liveProductsMap = new Map<string, any>();
    for (const p of liveProducts) {
      if (p.id) liveProductsMap.set(p.id, p);
    }

    const validList: any[] = [];
    const validStoredToKeep: StoredRecentlyViewedItem[] = [];

    for (const item of storedItems) {
      const liveProduct = liveProductsMap.get(item.id);
      if (liveProduct) {
        validStoredToKeep.push(item);
        validList.push({
          id: liveProduct.id,
          name: liveProduct.name,
          price: liveProduct.price,
          originalPrice: liveProduct.originalPrice,
          image: liveProduct.imageUrls?.[0] || liveProduct.image || item.image,
          imageUrls: liveProduct.imageUrls,
          slug: liveProduct.slug || item.slug,
          category: liveProduct.category || item.category,
          rating: liveProduct.rating,
        });
      }
    }

    // If any deleted/invalid products were found in localStorage, purge them
    if (validStoredToKeep.length !== storedItems.length) {
      try {
        localStorage.setItem('copperbear_recently_viewed', JSON.stringify(validStoredToKeep));
      } catch (e) {
        console.error('Failed to sync cleaned recently viewed items to localStorage', e);
      }
    }

    return validList.slice(0, 12);
  }, [storedItems, productsData]);

  if (isLoading || validatedProducts.length === 0) {
    return null;
  }

  return (
    <HorizontalProductSection
      title="Your Recently Viewed Items"
      products={validatedProducts}
      showPrices={true}
    />
  );
}

// Export the add function for use in other components
export { RecentlyViewed as default };

// Utility function to be used in product detail pages
export const addToRecentlyViewed = (item: {
  id: string;
  name: string;
  price: number;
  image: string;
  slug?: string;
  category: string;
}) => {
  if (!item || !item.id) return;
  const stored = localStorage.getItem('copperbear_recently_viewed');
  let items: StoredRecentlyViewedItem[] = [];

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        items = parsed;
      }
    } catch (error) {
      console.error('Error parsing recently viewed items:', error);
    }
  }

  // Remove item if it already exists
  items = items.filter(existing => existing.id !== item.id);

  // Add new item at the beginning
  items.unshift({
    id: item.id,
    name: item.name,
    price: item.price,
    image: item.image,
    slug: item.slug,
    category: item.category,
    viewedAt: Date.now()
  });

  // Keep only last 20 items
  items = items.slice(0, 20);

  // Save back to localStorage
  localStorage.setItem('copperbear_recently_viewed', JSON.stringify(items));
};