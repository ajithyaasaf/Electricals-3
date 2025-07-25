import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/common/hero-section";
import { Testimonials } from "@/components/common/testimonials";
import { HorizontalProductSection } from "@/components/common/horizontal-product-section";
import { DealsBanner } from "@/components/common/deals-banner";
import { VisualCategoryCards } from "@/components/common/visual-category-cards";
import { RecentlyViewed } from "@/components/common/recently-viewed";
import { RecommendationEngine } from "@/components/common/recommendation-engine";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductGridSkeleton, HeroSkeleton } from "@/components/common/skeleton-loader";
import { ServiceCard } from "@/components/service/service-card";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/ui/lazy-image";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, Wrench, ClipboardCheck, Tag, Clock, Shield, Phone } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { getOptimizedImageUrl } from "@/lib/performance";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

export default function Home() {
  const { user } = useFirebaseAuth();

  // Fetch featured products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products", { featured: true, limit: 8 }],
  });

  // Fetch services
  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/services", { limit: 3 }],
  });

  // Fetch deals data
  const { data: dealsData } = useQuery({
    queryKey: ["/api/deals", { limit: 4 }],
  });

  // Fetch best sellers
  const { data: bestSellersData } = useQuery({
    queryKey: ["/api/products", { bestsellers: true, limit: 12 }],
  });

  // Fetch new arrivals
  const { data: newArrivalsData } = useQuery({
    queryKey: ["/api/products", { new: true, limit: 12 }],
  });

  // Fetch trending products
  const { data: trendingData } = useQuery({
    queryKey: ["/api/products", { trending: true, limit: 12 }],
  });

  // Visual category cards data
  const visualCategories = [
    {
      name: "Circuit Breakers & Protection",
      slug: "circuit-breakers",
      image: getOptimizedImageUrl("https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop", 400, 300),
      description: "Professional-grade circuit breakers, GFCI outlets, and electrical protection equipment",
      itemCount: 240,
      featured: true
    },
    {
      name: "Wiring & Cable Solutions", 
      slug: "wiring-cables",
      image: getOptimizedImageUrl("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop", 400, 300),
      description: "High-quality electrical wiring, cables, and connectivity solutions for all projects",
      itemCount: 180,
      featured: true
    },
    {
      name: "Professional Tools",
      slug: "electrical-tools", 
      image: getOptimizedImageUrl("https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-4.0.3&auto=format&fit=crop", 400, 300),
      description: "Premium electrical tools and equipment for professionals and contractors",
      itemCount: 320,
      featured: true
    },
    {
      name: "Panels & Boxes",
      slug: "panels-boxes",
      image: getOptimizedImageUrl("https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop", 200, 150),
      description: "Electrical panels and junction boxes",
      itemCount: 85
    },
    {
      name: "Outlets & Switches",
      slug: "outlets-switches",
      image: getOptimizedImageUrl("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop", 200, 150),
      description: "Modern outlets and switches",
      itemCount: 150
    },
    {
      name: "Lighting Solutions",
      slug: "lighting",
      image: getOptimizedImageUrl("https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?ixlib=rb-4.0.3&auto=format&fit=crop", 200, 150),
      description: "LED lights and fixtures",
      itemCount: 200
    }
  ];

  // Mock deals data (in real app, this would come from API)
  const mockDeals = dealsData?.deals || [
    {
      id: "deal1",
      title: "Professional Electrical Tool Kit",
      description: "Complete 50-piece electrician tool set with case",
      image: getOptimizedImageUrl("https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-4.0.3&auto=format&fit=crop", 400, 300),
      discount: "30% OFF",
      originalPrice: 299.99,
      salePrice: 209.99,
      timeLeft: "2h 45m",
      link: "/products/professional-tool-kit",
      category: "tools"
    },
    {
      id: "deal2", 
      title: "Smart Circuit Breaker",
      description: "WiFi-enabled smart breaker with app control",
      image: getOptimizedImageUrl("https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop", 200, 150),
      discount: "25% OFF",
      originalPrice: 89.99,
      salePrice: 67.49,
      link: "/products/smart-breaker",
      category: "breakers"
    },
    {
      id: "deal3",
      title: "LED Work Light Set",
      description: "Portable LED work lights - Pack of 4",
      image: getOptimizedImageUrl("https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?ixlib=rb-4.0.3&auto=format&fit=crop", 200, 150),
      discount: "40% OFF", 
      originalPrice: 79.99,
      salePrice: 47.99,
      link: "/products/led-work-lights",
      category: "lighting"
    },
    {
      id: "deal4",
      title: "Wire Nuts Bulk Pack",
      description: "Professional wire nuts - 500 piece assortment",
      image: getOptimizedImageUrl("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop", 200, 150),
      discount: "50% OFF",
      originalPrice: 29.99,
      salePrice: 14.99,
      link: "/products/wire-nuts-bulk",
      category: "wiring"
    }
  ];

  // Mock product data generator for horizontal sections
  const mockProducts = (type: string) => [
    {
      id: `${type}-1`,
      name: "Professional Wire Stripper Set",
      price: 29.99,
      originalPrice: type === "trending" ? 39.99 : undefined,
      image: getOptimizedImageUrl("https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-4.0.3&auto=format&fit=crop", 200, 160),
      category: "tools",
      rating: 4.5
    },
    {
      id: `${type}-2`,
      name: "Smart GFCI Outlet",
      price: 45.99,
      originalPrice: type === "trending" ? 55.99 : undefined,
      image: getOptimizedImageUrl("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop", 200, 160),
      category: "outlets",
      rating: 4.8
    },
    {
      id: `${type}-3`,
      name: "20A Circuit Breaker",
      price: 18.99,
      originalPrice: type === "trending" ? 24.99 : undefined,
      image: getOptimizedImageUrl("https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop", 200, 160),
      category: "breakers",
      rating: 4.7
    },
    {
      id: `${type}-4`,
      name: "LED Work Light 2000LM",
      price: 34.99,
      originalPrice: type === "trending" ? 44.99 : undefined,
      image: getOptimizedImageUrl("https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?ixlib=rb-4.0.3&auto=format&fit=crop", 200, 160),
      category: "lighting",
      rating: 4.6
    },
    {
      id: `${type}-5`,
      name: "12 AWG Copper Wire (100ft)",
      price: 89.99,
      originalPrice: type === "trending" ? 109.99 : undefined,
      image: getOptimizedImageUrl("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop", 200, 160),
      category: "wiring",
      rating: 4.9
    },
    {
      id: `${type}-6`,
      name: "Digital Multimeter",
      price: 59.99,
      originalPrice: type === "trending" ? 79.99 : undefined,
      image: getOptimizedImageUrl("https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-4.0.3&auto=format&fit=crop", 200, 160),
      category: "tools",
      rating: 4.4
    },
    {
      id: `${type}-7`,
      name: "Electrical Panel Cover",
      price: 24.99,
      originalPrice: type === "trending" ? 29.99 : undefined,
      image: getOptimizedImageUrl("https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop", 200, 160),
      category: "panels",
      rating: 4.3
    },
    {
      id: `${type}-8`,
      name: "Wire Nuts Assortment",
      price: 12.99,
      originalPrice: type === "trending" ? 16.99 : undefined,
      image: getOptimizedImageUrl("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop", 200, 160),
      category: "wiring",
      rating: 4.2
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Recently Viewed - Only show for returning users */}
      <RecentlyViewed />

      {/* Deals Banner */}
      <DealsBanner deals={mockDeals} />

      {/* Visual Category Cards - Amazon Style */}
      <VisualCategoryCards categories={visualCategories} />

      {/* Best Sellers - Horizontal Scrolling */}
      <HorizontalProductSection
        title="Best Sellers in Electrical"
        products={bestSellersData?.products || mockProducts("bestsellers")}
        viewAllLink="/products?bestsellers=true"
        showPrices={true}
      />

      {/* New Arrivals - Horizontal Scrolling */}
      <HorizontalProductSection
        title="New Arrivals"
        products={newArrivalsData?.products || mockProducts("new")}
        viewAllLink="/products?new=true"
        showPrices={true}
      />

      {/* Trending Now - Horizontal Scrolling */}
      <HorizontalProductSection
        title="Trending Now"
        products={trendingData?.products || mockProducts("trending")}
        viewAllLink="/products?trending=true"
        showPrices={true}
        dealBadge="Hot"
      />

      {/* Personalized Recommendations */}
      <RecommendationEngine userId={user?.uid} />

      {/* Services Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Professional Electrical Services</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our licensed electricians provide comprehensive electrical services for residential and commercial properties.
            </p>
          </div>

          {servicesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl p-6">
                  <Skeleton className="w-full h-32 mb-4" />
                  <Skeleton className="w-3/4 h-6 mb-3" />
                  <Skeleton className="w-full h-4 mb-2" />
                  <Skeleton className="w-full h-4 mb-4" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="w-24 h-6" />
                    <Skeleton className="w-32 h-10" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(servicesData?.services || []).slice(0, 3).map((service: any) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}

          {/* Service Features */}
          <div className="mt-12 bg-gray-50 rounded-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-copper-100 rounded-full flex items-center justify-center mb-3">
                  <Tag className="text-copper-600 text-lg" />
                </div>
                <h5 className="font-semibold text-gray-900 mb-1">Licensed & Insured</h5>
                <p className="text-sm text-gray-600">All our electricians are fully licensed and insured professionals</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-electric-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Clock className="text-electric-blue-600 text-lg" />
                </div>
                <h5 className="font-semibold text-gray-900 mb-1">Same-Day Service</h5>
                <p className="text-sm text-gray-600">Available for most electrical repairs and installations</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <Shield className="text-green-600 text-lg" />
                </div>
                <h5 className="font-semibold text-gray-900 mb-1">Warranty Included</h5>
                <p className="text-sm text-gray-600">All work comes with our comprehensive warranty protection</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                  <Phone className="text-orange-600 text-lg" />
                </div>
                <h5 className="font-semibold text-gray-900 mb-1">24/7 Support</h5>
                <p className="text-sm text-gray-600">Round-the-clock customer support for your electrical needs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      <Footer />
    </div>
  );
}
