import { useLocation } from "wouter";
import { useEffect } from "react";

export function useScrollRestoration() {
  const [location] = useLocation();

  useEffect(() => {
    // Small delay to ensure DOM is ready, then smooth scroll to top
    const timer = setTimeout(() => {
      window.scrollTo({ 
        top: 0, 
        left: 0, 
        behavior: "smooth" 
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [location]);
}