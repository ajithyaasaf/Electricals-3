import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
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
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/ui/lazy-image";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, Wrench, ClipboardCheck, Tag, Clock, Shield, Phone, User, Heart, Calendar, Settings, MapPin } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { useCategories } from "@/features/products/hooks/useProducts";
import { getOptimizedImageUrl } from "@/lib/performance";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { formatPrice } from "@/lib/currency";
import { useSEO } from "@/hooks/use-seo";
import { useUserInterest } from "@/hooks/use-user-interest";

export default function Home() {
  const { user, isAuthenticated } = useFirebaseAuth();
  const { topCategory, hasHistory } = useUserInterest();

  // SEO optimization for homepage
  useSEO();

  // Fetch featured products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products", { featured: true, limit: 8 }],
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

  // Dynamic categories from database
  const { data: dbCategories = [] } = useCategories();

  // Visual category cards data matching active store categories with live products
  const visualCategories = useMemo(() => {
    // Only show categories that have live products (productCount > 0)
    // Categories with 0 products remain hidden until products are added to them in Admin
    const activeCategories = dbCategories.filter((cat) => (cat.productCount ?? 0) > 0);

    // Prioritize active categories by inventory size
    const sorted = [...activeCategories].sort(
      (a, b) => (b.productCount ?? 0) - (a.productCount ?? 0)
    );

    return sorted.map((cat) => {
      return {
        name: cat.name,
        slug: cat.slug,
        image: cat.imageUrl || "/api/placeholder/400/200",
        description: cat.description || "High performance electrical supplies",
        itemCount: cat.productCount || 0,
        featured: true, // Show active categories prominently
      };
    });
  }, [dbCategories]);

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

      {/* Why Choose CopperBear Section */}
      <WhyChooseSection
        realtimePath="siteContent/whyChooseSection"
        className="bg-gray-50"
      />
      <Footer />
    </div>
  );
}
