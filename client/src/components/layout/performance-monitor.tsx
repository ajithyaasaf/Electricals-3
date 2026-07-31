import { useEffect } from 'react';
import { trackWebVitals } from '@/lib/performance';

export function PerformanceMonitor() {
  useEffect(() => {
    // Only track in production or when explicitly enabled
    if (import.meta.env.PROD || import.meta.env.VITE_TRACK_PERFORMANCE) {
      trackWebVitals();
    }

    // Preload critical resources
    const criticalImages = [
      '/api/placeholder/400/300',
      '/api/placeholder/800/600',
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = `${src}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=75`;
      document.head.appendChild(link);
    });

    // Prefetch next likely pages
    const prefetchUrls = ['/products', '/services', '/account'];
    prefetchUrls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    });

  }, []);

  return null; // This component doesn't render anything
}