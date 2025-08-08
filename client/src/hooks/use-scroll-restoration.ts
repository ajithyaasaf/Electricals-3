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

    // For product pages or pages with dynamic content, wait a bit longer
    const isProductPage = location.includes('/products/') || location.includes('/services/');
    const delay = isProductPage ? 150 : 50;

    const timer = setTimeout(scrollToTop, delay);

    return () => clearTimeout(timer);
  }, [location]);
}