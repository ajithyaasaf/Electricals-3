import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  updateMetaTags, 
  initializeBaseSchema, 
  SEO_CONFIG,
  type SEOMetaTag 
} from '@/lib/seo';

/**
 * Hook to manage SEO meta tags for each page
 * Automatically updates meta tags based on current route
 */
export const useSEO = (customMeta?: Partial<SEOMetaTag>) => {
  const [location] = useLocation();

  useEffect(() => {
    // Initialize base schema on first load
    initializeBaseSchema();
  }, []);

  useEffect(() => {
    // Determine page-specific meta tags based on route
    let pageMeta = SEO_CONFIG.default;

    if (location === '/' || location === '/home') {
      pageMeta = SEO_CONFIG.pages.home;
    } else if (location.startsWith('/products')) {
      pageMeta = SEO_CONFIG.pages.products;
    } else if (location.startsWith('/services')) {
      pageMeta = SEO_CONFIG.pages.services;
    } else if (location.startsWith('/cart')) {
      pageMeta = SEO_CONFIG.pages.cart;
    } else if (location.startsWith('/checkout')) {
      pageMeta = SEO_CONFIG.pages.checkout;
    } else if (location.startsWith('/account')) {
      pageMeta = SEO_CONFIG.pages.account;
    }

    // Merge with custom meta tags if provided
    const finalMeta: SEOMetaTag = {
      ...pageMeta,
      ...customMeta,
      canonicalUrl: customMeta?.canonicalUrl || window.location.href
    };

    // Update meta tags
    updateMetaTags(finalMeta);
  }, [location, customMeta]);
};

/**
 * Hook to add product-specific SEO
 */
export const useProductSEO = (product: any) => {
  useEffect(() => {
    if (!product) return;

    const productMeta = SEO_CONFIG.product(
      product.name,
      product.category || 'Electrical Products',
      product.price
    );

    updateMetaTags({
      ...productMeta,
      canonicalUrl: window.location.href,
      ogImage: product.imageUrls?.[0] || product.image
    });

    // Add product schema using proper ESM imports
    import('@/lib/seo').then(({ injectSchema, generateProductSchema, generateLocalBusinessSchema, generateOrganizationSchema }) => {
      const schemas = [
        generateLocalBusinessSchema(),
        generateOrganizationSchema(),
        generateProductSchema(product)
      ];
      injectSchema(schemas);
    });
  }, [product]);
};

/**
 * Hook to add category-specific SEO
 */
export const useCategorySEO = (categoryName: string) => {
  useEffect(() => {
    if (!categoryName) return;

    const categoryMeta = SEO_CONFIG.category(categoryName);

    updateMetaTags({
      ...categoryMeta,
      canonicalUrl: window.location.href
    });
  }, [categoryName]);
};
