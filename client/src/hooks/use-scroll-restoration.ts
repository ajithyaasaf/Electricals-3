import { useLocation } from "wouter";
import { useEffect } from "react";

export function useScrollRestoration() {
  const [location] = useLocation();

  useEffect(() => {
    // Wait for content to potentially load, then smooth scroll to top
    const scrollToTop = () => {
      window.scrollTo({ 
        top: 0, 
        left: 0, 
        behavior: "smooth" 
      });
    };

    // Determine delay based on page type
    const isCategoryPage = location.includes('/products?category=') || location.includes('/services?category=');
    const isProductDetailPage = location.includes('/products/') || location.includes('/services/');
    const isSearchPage = location.includes('?') && (location.includes('featured=') || location.includes('bulk=') || location.includes('clearance='));
    
    // Category pages and search pages need more time to load filtered data
    let delay = 50; // Default for regular pages
    if (isCategoryPage || isSearchPage) {
      delay = 200; // Categories from header navigation
    } else if (isProductDetailPage) {
      delay = 150; // Individual product pages
    }

    const timer = setTimeout(scrollToTop, delay);

    return () => clearTimeout(timer);
  }, [location]);
}