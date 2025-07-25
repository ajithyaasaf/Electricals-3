import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/common/hero-section";
import { Testimonials } from "@/components/common/testimonials";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Zap, Shield, Clock, Star, ArrowRight } from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-copper-600" />,
      title: "Licensed & Insured",
      description: "All our electricians are fully licensed, insured, and background-checked professionals."
    },
    {
      icon: <Clock className="w-8 h-8 text-electric-blue-600" />,
      title: "Fast Service",
      description: "Same-day service available for most electrical repairs and installations."
    },
    {
      icon: <Star className="w-8 h-8 text-green-600" />,
      title: "Quality Guaranteed",
      description: "Premium electrical products with manufacturer warranties and professional installation."
    }
  ];

  const productHighlights = [
    {
      name: "Circuit Breakers",
      description: "Professional-grade circuit breakers from top manufacturers",
      image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"
    },
    {
      name: "Electrical Tools", 
      description: "High-quality tools for electrical professionals and DIY enthusiasts",
      image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"
    },
    {
      name: "Wiring & Cables",
      description: "Complete selection of electrical wiring and cables for all applications",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose CopperBear Electrical?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional electrical solutions backed by expertise, quality products, and exceptional service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
                  <Link href="/products" className="text-copper-600 hover:text-copper-700 font-medium inline-flex items-center">
                    Shop Now <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="bg-copper-600 hover:bg-copper-700 text-white">
              <Link href="/products">Browse All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-copper-700">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-copper-100 mb-8 max-w-2xl mx-auto">
            Sign in to access our full catalog, get personalized recommendations, and book professional services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-copper-700 hover:bg-gray-100"
              onClick={() => window.location.href = "/api/login"}
            >
              Sign In to Shop
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-copper-700"
            >
              <Link href="/services">Book a Service</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      <Footer />
    </div>
  );
}
