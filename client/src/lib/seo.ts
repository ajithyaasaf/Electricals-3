/**
 * SEO Utilities for Pan-India Electrical E-commerce
 * Targeting: Madurai (Hub) → Tamil Nadu → North India → All India
 */

export interface SEOMetaTag {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

// Service areas configuration
export const SERVICE_AREAS = {
  primary: {
    city: 'Madurai',
    state: 'Tamil Nadu'
  },
  tamilNadu: [
    'Madurai', 'Chennai', 'Coimbatore', 'Trichy', 'Salem', 
    'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Thanjavur'
  ],
  northIndia: [
    'Delhi', 'Noida', 'Gurgaon', 'Ghaziabad', 'Faridabad',
    'Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut',
    'Jaipur', 'Jodhpur', 'Kota', 'Udaipur',
    'Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar',
    'Dehradun', 'Haridwar'
  ],
  allIndia: true
};

// Generate location-aware meta tags
export const generateLocationKeywords = () => {
  const tnCities = SERVICE_AREAS.tamilNadu.slice(0, 5).join(', ');
  const northCities = SERVICE_AREAS.northIndia.slice(0, 8).join(', ');
  return `Madurai, Tamil Nadu, ${tnCities}, ${northCities}, North India, All India`;
};

// SEO Meta Tags Configuration
export const SEO_CONFIG = {
  siteName: 'CopperBear Electrical',
  siteUrl: typeof window !== 'undefined' ? window.location.origin : '',
  defaultImage: '/og-image.jpg',
  twitterHandle: '@copperbear',
  
  // Default meta tags
  default: {
    title: 'CopperBear Electrical - Premium Electrical Products | Madurai to North India',
    description: `Buy premium electrical products online from Madurai. Fast delivery across Tamil Nadu and North India. Circuit breakers, wiring, tools & more. Free shipping on orders ₹10,000+. Serving ${SERVICE_AREAS.tamilNadu.slice(0, 4).join(', ')}, Delhi, Jaipur & all major cities.`,
    keywords: `electrical products Madurai, electrical store Tamil Nadu, electrical supplies North India, circuit breakers, wiring cables, ${generateLocationKeywords()}`
  },

  // Page-specific meta tags
  pages: {
    home: {
      title: 'Buy Electrical Products Online | Madurai to North India Delivery | CopperBear',
      description: `India's trusted electrical products store based in Madurai. Shop circuit breakers, cables, tools & more. Free delivery Tamil Nadu & North India on orders ₹10,000+. Licensed electricians available. Serving Madurai, Chennai, Delhi, Jaipur & 500+ cities.`,
      keywords: `electrical products online India, electrical store Madurai, buy electrical products Tamil Nadu, electrical supplies North India, circuit breakers online, electrical wiring cables`
    },
    
    products: {
      title: 'Electrical Products - Circuit Breakers, Cables & Tools | Madurai & North India',
      description: `Browse 1000+ electrical products with fast delivery from Madurai to North India. Premium quality circuit breakers, wiring cables, tools & accessories. Free shipping on ₹10,000+. Serving Tamil Nadu, Delhi, UP, Rajasthan & all India.`,
      keywords: `electrical products catalog, circuit breakers online, electrical cables India, professional electrical tools, Madurai electrical store`
    },

    services: {
      title: 'Licensed Electrician Services | Madurai, Tamil Nadu & North India | CopperBear',
      description: `Professional electrical services in Madurai and across India. Licensed electricians for installation, repair & maintenance. Same-day service available. Serving Tamil Nadu and expanding to North India. 24/7 emergency support.`,
      keywords: `electrician Madurai, electrical services Tamil Nadu, licensed electrician, electrical installation, electrical repair services`
    },

    cart: {
      title: 'Shopping Cart | CopperBear Electrical - Madurai to All India Delivery',
      description: `Review your electrical products order. Fast delivery from Madurai to Tamil Nadu and North India. Free shipping on orders above ₹10,000. Secure checkout available.`,
      keywords: `electrical products cart, online electrical shopping, Madurai electrical delivery`
    },

    checkout: {
      title: 'Secure Checkout | Fast Delivery Madurai to North India | CopperBear',
      description: `Complete your electrical products order with secure payment. Delivery across Tamil Nadu and North India. COD available in Tamil Nadu. Track your order in real-time.`,
      keywords: `electrical products checkout, secure payment, COD Tamil Nadu, India delivery`
    },

    account: {
      title: 'My Account - Orders & Profile | CopperBear Electrical',
      description: `Manage your orders, saved addresses, and preferences. Track deliveries across Tamil Nadu and North India. View order history and manage your electrical products wishlist.`,
      keywords: `account management, order tracking, delivery status`
    }
  },

  // Category-specific templates
  category: (categoryName: string) => ({
    title: `${categoryName} - Premium Quality | Madurai & North India Delivery | CopperBear`,
    description: `Shop premium ${categoryName.toLowerCase()} online with fast delivery from Madurai to North India. Authentic products, competitive prices, free shipping ₹10,000+. Serving Tamil Nadu, Delhi, UP, Rajasthan & all India.`,
    keywords: `${categoryName.toLowerCase()} Madurai, ${categoryName.toLowerCase()} Tamil Nadu, ${categoryName.toLowerCase()} North India, ${categoryName.toLowerCase()} online India`
  }),

  // Product-specific template
  product: (productName: string, category: string, price: number) => ({
    title: `${productName} - ₹${price.toLocaleString('en-IN')} | Buy Online Madurai & North India | CopperBear`,
    description: `Buy ${productName} online at ₹${price.toLocaleString('en-IN')}. Fast delivery from Madurai to Tamil Nadu and North India. Premium quality ${category.toLowerCase()}. Free shipping on orders ₹10,000+. COD available in Tamil Nadu.`,
    keywords: `${productName}, ${category.toLowerCase()}, buy ${productName} online, ${productName} Madurai, ${productName} price India`
  })
};

// Update document meta tags
export const updateMetaTags = (meta: SEOMetaTag) => {
  // Update title
  document.title = meta.title;

  // Update or create meta tags
  const updateOrCreateMeta = (name: string, content: string, isProperty = false) => {
    const attribute = isProperty ? 'property' : 'name';
    let element = document.querySelector(`meta[${attribute}="${name}"]`);
    
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, name);
      document.head.appendChild(element);
    }
    
    element.setAttribute('content', content);
  };

  // Standard meta tags
  updateOrCreateMeta('description', meta.description);
  if (meta.keywords) {
    updateOrCreateMeta('keywords', meta.keywords);
  }

  // Open Graph tags
  updateOrCreateMeta('og:title', meta.ogTitle || meta.title, true);
  updateOrCreateMeta('og:description', meta.ogDescription || meta.description, true);
  updateOrCreateMeta('og:type', 'website', true);
  updateOrCreateMeta('og:url', window.location.href, true);
  
  if (meta.ogImage) {
    updateOrCreateMeta('og:image', meta.ogImage, true);
  }

  // Twitter Card tags
  updateOrCreateMeta('twitter:card', 'summary_large_image');
  updateOrCreateMeta('twitter:title', meta.ogTitle || meta.title);
  updateOrCreateMeta('twitter:description', meta.ogDescription || meta.description);
  
  if (meta.ogImage) {
    updateOrCreateMeta('twitter:image', meta.ogImage);
  }

  // Canonical URL
  if (meta.canonicalUrl) {
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = meta.canonicalUrl;
  }
};

// Generate Schema.org JSON-LD for LocalBusiness
export const generateLocalBusinessSchema = () => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SEO_CONFIG.siteUrl}#business`,
  "name": "CopperBear Electrical Solutions",
  "description": "Premium electrical products and services provider based in Madurai, serving Tamil Nadu and North India",
  "url": SEO_CONFIG.siteUrl,
  "logo": `${SEO_CONFIG.siteUrl}/logo.png`,
  "image": `${SEO_CONFIG.siteUrl}${SEO_CONFIG.defaultImage}`,
  "telephone": "(555) 123-4567",
  "email": "support@copperbear.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Electric Avenue",
    "addressLocality": "Madurai",
    "addressRegion": "Tamil Nadu",
    "postalCode": "625001",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "9.9252",
    "longitude": "78.1198"
  },
  "areaServed": [
    {
      "@type": "City",
      "name": "Madurai",
      "containedIn": {
        "@type": "State",
        "name": "Tamil Nadu"
      }
    },
    {
      "@type": "State",
      "name": "Tamil Nadu",
      "containedIn": {
        "@type": "Country",
        "name": "India"
      }
    },
    {
      "@type": "Place",
      "name": "North India",
      "description": "Including Delhi, UP, Rajasthan, Punjab, Haryana"
    }
  ],
  "priceRange": "₹₹",
  "openingHours": "Mo-Sa 09:00-18:00",
  "currenciesAccepted": "INR",
  "paymentAccepted": "Cash, Credit Card, Debit Card, UPI, Net Banking",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "450"
  }
});

// Generate Organization Schema
export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "CopperBear Electrical Solutions",
  "alternateName": "CopperBear",
  "url": SEO_CONFIG.siteUrl,
  "logo": `${SEO_CONFIG.siteUrl}/logo.png`,
  "description": "India's trusted electrical products supplier, delivering from Madurai to North India",
  "sameAs": [
    "https://facebook.com/copperbear",
    "https://twitter.com/copperbear",
    "https://linkedin.com/company/copperbear",
    "https://instagram.com/copperbear"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-555-123-4567",
    "contactType": "Customer Service",
    "areaServed": "IN",
    "availableLanguage": ["English", "Tamil", "Hindi"]
  }
});

// Generate Product Schema
export const generateProductSchema = (product: any) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.name,
  "description": product.description || `Premium ${product.name} available for delivery across India`,
  "image": product.imageUrls?.[0] || product.image,
  "sku": product.id,
  "brand": {
    "@type": "Brand",
    "name": product.brand || "CopperBear"
  },
  "offers": {
    "@type": "Offer",
    "url": `${SEO_CONFIG.siteUrl}/product/${product.slug || product.id}`,
    "priceCurrency": "INR",
    "price": product.price,
    "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    "availability": product.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    "seller": {
      "@type": "Organization",
      "name": "CopperBear Electrical"
    },
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingDestination": {
        "@type": "DefinedRegion",
        "addressCountry": "IN"
      },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "businessDays": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        },
        "cutoffTime": "18:00:00",
        "handlingTime": {
          "@type": "QuantitativeValue",
          "minValue": 1,
          "maxValue": 2,
          "unitCode": "DAY"
        },
        "transitTime": {
          "@type": "QuantitativeValue",
          "minValue": 1,
          "maxValue": 7,
          "unitCode": "DAY"
        }
      }
    }
  },
  "aggregateRating": product.rating ? {
    "@type": "AggregateRating",
    "ratingValue": product.rating,
    "reviewCount": product.reviewCount || 10
  } : undefined
});

// Inject Schema into page
export const injectSchema = (schema: object | object[]) => {
  const schemaScript = document.createElement('script');
  schemaScript.type = 'application/ld+json';
  schemaScript.text = JSON.stringify(Array.isArray(schema) ? schema : [schema]);
  
  // Remove old schema if exists
  const oldSchema = document.querySelector('script[type="application/ld+json"]');
  if (oldSchema) {
    oldSchema.remove();
  }
  
  document.head.appendChild(schemaScript);
};

// Initialize base schema (LocalBusiness + Organization)
export const initializeBaseSchema = () => {
  const schemas = [
    generateLocalBusinessSchema(),
    generateOrganizationSchema()
  ];
  injectSchema(schemas);
};
