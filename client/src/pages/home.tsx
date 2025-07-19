import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/common/hero-section";
import { Testimonials } from "@/components/common/testimonials";
import { ProductGrid } from "@/components/product/product-grid";
import { ServiceCard } from "@/components/service/service-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, Wrench, ClipboardCheck, Tag, Clock, Shield, Phone } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

export default function Home() {
  // Fetch featured products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products", { featured: true, limit: 8 }],
  });

  // Fetch services
  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/services", { limit: 3 }],
  });

  const productCategories = [
    {
      name: "Circuit Breakers",
      slug: "circuit-breakers",
      image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      color: "from-copper-100 to-copper-200"
    },
    {
      name: "Wiring & Cables", 
      slug: "wiring-cables",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      color: "from-electric-blue-100 to-electric-blue-200"
    },
    {
      name: "Electrical Tools",
      slug: "electrical-tools", 
      image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      color: "from-orange-100 to-orange-200"
    },
    {
      name: "Panels & Boxes",
      slug: "panels-boxes",
      image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100", 
      color: "from-gray-100 to-gray-200"
    },
    {
      name: "Outlets & Switches",
      slug: "outlets-switches",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      color: "from-green-100 to-green-200"
    },
    {
      name: "Professional Services",
      slug: "services",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      color: "from-purple-100 to-purple-200"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Product Categories */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Shop by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {productCategories.map((category) => (
              <Link
                key={category.slug}
                href={category.slug === "services" ? "/services" : `/products?category=${category.slug}`}
                className="text-center group cursor-pointer"
              >
                <div className={`w-20 h-20 mx-auto mb-3 bg-gradient-to-r ${category.color} rounded-full flex items-center justify-center group-hover:shadow-md transition-all duration-300`}>
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </div>
                <p className="text-sm font-medium text-gray-900 group-hover:text-copper-600 transition-colors">
                  {category.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Best-Selling Electrical Products</h3>
            <Link href="/products" className="text-copper-600 hover:text-copper-700 font-medium">
              View all products →
            </Link>
          </div>
          
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-4">
                  <Skeleton className="w-full h-48 mb-4" />
                  <Skeleton className="w-3/4 h-4 mb-2" />
                  <Skeleton className="w-1/2 h-4 mb-4" />
                  <Skeleton className="w-full h-10" />
                </div>
              ))}
            </div>
          ) : (
            <ProductGrid products={productsData?.products || []} />
          )}
        </div>
      </section>

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
              {servicesData?.services?.slice(0, 3).map((service) => (
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
