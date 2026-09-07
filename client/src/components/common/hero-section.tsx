import { SmartLink } from "@/components/navigation/smart-link";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight, ShoppingBag, ShieldCheck, Scissors, Zap } from "lucide-react";
import wireCollectionImg from "@assets/generated_images/Professional_wire_collection_display_676c5852.png";
import inverterBulbImg from "@assets/generated_images/LED_emergency_inverter_bulb_deb60b8a.png";

export function HeroSection() {
  return (
    <section className="relative min-h-[500px] bg-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Left Main Content - Store Image with Overlay */}
          <div className="lg:col-span-2 relative min-h-[450px] rounded-xl overflow-hidden bg-gradient-to-r from-slate-800 to-slate-900 shadow-md">

            {/* Store Front Content */}
            <div className="relative z-10 h-full flex items-center">
              <div className="w-full px-6 sm:px-8 py-10 sm:py-12">
                {/* Store Sign - Top Center */}
                <div className="text-center mb-6 sm:mb-8">
                  <div className="bg-gray-700/90 backdrop-blur-sm px-6 py-3 rounded-xl inline-block shadow-2xl border border-yellow-400">
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
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight">
                    India's <span className="text-yellow-400">Premier</span>
                    <br />
                    <span className="text-white">Electrical Megastore</span>
                  </h1>

                  {/* Location - Madurai Launch */}
                  <div className="space-y-1.5 mb-6">
                    <div className="flex items-center text-gray-200 text-base sm:text-lg">
                      <MapPin className="w-5 h-5 mr-2 text-yellow-400 flex-shrink-0" />
                      <span className="font-semibold">Based in Madurai, Tamil Nadu</span>
                    </div>
                    <p className="text-gray-300 text-sm ml-7">
                      Currently delivering within Madurai (625xxx) • Expanding across Tamil Nadu soon!
                    </p>
                  </div>

                  {/* Trust Highlights */}
                  <div className="flex flex-wrap gap-2.5 mb-8">
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/15 text-xs text-gray-200">
                      <ShieldCheck className="w-4 h-4 text-yellow-400" />
                      <span>100% Genuine Brands</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/15 text-xs text-gray-200">
                      <Scissors className="w-4 h-4 text-yellow-400" />
                      <span>Cut Wires by the Meter</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/15 text-xs text-gray-200">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span>Fast Doorstep Delivery</span>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-wrap items-center gap-4">
                    <Button
                      asChild
                      size="lg"
                      className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-7 py-4 text-base sm:text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      <SmartLink href="/products" className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        <span>Shop All Products</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </SmartLink>
                    </Button>

                    <Button
                      asChild
                      size="lg"
                      className="bg-slate-800/90 hover:bg-slate-700 text-white hover:text-yellow-300 border border-slate-600 hover:border-yellow-400 font-semibold px-6 py-4 text-base rounded-lg shadow-md transition-all duration-300"
                    >
                      <SmartLink href="/products?category=wires-cables" className="flex items-center gap-2">
                        <Scissors className="w-4 h-4 text-yellow-400" />
                        <span>Custom Cut Wires (5m+)</span>
                      </SmartLink>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Product Cards */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            {/* Top Card - Professional Wire Collection */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 flex-1 relative overflow-hidden rounded-xl border border-slate-700/60 shadow-md group min-h-[210px]">
              {/* Background Pattern */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:scale-105 transition-transform duration-500"
                style={{
                  backgroundImage: `url(${wireCollectionImg})`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-transparent" />

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="inline-block bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-2 tracking-wide uppercase">
                    Custom Cut or Full Coils
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight mb-1">
                    Wires & Cables
                  </h3>
                  <p className="text-gray-300 text-xs sm:text-sm line-clamp-2 mb-4">
                    Finolex & Kundan FR cables. Order exact meter cuts (5m+) or 90m coils.
                  </p>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold w-fit rounded-full px-5 shadow-sm group-hover:shadow"
                >
                  <SmartLink href="/products?category=wires-cables" className="flex items-center gap-1.5">
                    <span>Shop Wires</span>
                    <ArrowRight className="w-4 h-4" />
                  </SmartLink>
                </Button>
              </div>
            </div>

            {/* Bottom Card - Inverter Emergency Bulbs */}
            <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 text-white p-6 flex-1 relative overflow-hidden rounded-xl border border-orange-400/40 shadow-md group min-h-[210px]">
              {/* Background Texture */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-35 group-hover:scale-105 transition-transform duration-500"
                style={{
                  backgroundImage: `url(${inverterBulbImg})`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-orange-950/50 to-transparent" />

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="inline-block bg-white/20 text-white border border-white/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-2 tracking-wide uppercase backdrop-blur-sm">
                    ⚡ Power-Cut Backup
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight mb-1">
                    Inverter LED Bulbs
                  </h3>
                  <p className="text-orange-100 text-xs sm:text-sm line-clamp-2 mb-4">
                    Rechargeable LED bulbs with up to 6 hours battery backup during power cuts.
                  </p>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold w-fit rounded-full px-5 shadow-sm group-hover:shadow"
                >
                  <SmartLink href="/products?category=led-bulb-fittings" className="flex items-center gap-1.5">
                    <span>Shop Inverter Bulbs</span>
                    <ArrowRight className="w-4 h-4" />
                  </SmartLink>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
