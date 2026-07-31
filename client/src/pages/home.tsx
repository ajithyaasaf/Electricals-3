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
import { Zap, Wrench, ClipboardCheck, Tag, Clock, Shield, Phone, User, Heart, Calendar, Settings, MapPin } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { getOptimizedImageUrl } from "@/lib/performance";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { formatPrice } from "@/lib/currency";
import { useSEO } from "@/hooks/use-seo";
import { useUserInterest } from "@/hooks/use-user-interest";

import circuitBreakersImg from "@assets/generated_images/Circuit_breakers_electrical_panel_ed1b7697.png";
import wiringCablesImg from "@assets/generated_images/Electrical_copper_wire_coils_aeb7f45b.png";
import toolsImg from "@assets/generated_images/Professional_electrical_tools_collection_b4db75d8.png";
import lightingImg from "@assets/generated_images/LED_street_light_fixture_4dde50e8.png";
import wireCoilImg from "@assets/generated_images/Finolex_2.5sqmm_wire_coil_072a94ff.png";
import pipesFittingsImg from "@assets/generated_images/Electrical_material_samples_bb4fe5fd.png";

export default function Home() {
  const { user } = useFirebaseAuth();
  const { topCategory, hasHistory } = useUserInterest();

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

  // Fetch personalized deals based on user browsing interest
  const { data: categoryDealsData } = useQuery({
    queryKey: ["/api/products", { category: topCategory, limit: 4 }],
    enabled: !!topCategory,
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

  // Visual category cards data matching official CopperBear catalog categories
  const visualCategories = [
    {
      name: "Wires and Cables",
      slug: "wires-cables",
      image: wiringCablesImg,
      description: "Flame retardant PVC insulated cables, Finolex & Kundan copper conductors",
      itemCount: 180,
      featured: true
    },
    {
      name: "Switch and Sockets",
      slug: "switch-sockets",
      image: wireCoilImg,
      description: "Modular switches, electrical sockets, plug points, and switching solutions",
      itemCount: 150,
      featured: true
    },
    {
      name: "Electric Accessories",
      slug: "electric-accessories",
      image: toolsImg,
      description: "Extension cords, plug adapters, electrical connectors, and testing accessories",
      itemCount: 320,
      featured: true
    },
    {
      name: "Electrical Pipes and Fittings",
      slug: "electrical-pipes-fittings",
      image: pipesFittingsImg,
      description: "PVC conduits, electrical pipes, junction boxes, and cable management fittings",
      itemCount: 95
    },
    {
      name: "Distribution Box",
      slug: "distribution-box",
      image: circuitBreakersImg,
      description: "MCB boxes, distribution boards, consumer units, and electrical panels",
      itemCount: 85
    },
    {
      name: "Led Bulb and Fittings",
      slug: "led-bulb-fittings",
      image: lightingImg,
      description: "LED bulbs, emergency lights, flood lights, street lights, and LED fittings",
      itemCount: 200
    }
  ];

  // Smart personalization logic for Deals Banner
  const categoryProducts = (categoryDealsData as any)?.products || [];
  const generalDeals = (dealsData as any)?.products || [];
  const featuredProducts = (productsData as any)?.products || [];
  const bestsellerProducts = (bestSellersData as any)?.products || [];

  const isPersonalized = hasHistory && categoryProducts.length > 0;
  const activeDeals = isPersonalized
    ? categoryProducts
    : generalDeals.length > 0
      ? generalDeals
      : featuredProducts.length > 0
        ? featuredProducts
        : bestsellerProducts;

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

      {/* Deals Banner - Smart Personalized / Curated Default */}
      <DealsBanner 
        products={activeDeals} 
        isPersonalized={isPersonalized} 
        personalizedCategory={topCategory} 
      />

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Link href="/account" className="bg-gray-50 hover:bg-gray-100 rounded-xl p-6 text-center transition-colors group">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-teal-200 transition-colors">
                <User className="text-teal-600 w-6 h-6" />
              </div>
              <h5 className="font-semibold text-gray-900 mb-1">My Orders</h5>
              <p className="text-sm text-gray-600">Track your recent purchases</p>
            </Link>

            <Link href="/account?tab=addresses" className="bg-gray-50 hover:bg-gray-100 rounded-xl p-6 text-center transition-colors group">
              <div className="w-12 h-12 bg-teal-light-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-teal-light-200 transition-colors">
                <MapPin className="text-teal-light-600 w-6 h-6" />
              </div>
              <h5 className="font-semibold text-gray-900 mb-1">Address Management</h5>
              <p className="text-sm text-gray-600">Manage your shipping addresses</p>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
