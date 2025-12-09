import { useQuery } from "@tanstack/react-query";
import { HorizontalProductSection } from "./horizontal-product-section";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating?: number;
  originalPrice?: number;
}

interface RecommendationEngineProps {
  productId?: string;
  category?: string;
  userId?: string;
}

export function RecommendationEngine({ productId, category, userId }: RecommendationEngineProps) {
  const { user } = useFirebaseAuth();
  
  // Fetch "Customers who bought this also bought" recommendations
  const { data: alsoBoughtData } = useQuery({
    queryKey: ["/api/recommendations/also-bought", productId],
    enabled: !!productId,
  });

  // Fetch "Recommended for you" based on user behavior
  const { data: personalizedData } = useQuery({
    queryKey: ["/api/recommendations/personalized", user?.uid],
    enabled: !!user?.uid,
  });

  // Fetch "More in this category" recommendations
  const { data: categoryData } = useQuery({
    queryKey: ["/api/recommendations/category", category],
    enabled: !!category,
  });

  // Fetch "Trending now" recommendations
  const { data: trendingData } = useQuery({
    queryKey: ["/api/recommendations/trending"],
  });

  // Fetch bundle recommendations
  const { data: bundleData } = useQuery({
    queryKey: ["/api/recommendations/bundle", productId],
    enabled: !!productId,
  });

  const recommendations = [];

  // Add "Customers who bought this also bought" section
  if (productId && ((alsoBoughtData as any)?.products?.length > 0 || !alsoBoughtData)) {
    recommendations.push({
      title: "Customers who bought this item also bought",
      products: (alsoBoughtData as any)?.products || generateMockProducts("also-bought"),
      viewAllLink: `/products?related=${productId}`,
      key: "also-bought"
    });
  }

  // Add personalized recommendations for logged-in users
  if (user && ((personalizedData as any)?.products?.length > 0 || !personalizedData)) {
    recommendations.push({
      title: "Recommended for you",
      products: (personalizedData as any)?.products || generateMockProducts("personalized"),
      viewAllLink: "/products?personalized=true",
      key: "personalized"
    });
  }

  // Add category-based recommendations
  if (category || ((categoryData as any)?.products?.length > 0 || !categoryData)) {
    recommendations.push({
      title: `More in ${category || 'this category'}`,
      products: (categoryData as any)?.products || generateMockProducts("category"),
      viewAllLink: `/products?category=${category}`,
      key: "category"
    });
  }

  // Add trending products
  if ((trendingData as any)?.products?.length > 0 || !trendingData) {
    recommendations.push({
      title: "Trending electrical products",
      products: (trendingData as any)?.products || generateMockProducts("trending"),
      viewAllLink: "/products?trending=true",
      key: "trending"
    });
  }

  // Add "Frequently bought together" for product pages
  if (productId && ((bundleData as any)?.products?.length > 0 || !bundleData)) {
    recommendations.push({
      title: "Frequently bought together",
      products: (bundleData as any)?.products || generateMockProducts("bundle"),
      viewAllLink: `/products?bundle=${productId}`,
      key: "bundle"
    });
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {recommendations.map((rec) => (
        <HorizontalProductSection
          key={rec.key}
          title={rec.title}
          products={rec.products}
          viewAllLink={rec.viewAllLink}
          showPrices={true}
        />
      ))}
    </div>
  );
}

// Generate mock products for recommendations
const generateMockProducts = (type: string): Product[] => [
  {
    id: `${type}-rec-1`,
    name: "Professional Electrical Toolkit",
    price: 12449,
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=160",
    category: "tools",
    rating: 4.8
  },
  {
    id: `${type}-rec-2`,
    name: "Smart Circuit Breaker Panel",
    price: 24899,
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=160",
    category: "panels",
    rating: 4.7
  },
  {
    id: `${type}-rec-3`,
    name: "Industrial Grade Cable",
    price: 6639,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=160",
    category: "wiring",
    rating: 4.9
  },
  {
    id: `${type}-rec-4`,
    name: "LED Flood Light 5000LM",
    price: 7469,
    image: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=160",
    category: "lighting",
    rating: 4.6
  }
];

// Utility function to track user product interactions
export const trackProductInteraction = (productId: string, action: 'view' | 'cart' | 'purchase', userId?: string) => {
  // Store interaction data for recommendations
  const interaction = {
    productId,
    action,
    userId,
    timestamp: Date.now()
  };

  // Store in localStorage for immediate use
  const stored = localStorage.getItem('copperbear_interactions');
  let interactions = [];
  
  if (stored) {
    try {
      interactions = JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing interactions:', error);
    }
  }

  interactions.push(interaction);
  
  // Keep only last 100 interactions
  interactions = interactions.slice(-100);
  
  localStorage.setItem('copperbear_interactions', JSON.stringify(interactions));

  // In a real app, this would also send to backend
  // fetch('/api/interactions', { method: 'POST', body: JSON.stringify(interaction) });
};