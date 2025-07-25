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

      {/* TEST - Amazon-style sections for Landing Page */}
      <section className="bg-white py-8 border-t-4 border-red-500">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-red-600 mb-4">🚀 AMAZON-STYLE SECTIONS ARE NOW ACTIVE! 🚀</h2>
          <p className="text-center text-gray-600">If you can see this red banner, the new sections are working on the Landing page!</p>
        </div>
      </section>

      {/* Today's Deals - Amazon Style */}
      <section className="bg-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-900">Today's Deals</h2>
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">Limited Time</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Featured Deal */}
            <div className="lg:col-span-2">
              <div className="relative bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-100">
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-red-500 text-white px-3 py-1 text-sm font-bold rounded">30% OFF</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-gray-900">Professional Electrical Tool Kit</h3>
                    <p className="text-gray-600">Complete 50-piece electrician tool set with case</p>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-red-600">$209.99</span>
                      <span className="text-lg text-gray-500 line-through">$299.99</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-orange-600">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">Ends in 2h 45m</span>
                    </div>
                    <Button className="bg-red-600 hover:bg-red-700 text-white font-medium">Shop Deal Now</Button>
                  </div>
                  <div>
                    <img
                      src="https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"
                      alt="Professional Tool Kit"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Smaller Deals */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="relative mb-3">
                  <img
                    src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=128"
                    alt="Smart Circuit Breaker" 
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">25% OFF</span>
                </div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Smart Circuit Breaker</h4>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-red-600">$67.49</span>
                  <span className="text-sm text-gray-500 line-through">$89.99</span>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="relative mb-3">
                  <img
                    src="https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=128"
                    alt="LED Work Lights"
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">40% OFF</span>
                </div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">LED Work Light Set</h4>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-red-600">$47.99</span>
                  <span className="text-sm text-gray-500 line-through">$79.99</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <Link href="/products" className="inline-flex items-center gap-2 text-copper-600 hover:text-copper-700 font-medium">
              <Zap className="w-4 h-4" />
              View All Deals & Offers
            </Link>
          </div>
        </div>
      </section>

      {/* Best Sellers - Horizontal Scrolling */}
      <section className="bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Best Sellers in Electrical</h2>
            <Link href="/products" className="text-copper-600 hover:text-copper-700 font-medium text-sm">See all →</Link>
          </div>
          
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {[
              { name: "Digital Multimeter", price: 89.99, image: "https://images.unsplash.com/photo-1581092918007-4e6e9c0f5a7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=160", rating: 4.8 },
              { name: "Wire Strippers", price: 34.99, image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=160", rating: 4.6 },
              { name: "Circuit Breaker", price: 45.99, image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=160", rating: 4.7 },
              { name: "LED Work Light", price: 67.99, image: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=160", rating: 4.5 },
              { name: "Electrical Tape Set", price: 12.99, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=160", rating: 4.4 },
              { name: "Voltage Tester", price: 28.99, image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=160", rating: 4.6 }
            ].map((product, index) => (
              <Link key={index} href="/products" className="flex-shrink-0 w-48 group cursor-pointer">
                <div className="h-full border-0 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white rounded-lg p-3">
                  <div className="relative mb-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-copper-600 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-xs ${i < product.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">({product.rating})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">${product.price}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

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
