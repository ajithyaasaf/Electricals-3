import { useLocation } from "wouter";
import { useEffect } from "react";

export function useScrollRestoration() {
  const [location] = useLocation();

  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location]);
}