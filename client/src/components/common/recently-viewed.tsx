import { useEffect, useState } from "react";
import { HorizontalProductSection } from "./horizontal-product-section";

interface RecentlyViewedItem {
  id: string;
  name: string;
  price: number;
  image: string; // Legacy: keeps storing single image for simplicity in storage
  slug?: string; // Added for SEO links
  category: string;
  viewedAt: number;
}

export function RecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    // Load recently viewed items from localStorage
    const stored = localStorage.getItem('copperbear_recently_viewed');
    if (stored) {
      try {
        const items = JSON.parse(stored);
        // Sort by most recently viewed and take only last 12
        const sortedItems = items
          .sort((a: RecentlyViewedItem, b: RecentlyViewedItem) => b.viewedAt - a.viewedAt)
          .slice(0, 12);
        setRecentlyViewed(sortedItems);
      } catch (error) {
        console.error('Error loading recently viewed items:', error);
      }
    }
  }, []);

  // Function to add item to recently viewed (to be used in product detail pages)
  const addToRecentlyViewed = (item: Omit<RecentlyViewedItem, 'viewedAt'>) => {
    const stored = localStorage.getItem('copperbear_recently_viewed');
    let items: RecentlyViewedItem[] = [];

    if (stored) {
      try {
        items = JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing recently viewed items:', error);
      }
    }

    // Remove item if it already exists
    items = items.filter(existing => existing.id !== item.id);

    // Add new item at the beginning
    items.unshift({
      ...item,
      viewedAt: Date.now()
    });

    // Keep only last 20 items
    items = items.slice(0, 20);

    // Save back to localStorage
    localStorage.setItem('copperbear_recently_viewed', JSON.stringify(items));

    setRecentlyViewed(items.slice(0, 12));
  };

  // Don't render if no recently viewed items
  if (recentlyViewed.length === 0) {
    return null;
  }

  return (
    <HorizontalProductSection
      title="Your Recently Viewed Items"
      products={recentlyViewed}
      viewAllLink="/account?tab=recently-viewed"
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
  const stored = localStorage.getItem('copperbear_recently_viewed');
  let items: RecentlyViewedItem[] = [];

  if (stored) {
    try {
      items = JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing recently viewed items:', error);
    }
  }

  // Remove item if it already exists
  items = items.filter(existing => existing.id !== item.id);

  // Add new item at the beginning
  items.unshift({
    ...item,
    viewedAt: Date.now()
  });

  // Keep only last 20 items
  items = items.slice(0, 20);

  // Save back to localStorage
  localStorage.setItem('copperbear_recently_viewed', JSON.stringify(items));
};