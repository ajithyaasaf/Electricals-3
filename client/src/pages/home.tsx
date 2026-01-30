import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/common/hero-section";
import { BannerSlider } from "@/components/common/banner-slider";
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
import { useSEO } from "@/hooks/use-seo";

export default function Home() {
  const { user } = useFirebaseAuth();

  // SEO optimization for homepage
  useSEO();

  // Fetch featured products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products", { featured: true, limit: 8 }],
  });

  // Fetch services
  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/services", { limit: 3 }],
  });

  // Fetch deals data (real discounted products)
  const { data: dealsData } = useQuery({
    queryKey: ["/api/products", { hasDiscount: true, limit: 4 }],
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

  // Use real data
  const deals = (dealsData as any)?.products || [];



  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Banner Slider - Amazon/Flipkart Style */}
      <div className="bg-gray-50 py-8 px-4 md:px-6 lg:px-8">
        <BannerSlider
          autoPlayInterval={5000}
          showControls={true}
          showDots={true}
        />
      </div>

      {/* Original Hero Section */}
      <HeroSection />

      {/* Recently Viewed - Only show for returning users */}
      <RecentlyViewed />

      {/* Deals Banner */}
      <DealsBanner products={deals} />

      {/* Visual Category Cards - Amazon Style */}
      <VisualCategoryCards categories={visualCategories} />

      {/* Best Sellers - Horizontal Scrolling */}
      <HorizontalProductSection
        title="Best Sellers in Electrical"
        products={(bestSellersData as any)?.products || []}
        viewAllLink="/products?bestsellers=true"
        showPrices={true}
      />

      {/* New Arrivals - Horizontal Scrolling */}
      <HorizontalProductSection
        title="New Arrivals"
        products={(newArrivalsData as any)?.products || []}
        viewAllLink="/products?new=true"
        showPrices={true}
      />

      {/* Trending Now - Horizontal Scrolling */}
      <HorizontalProductSection
        title="Trending Now"
        products={(trendingData as any)?.products || []}
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
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-3">
                  <Tag className="text-teal-600 text-lg" />
                </div>
                <h5 className="font-semibold text-gray-900 mb-1">Licensed & Insured</h5>
                <p className="text-sm text-gray-600">All our electricians are fully licensed and insured professionals</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-teal-light-100 rounded-full flex items-center justify-center mb-3">
                  <Clock className="text-teal-light-600 text-lg" />
                </div>
                <h5 className="font-semibold text-gray-900 mb-1">Same-Day Service</h5>
                <p className="text-sm text-gray-600">Available for most electrical repairs and installations</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-3">
                  <Shield className="text-teal-600 text-lg" />
                </div>
                <h5 className="font-semibold text-gray-900 mb-1">Warranty Included</h5>
                <p className="text-sm text-gray-600">All work comes with our comprehensive warranty protection</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-teal-light-100 rounded-full flex items-center justify-center mb-3">
                  <Phone className="text-teal-light-600 text-lg" />
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
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-teal-200 transition-colors">
                <User className="text-teal-600 w-6 h-6" />
              </div>
              <h5 className="font-semibold text-gray-900 mb-1">My Orders</h5>
              <p className="text-sm text-gray-600">Track your recent purchases</p>
            </Link>

            <Link href="/account?tab=saved" className="bg-gray-50 hover:bg-gray-100 rounded-xl p-6 text-center transition-colors group">
              <div className="w-12 h-12 bg-teal-light-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-teal-light-200 transition-colors">
                <Heart className="text-teal-light-600 w-6 h-6" />
              </div>
              <h5 className="font-semibold text-gray-900 mb-1">Saved Items</h5>
              <p className="text-sm text-gray-600">Your wishlist and favorites</p>
            </Link>

            <Link href="/services" className="bg-gray-50 hover:bg-gray-100 rounded-xl p-6 text-center transition-colors group">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-teal-200 transition-colors">
                <Calendar className="text-teal-600 w-6 h-6" />
              </div>
              <h5 className="font-semibold text-gray-900 mb-1">Book Service</h5>
              <p className="text-sm text-gray-600">Schedule electrical work</p>
            </Link>

            <Link href="/account?tab=settings" className="bg-gray-50 hover:bg-gray-100 rounded-xl p-6 text-center transition-colors group">
              <div className="w-12 h-12 bg-teal-light-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-teal-light-200 transition-colors">
                <Settings className="text-teal-light-600 w-6 h-6" />
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
