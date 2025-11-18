import { useEffect, useRef, useCallback, useState } from "react";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";

interface NavigationState {
  isNavigating: boolean;
  previousLocation: string | null;
  scrollPositions: Map<string, number>;
  loadingProgress: number;
}

export function useEnterpriseNavigation() {
  const [location, setLocation] = useLocation();
  const [navigationState, setNavigationState] = useState<NavigationState>({
    isNavigating: false,
    previousLocation: null,
    scrollPositions: new Map(),
    loadingProgress: 0,
  });
  
  const scrollPositionsRef = useRef(new Map<string, number>());
  const navigationTimeoutRef = useRef<NodeJS.Timeout>();
  const progressIntervalRef = useRef<NodeJS.Timeout>();

  // Save scroll position before navigation
  const saveScrollPosition = useCallback((path: string) => {
    const scrollY = window.scrollY;
    scrollPositionsRef.current.set(path, scrollY);
    setNavigationState(prev => ({
      ...prev,
      scrollPositions: new Map(scrollPositionsRef.current)
    }));
  }, []);

  // Restore scroll position after navigation
  const restoreScrollPosition = useCallback((path: string, delay: number = 100) => {
    const savedPosition = scrollPositionsRef.current.get(path);
    
    setTimeout(() => {
      if (savedPosition !== undefined) {
        // Restore to saved position
        window.scrollTo({
          top: savedPosition,
          left: 0,
          behavior: "smooth"
        });
      } else {
        // Scroll to top for new pages
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth"
        });
      }
    }, delay);
  }, []);

  // Preload route data
  const preloadRoute = useCallback(async (path: string) => {
    try {
      // Preload common data based on route
      if (path.includes('/products')) {
        const urlParams = new URLSearchParams(path.split('?')[1] || '');
        const category = urlParams.get('category');
        
        // Preload categories
        await queryClient.prefetchQuery({
          queryKey: ['/api/categories'],
          staleTime: 5 * 60 * 1000, // 5 minutes
        });

        // Preload products for category
        if (category) {
          await queryClient.prefetchQuery({
            queryKey: ['/api/products', { category }],
            staleTime: 2 * 60 * 1000, // 2 minutes
          });
        }
      } else if (path.includes('/services')) {
        await queryClient.prefetchQuery({
          queryKey: ['/api/services'],
          staleTime: 5 * 60 * 1000,
        });
      } else if (path.includes('/account')) {
        await queryClient.prefetchQuery({
          queryKey: ['/api/auth/user'],
          staleTime: 1 * 60 * 1000,
        });
      }
    } catch (error) {
      console.warn('Route preload failed:', error);
    }
  }, []);

  // Enhanced navigation with loading states
  const navigateWithProgress = useCallback(async (
    newPath: string, 
    options: { replace?: boolean; preload?: boolean } = {}
  ) => {
    const currentPath = location;
    
    // For same-path navigation, still trigger setLocation to ensure
    // React Router/wouter properly updates and re-renders components
    // This is important for mobile menu closing and filter updates
    const isSamePath = currentPath === newPath;

    // Save current scroll position
    saveScrollPosition(currentPath);

    // For same-path navigation, skip loading animation for instant feel
    if (isSamePath) {
      // Still call setLocation to ensure proper state updates
      // This is crucial for mobile menu closing and component re-renders
      setLocation(newPath, { replace: options.replace || true });
      return;
    }

    // Start navigation state (only for different paths)
    setNavigationState(prev => ({
      ...prev,
      isNavigating: true,
      previousLocation: currentPath,
      loadingProgress: 0,
    }));

    // Simulate loading progress
    let progress = 0;
    progressIntervalRef.current = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 90) {
        clearInterval(progressIntervalRef.current);
        progress = 90;
      }
      setNavigationState(prev => ({
        ...prev,
        loadingProgress: progress,
      }));
    }, 100);

    try {
      // Preload data if requested
      if (options.preload !== false) {
        await preloadRoute(newPath);
      }

      // Navigate
      setLocation(newPath, { replace: options.replace });

      // Complete loading
      setNavigationState(prev => ({
        ...prev,
        loadingProgress: 100,
      }));

      // Wait for DOM to update, then restore scroll
      setTimeout(() => {
        restoreScrollPosition(newPath, 200);
        
        // Clear navigation state
        navigationTimeoutRef.current = setTimeout(() => {
          setNavigationState(prev => ({
            ...prev,
            isNavigating: false,
            loadingProgress: 0,
          }));
        }, 500);
      }, 50);

    } catch (error) {
      console.error('Navigation error:', error);
      setNavigationState(prev => ({
        ...prev,
        isNavigating: false,
        loadingProgress: 0,
      }));
    } finally {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
  }, [location, saveScrollPosition, restoreScrollPosition, preloadRoute, setLocation]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      // Small delay to ensure location is updated
      setTimeout(() => {
        restoreScrollPosition(location, 100);
      }, 50);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location, restoreScrollPosition]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Smart scroll restoration for same-page navigation
  useEffect(() => {
    const currentPath = location.split('?')[0]; // Base path without query params
    const isQueryParamChange = location.includes('?') && 
      navigationState.previousLocation?.split('?')[0] === currentPath;

    if (isQueryParamChange) {
      // For category/filter changes, scroll to top smoothly
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth"
        });
      }, 150);
    }
  }, [location, navigationState.previousLocation]);

  return {
    navigationState,
    navigateWithProgress,
    saveScrollPosition,
    restoreScrollPosition,
    preloadRoute,
  };
}

// Hook for link preloading on hover
export function useLinkPreload() {
  const { preloadRoute } = useEnterpriseNavigation();
  
  const handleLinkHover = useCallback((href: string) => {
    // Debounce preloading
    const timeout = setTimeout(() => {
      preloadRoute(href);
    }, 200);
    
    return () => clearTimeout(timeout);
  }, [preloadRoute]);

  return { handleLinkHover };
}