import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[500px] bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-full">
          
          {/* Left Main Content - Store Image with Overlay */}
          <div className="lg:col-span-2 relative min-h-[500px]">
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
            
            {/* Store Front Mockup */}
            <div className="relative z-10 h-full flex items-center justify-center">
              <div className="text-center max-w-2xl mx-auto px-8">
                {/* Store Sign */}
                <div className="bg-gray-800 px-8 py-4 rounded-lg mb-8 inline-block border-4 border-yellow-400">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-black font-bold text-xl">C</span>
                    </div>
                    <div className="text-yellow-400 text-3xl lg:text-4xl font-bold tracking-wider">
                      COPPERBEAR ELECTRICAL
                    </div>
                  </div>
                  <div className="text-white text-sm mt-2 tracking-widest">
                    EVERY WIRE, EVERY HOME
                  </div>
                </div>
                
                {/* Product Categories */}
                <div className="bg-yellow-400 text-black px-6 py-4 rounded-lg mb-8 text-left inline-block">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm font-semibold">
                    <div>FLOOR & WALL DECOR</div>
                    <div>TILES</div>
                    <div>LAMINATES</div>
                    <div>PLYWOOD</div>
                    <div>WOODEN FLOORING</div>
                    <div>LOUVERS</div>
                    <div>WALLPAPER</div>
                    <div>WALL PANELS</div>
                    <div></div>
                    <div>QUARTZ</div>
                  </div>
                </div>
                
                {/* Main Headline */}
                <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                  America's <span className="text-yellow-400">Biggest</span>
                  <br />
                  Electrical Megastore
                </h1>
                
                {/* Location */}
                <div className="flex items-center justify-center text-white text-lg mb-8">
                  <MapPin className="w-5 h-5 mr-2 text-yellow-400" />
                  Now in Los Angeles & San Francisco, California.
                </div>
                
                {/* CTA Button */}
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link href="/products">Book Your Visit Now</Link>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Right Content - Product Cards */}
          <div className="lg:col-span-1 flex flex-col">
            
            {/* Top Card - Tropical Tile Collection */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 flex-1 relative overflow-hidden">
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
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 flex-1 relative overflow-hidden">
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