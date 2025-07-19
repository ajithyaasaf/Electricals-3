import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPin, Zap, Star } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[600px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-50">
        <div className="w-full h-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v20h2v2H20v-1.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2z'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 h-full flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
          
          {/* Left Content */}
          <div className="text-white space-y-8">
            {/* Brand Badge */}
            <div className="inline-flex items-center bg-amber-500 text-black px-4 py-2 rounded-full font-bold text-sm">
              <Zap className="w-4 h-4 mr-2" />
              COPPERBEAR ELECTRICAL
            </div>
            
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                America's Biggest
                <br />
                <span className="text-amber-400">Electrical Megastore</span>
              </h1>
              
              {/* Location */}
              <div className="flex items-center text-slate-300 text-lg">
                <MapPin className="w-5 h-5 mr-2 text-amber-400" />
                Now in Los Angeles & San Francisco, California.
              </div>
            </div>
            
            {/* CTA Button */}
            <Button 
              asChild 
              size="lg" 
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-8 py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href="/products">Shop Now</Link>
            </Button>
          </div>
          
          {/* Right Content - Product Showcase Cards */}
          <div className="grid grid-cols-1 gap-6">
            
            {/* Featured Product Card 1 */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 rounded-xl shadow-2xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-8 translate-x-8"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2">Professional Wire Collection</h3>
                <p className="text-emerald-100 mb-4">Premium quality cables for your electrical projects.</p>
                <Button 
                  asChild 
                  size="sm" 
                  className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold"
                >
                  <Link href="/products?category=wiring-cables">Shop Now</Link>
                </Button>
              </div>
            </div>
            
            {/* Featured Product Card 2 */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6 rounded-xl shadow-2xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -translate-y-4 translate-x-4"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Choose better with</h3>
                <h2 className="text-2xl font-bold text-orange-200 mb-2">Professional Samples</h2>
                <p className="text-orange-100 mb-4">Get them delivered straight to your home.</p>
                <Button 
                  asChild 
                  size="sm" 
                  className="bg-white text-orange-700 hover:bg-orange-50 font-semibold"
                >
                  <Link href="/services">Order your samples online</Link>
                </Button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
      
      {/* Bottom Features Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center lg:justify-between items-center text-white text-sm space-y-2 lg:space-y-0">
            <div className="flex items-center space-x-6">
              <span className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-amber-400" />
                Premium Quality Products
              </span>
              <span className="hidden md:block">•</span>
              <span className="flex items-center">
                <Zap className="w-4 h-4 mr-1 text-amber-400" />
                Professional Installation
              </span>
              <span className="hidden md:block">•</span>
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-amber-400" />
                Local Electrical Experts
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
