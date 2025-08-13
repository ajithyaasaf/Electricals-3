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
import WhyChooseSection from "@/components/common/why-choose-section";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductGridSkeleton, HeroSkeleton } from "@/components/common/skeleton-loader";
import { ServiceCard } from "@/components/service/service-card";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/ui/lazy-image";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, Wrench, ClipboardCheck, Tag, Clock, Shield, Phone, User, Heart, Calendar, Settings } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { getOptimizedImageUrl } from "@/lib/performance";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { formatPrice } from "@/lib/currency";

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
  const mockDeals = (dealsData as any)?.deals || [
    {
      id: "deal1",
      title: "Professional Electrical Tool Kit",
      description: "Complete 50-piece electrician tool set with case",
      image: getOptimizedImageUrl("https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-4.0.3&auto=format&fit=crop", 400, 300),
      discount: "30% OFF",
      originalPrice: 24999,
      salePrice: 17499,
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
      originalPrice: 7499,
      salePrice: 5624,
      link: "/products/smart-breaker",
      category: "breakers"
    },
    {
      id: "deal3",
      title: "LED Work Light Set",
      description: "Portable LED work lights - Pack of 4",
      image: getOptimizedImageUrl("https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?ixlib=rb-4.0.3&auto=format&fit=crop", 200, 150),
      discount: "40% OFF", 
      originalPrice: 6649,
      salePrice: 3999,
      link: "/products/led-work-lights",
      category: "lighting"
    },
    {
      id: "deal4",
      title: "Wire Nuts Bulk Pack",
      description: "Professional wire nuts - 500 piece assortment",
      image: getOptimizedImageUrl("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop", 200, 150),
      discount: "50% OFF",
      originalPrice: 2499,
      salePrice: 1249,
      link: "/products/wire-nuts-bulk",
      category: "wiring"
    }
  ];

  // Mock product data generator for horizontal sections
  const mockProducts = (type: string) => [
    {
      id: `${type}-1`,
      name: "Professional Wire Stripper Set",
      price: 2499,
      originalPrice: type === "trending" ? 3324 : undefined,
      image: getOptimizedImageUrl("https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-4.0.3&auto=format&fit=crop", 200, 160),
      category: "tools",
      rating: 4.5
    },
    {
      id: `${type}-2`,
      name: "Smart GFCI Outlet",
      price: 3824,
      originalPrice: type === "trending" ? 4649 : undefined,
      image: getOptimizedImageUrl("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop", 200, 160),
      category: "outlets",
      rating: 4.8
    },
    {
      id: `${type}-3`,
      name: "20A Circuit Breaker",
      price: 1579,
      originalPrice: type === "trending" ? 2074 : undefined,
      image: getOptimizedImageUrl("https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop", 200, 160),
      category: "breakers",
      rating: 4.7
    },
    {
      id: `${type}-4`,
      name: "LED Work Light 2000LM",
      price: 2904,
      originalPrice: type === "trending" ? 3737 : undefined,
      image: getOptimizedImageUrl("https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?ixlib=rb-4.0.3&auto=format&fit=crop", 200, 160),
      category: "lighting",
      rating: 4.6
    },
    {
      id: `${type}-5`,
      name: "12 AWG Copper Wire (100ft)",
      price: 7479,
      originalPrice: type === "trending" ? 9149 : undefined,
      image: getOptimizedImageUrl("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop", 200, 160),
      category: "wiring",
      rating: 4.9
    },
    {
      id: `${type}-6`,
      name: "Digital Multimeter",
      price: 4984,
      originalPrice: type === "trending" ? 6649 : undefined,
      image: getOptimizedImageUrl("https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-4.0.3&auto=format&fit=crop", 200, 160),
      category: "tools",
      rating: 4.4
    },
    {
      id: `${type}-7`,
      name: "Electrical Panel Cover",
      price: 2074,
      originalPrice: type === "trending" ? 2494 : undefined,
      image: getOptimizedImageUrl("https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop", 200, 160),
      category: "panels",
      rating: 4.3
    },
    {
      id: `${type}-8`,
      name: "Wire Nuts Assortment",
      price: 1079,
      originalPrice: type === "trending" ? 1414 : undefined,
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

      {/* Amazon-style Deals Section */}
      <section className="bg-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <Tag className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Today's Deals</h2>
            <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-medium">Limited Time</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Featured Deal */}
            <div className="lg:col-span-2">
              <div className="relative bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-yellow-400 text-black px-3 py-1 text-sm font-bold rounded">30% OFF</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-gray-900">Professional Electrical Tool Kit</h3>
                    <p className="text-gray-600">Complete 50-piece electrician tool set with case</p>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-yellow-600">{formatPrice(17499)}</span>
                      <span className="text-lg text-gray-500 line-through">{formatPrice(24999)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">Ends in 2h 45m</span>
                    </div>
                    <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium">Shop Deal Now</Button>
                  </div>
                  <div>
                    <LazyImage
                      src={getOptimizedImageUrl("https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-4.0.3&auto=format&fit=crop", 300, 200)}
                      alt="Professional Tool Kit"
                      className="w-full h-48 object-cover rounded-lg"
                      fallback="/api/placeholder/300/200"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Smaller Deals */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="relative mb-3">
                  <LazyImage
                    src={getOptimizedImageUrl("https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop", 200, 128)}
                    alt="Smart Circuit Breaker" 
                    className="w-full h-32 object-cover rounded-md"
                    fallback="/api/placeholder/200/128"
                  />
                  <span className="absolute top-2 left-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded">25% OFF</span>
                </div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Smart Circuit Breaker</h4>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-yellow-600">{formatPrice(5624)}</span>
                  <span className="text-sm text-gray-500 line-through">{formatPrice(7499)}</span>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="relative mb-3">
                  <LazyImage
                    src={getOptimizedImageUrl("https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?ixlib=rb-4.0.3&auto=format&fit=crop", 200, 128)}
                    alt="LED Work Lights"
                    className="w-full h-32 object-cover rounded-md"
                    fallback="/api/placeholder/200/128"
                  />
                  <span className="absolute top-2 left-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded">40% OFF</span>
                </div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">LED Work Light Set</h4>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-yellow-600">{formatPrice(3999)}</span>
                  <span className="text-sm text-gray-500 line-through">{formatPrice(6649)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <Link href="/deals" className="inline-flex items-center gap-2 text-copper-600 hover:text-copper-700 font-medium">
              <Zap className="w-4 h-4" />
              View All Deals & Offers
            </Link>
          </div>
        </div>
      </section>

      {/* Best Sellers - Horizontal Scrolling */}
      <HorizontalProductSection
        title="Best Sellers in Electrical"
        products={(bestSellersData as any)?.products || mockProducts("bestsellers")}
        viewAllLink="/products?bestsellers=true"
        showPrices={true}
      />

      {/* New Arrivals - Horizontal Scrolling */}
      <HorizontalProductSection
        title="New Arrivals"
        products={(newArrivalsData as any)?.products || mockProducts("new")}
        viewAllLink="/products?new=true"
        showPrices={true}
      />

      {/* Trending Now - Horizontal Scrolling */}
      <HorizontalProductSection
        title="Trending Now"
        products={(trendingData as any)?.products || mockProducts("trending")}
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
              {((servicesData as any)?.services || []).slice(0, 3).map((service: any) => (
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
                <div className="w-12 h-12 bg-electric-100 rounded-full flex items-center justify-center mb-3">
                  <Clock className="text-electric-600 text-lg" />
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

      {/* Why Choose CopperBear Section */}
      <WhyChooseSection 
        realtimePath="siteContent/whyChooseSection"
        className="bg-gray-50"
      />

      {/* Account Quick Access - More useful for logged-in users */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Your Account Dashboard</h3>
            <p className="text-lg text-gray-600">Quick access to your orders, saved items, and account features</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Link href="/account" className="bg-gray-50 hover:bg-gray-100 rounded-xl p-6 text-center transition-colors group">
              <div className="w-12 h-12 bg-copper-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-copper-200 transition-colors">
                <User className="text-copper-600 w-6 h-6" />
              </div>
              <h5 className="font-semibold text-gray-900 mb-1">My Orders</h5>
              <p className="text-sm text-gray-600">Track your recent purchases</p>
            </Link>

            <Link href="/account?tab=saved" className="bg-gray-50 hover:bg-gray-100 rounded-xl p-6 text-center transition-colors group">
              <div className="w-12 h-12 bg-electric-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-electric-200 transition-colors">
                <Heart className="text-electric-600 w-6 h-6" />
              </div>
              <h5 className="font-semibold text-gray-900 mb-1">Saved Items</h5>
              <p className="text-sm text-gray-600">Your wishlist and favorites</p>
            </Link>

            <Link href="/services" className="bg-gray-50 hover:bg-gray-100 rounded-xl p-6 text-center transition-colors group">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors">
                <Calendar className="text-green-600 w-6 h-6" />
              </div>
              <h5 className="font-semibold text-gray-900 mb-1">Book Service</h5>
              <p className="text-sm text-gray-600">Schedule electrical work</p>
            </Link>

            <Link href="/account?tab=settings" className="bg-gray-50 hover:bg-gray-100 rounded-xl p-6 text-center transition-colors group">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-200 transition-colors">
                <Settings className="text-orange-600 w-6 h-6" />
              </div>
              <h5 className="font-semibold text-gray-900 mb-1">Account Settings</h5>
              <p className="text-sm text-gray-600">Manage your preferences</p>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
