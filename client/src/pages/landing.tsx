import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/common/hero-section";
import { BannerSlider } from "@/components/common/banner-slider";
import { Testimonials } from "@/components/common/testimonials";
import WhyChooseSection from "@/components/common/why-choose-section";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Zap, Shield, Clock, Star, ArrowRight, Users, Award, MapPin } from "lucide-react";

export default function Landing() {
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
      image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=400&fit=crop&auto=format"
    },
    {
      name: "Electrical Tools", 
      description: "High-quality tools for electrical professionals and DIY enthusiasts",
      image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=400&fit=crop&auto=format"
    },
    {
      name: "Wiring & Cables",
      description: "Complete selection of electrical wiring and cables for all applications",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&auto=format"
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

      {/* Product Highlights */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Premium Electrical Products
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our comprehensive selection of electrical products from trusted manufacturers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {productHighlights.map((product, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <Link href="/products" className="text-teal-600 hover:text-teal-700 font-medium inline-flex items-center">
                    Shop Now <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700 text-white">
              <Link href="/products">Browse All Products</Link>
            </Button>
          </div>
        </div>
      </section>

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
