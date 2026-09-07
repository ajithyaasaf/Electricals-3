import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/common/hero-section";
import { BannerSlider } from "@/components/common/banner-slider";
import { Testimonials } from "@/components/common/testimonials";
import { DealsBanner } from "@/components/common/deals-banner";
import { VisualCategoryCards } from "@/components/common/visual-category-cards";
import { HorizontalProductSection } from "@/components/common/horizontal-product-section";
import { useUserInterest } from "@/hooks/use-user-interest";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useCategories } from "@/features/products/hooks/useProducts";
import { CATEGORIES } from "@/lib/constants";
import { getOptimizedImageUrl } from "@/lib/performance";
import WhyChooseSection from "@/components/common/why-choose-section";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Zap, Shield, Clock, Star, ArrowRight, Users, Award, MapPin } from "lucide-react";

import circuitBreakersImg from "@assets/generated_images/Circuit_breakers_electrical_panel_ed1b7697.png";
import wiringCablesImg from "@assets/generated_images/Electrical_copper_wire_coils_aeb7f45b.png";
import toolsImg from "@assets/generated_images/Professional_electrical_tools_collection_b4db75d8.png";
import lightingImg from "@assets/generated_images/LED_street_light_fixture_4dde50e8.png";
import wireCoilImg from "@assets/generated_images/Finolex_2.5sqmm_wire_coil_072a94ff.png";
import pipesFittingsImg from "@assets/generated_images/Electrical_material_samples_bb4fe5fd.png";

export default function Landing() {
  const { topCategory, hasHistory } = useUserInterest();

  const { data: dealsData } = useQuery({
    queryKey: ["/api/products", { hasDiscount: true, limit: 4 }],
  });

  const { data: categoryDealsData } = useQuery({
    queryKey: ["/api/products", { category: topCategory, limit: 4 }],
    enabled: !!topCategory,
  });

  const { data: productsData } = useQuery({
    queryKey: ["/api/products", { featured: true, limit: 12 }],
  });

  const categoryProducts = (categoryDealsData as any)?.products || [];
  const generalDeals = (dealsData as any)?.products || [];
  const featuredProducts = (productsData as any)?.products || [];

  const isPersonalized = hasHistory && categoryProducts.length > 0;
  const activeDeals = isPersonalized ? categoryProducts : (generalDeals.length > 0 ? generalDeals : featuredProducts);

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

  const features = [
    {
      icon: <Shield className="w-8 h-8 text-teal-600" />,
      title: "Licensed & Insured",
      description: "All our electricians are fully licensed, insured, and background-checked professionals."
    },
    {
      icon: <Clock className="w-8 h-8 text-teal-light-600" />,
      title: "Fast Service",
      description: "Same-day service available for most electrical repairs and installations."
    },
    {
      icon: <Star className="w-8 h-8 text-teal-600" />,
      title: "Quality Guaranteed",
      description: "Premium electrical products with manufacturer warranties and professional installation."
    }
  ];

  const productHighlights = [
    {
      name: "Circuit Breakers",
      description: "Professional-grade circuit breakers from top manufacturers",
      image: circuitBreakersImg
    },
    {
      name: "Electrical Tools", 
      description: "High-quality tools for electrical professionals and DIY enthusiasts",
      image: toolsImg
    },
    {
      name: "Wiring & Cables",
      description: "Complete selection of electrical wiring and cables for all applications",
      image: wiringCablesImg
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
      {/* Hero Banner Slider - Amazon/Flipkart Style */}
      <div className="bg-gray-50 py-8 px-4 md:px-6 lg:px-8">
        <BannerSlider 
          autoPlayInterval={5000}
          showControls={true}
          showDots={true}
        />
      </div>

      {/* Hero Section */}
      <HeroSection />

      {/* Today's Deals Banner */}
      <DealsBanner 
        products={activeDeals} 
        isPersonalized={isPersonalized} 
        personalizedCategory={topCategory} 
      />

      {/* Why Choose CopperBear Section - Landing Version */}
      <WhyChooseSection 
        headline="Why CopperBear is Your Trusted Electrical Partner"
        bulletReasons={[
          "15+ years serving homeowners and businesses",
          "Licensed, insured professionals you can trust", 
          "24/7 emergency service - we're always here"
        ]}
        ctaText="Get Started Today"
        features={[
          {
            id: "trusted-experts",
            icon: "Shield",
            title: "Trusted Experts",
            benefit: "Licensed & insured professionals",
            stat: { value: "98%", label: "Customer satisfaction" }
          },
          {
            id: "fast-response", 
            icon: "Clock",
            title: "Fast Response",
            benefit: "Same-day service available",
            stat: { value: "2hr", label: "Response time" }
          },
          {
            id: "quality-work",
            icon: "Award", 
            title: "Quality Work",
            benefit: "Guaranteed workmanship",
            stat: { value: "100%", label: "Work guaranteed" }
          },
          {
            id: "experienced-team",
            icon: "Users",
            title: "Experienced Team", 
            benefit: "15+ years in electrical",
            stat: { value: "15+", label: "Years experience" }
          },
          {
            id: "local-business",
            icon: "MapPin",
            title: "Local Business",
            benefit: "Serving your community", 
            stat: { value: "1000+", label: "Projects completed" }
          },
          {
            id: "modern-solutions",
            icon: "Zap",
            title: "Modern Solutions", 
            benefit: "Latest electrical technology",
            stat: { value: "5⭐", label: "Google rating" }
          }
        ]}
        className="bg-white"
      />

      {/* Visual Category Cards */}
      <VisualCategoryCards categories={visualCategories} />

      {/* Featured Electrical Catalog */}
      <HorizontalProductSection
        title="Featured Electrical Catalog"
        products={featuredProducts}
        viewAllLink="/products"
        showPrices={true}
      />

      {/* CTA Section */}
      <section className="py-16 bg-teal-700">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
            Sign in to access our full catalog, get personalized recommendations, and book professional services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-teal-700 hover:bg-gray-100"
              onClick={() => window.location.href = "/api/login"}
            >
              Sign In to Shop
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="border-white text-white bg-transparent hover:bg-white hover:text-teal-700 font-medium"
            >
              <Link href="/services">Book a Service</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />
      </main>

      <Footer />
    </div>
  );
}
