import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[500px] bg-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          
          {/* Left Main Content - Store Image with Overlay */}
          <div className="lg:col-span-2 relative min-h-[450px] rounded-lg overflow-hidden">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600')`
              }}
            >
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>
            
            {/* Store Front Content */}
            <div className="relative z-10 h-full flex items-center">
              <div className="w-full px-8 py-12">
                
                {/* Store Sign - Top Center */}
                <div className="text-center mb-8">
                  <div className="bg-gray-700 backdrop-blur-sm bg-opacity-90 px-6 py-3 rounded-xl inline-block shadow-2xl border border-yellow-400">
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-black font-bold text-lg">C</span>
                      </div>
                      <div className="text-yellow-400 text-2xl lg:text-3xl font-bold tracking-wide">
                        COPPERBEAR ELECTRICAL
                      </div>
                    </div>
                    <div className="text-gray-200 text-xs mt-1 tracking-widest">
                      EVERY WIRE, EVERY HOME
                    </div>
                  </div>
                </div>
                
                {/* Main Content - Centered */}
                <div className="text-left max-w-4xl">
                  {/* Main Headline */}
                  <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight">
                    America's <span className="text-yellow-400">Biggest</span>
                    <br />
                    <span className="text-white">Electrical Megastore</span>
                  </h1>
                  
                  {/* Location */}
                  <div className="flex items-center text-gray-200 text-lg mb-8">
                    <MapPin className="w-5 h-5 mr-2 text-yellow-400" />
                    Now in Los Angeles & San Francisco, California.
                  </div>
                  
                  {/* CTA Button */}
                  <Button 
                    asChild 
                    size="lg" 
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Link href="/products">Book Your Visit Now</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Content - Product Cards */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            
            {/* Top Card - Tropical Tile Collection */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 flex-1 relative overflow-hidden rounded-lg">
              {/* Background Pattern */}
              <div 
                className="absolute right-0 top-0 w-full h-full bg-cover bg-center opacity-30"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300')`
                }}
              ></div>
              
              {/* Circular Element */}
              <div className="absolute top-4 right-4 w-20 h-20 bg-gray-600 rounded-full opacity-80"></div>
              
              <div className="relative z-10 h-full flex flex-col justify-center">
                <h3 className="text-2xl font-bold mb-2">Professional Wire</h3>
                <h3 className="text-2xl font-bold mb-4">Collection</h3>
                <p className="text-gray-300 mb-6 text-sm">
                  Premium cables<br />
                  for your electrical projects.
                </p>
                <Button 
                  asChild 
                  size="sm" 
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold w-fit rounded-full px-6"
                >
                  <Link href="/products?category=wiring-cables">Shop Now</Link>
                </Button>
              </div>
            </div>
            
            {/* Bottom Card - Material Samples */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 flex-1 relative overflow-hidden rounded-lg">
              {/* Background Texture */}
              <div 
                className="absolute right-0 top-0 w-full h-full bg-cover bg-center opacity-40"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300')`
                }}
              ></div>
              
              <div className="relative z-10 h-full flex flex-col justify-center">
                <h3 className="text-xl font-bold mb-2">Choose better with</h3>
                <h2 className="text-2xl font-bold text-orange-100 mb-4">Professional Samples</h2>
                <p className="text-orange-100 mb-6 text-sm">
                  Get them delivered<br />
                  straight to your home.
                </p>
                <Button 
                  asChild 
                  size="sm" 
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold w-fit rounded-full px-6"
                >
                  <Link href="/services">Order your samples online</Link>
                </Button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}