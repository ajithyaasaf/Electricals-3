import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { SmartLink } from '@/components/navigation/smart-link';
import { ChevronLeft, ChevronRight, Zap, Shield, Wrench, Tag, Clock, Star } from 'lucide-react';
import { formatPrice } from '@/lib/currency';

interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
  backgroundColor: string;
  textColor: string;
  discount?: string;
  originalPrice?: number;
  salePrice?: number;
  badge?: string;
  icon?: React.ReactNode;
}

const bannerSlides: BannerSlide[] = [
  {
    id: '1',
    title: 'Mega Electrical Sale',
    subtitle: 'Up to 50% Off Professional Tools',
    description: 'Premium electrical tools, circuit breakers, and safety equipment at unbeatable prices. Limited time offer!',
    ctaText: 'Shop Sale Now',
    ctaLink: '/products?sale=true',
    backgroundImage: '/assets/generated_images/Electrical_megastore_sale_banner_7e83386a.png',
    backgroundColor: 'from-red-600 to-orange-600',
    textColor: 'text-white',
    discount: '50% OFF',
    originalPrice: 24999,
    salePrice: 12499,
    badge: 'Limited Time',
    icon: <Tag className="w-6 h-6" />
  },
  {
    id: '2', 
    title: 'Smart Home Revolution',
    subtitle: 'IoT Electrical Solutions',
    description: 'Transform your home with smart switches, outlets, and automation systems. Professional installation available.',
    ctaText: 'Explore Smart Solutions',
    ctaLink: '/products?category=smart-home',
    backgroundImage: '/assets/generated_images/Smart_home_electrical_banner_98c775b6.png',
    backgroundColor: 'from-blue-600 to-purple-600',
    textColor: 'text-white',
    badge: 'Trending',
    icon: <Zap className="w-6 h-6" />
  },
  {
    id: '3',
    title: 'Professional Installation Services',
    subtitle: 'Licensed Electricians Available',
    description: 'Same-day electrical installation and repair services. All work comes with warranty protection.',
    ctaText: 'Book Service Now',
    ctaLink: '/services',
    backgroundImage: '/assets/generated_images/Electrician_services_banner_3560a23f.png',
    backgroundColor: 'from-green-600 to-teal-600',
    textColor: 'text-white',
    badge: 'Same Day',
    icon: <Wrench className="w-6 h-6" />
  },
  {
    id: '4',
    title: 'Safety First Equipment',
    subtitle: 'GFCI & Circuit Protection',
    description: 'Protect your property with professional-grade safety equipment. Circuit breakers, GFCI outlets, and more.',
    ctaText: 'Shop Safety Equipment',
    ctaLink: '/products?category=safety-protection',
    backgroundImage: '/assets/generated_images/Electrical_safety_equipment_banner_06b0b679.png',
    backgroundColor: 'from-yellow-500 to-orange-500',
    textColor: 'text-white',
    badge: 'Essential',
    icon: <Shield className="w-6 h-6" />
  },
  {
    id: '5',
    title: 'Contractor Special Pricing',
    subtitle: 'Bulk Orders Welcome',
    description: 'Special wholesale pricing for contractors and professionals. Volume discounts and priority delivery available.',
    ctaText: 'Get Wholesale Pricing',
    ctaLink: '/wholesale',
    backgroundImage: '/assets/generated_images/Contractor_wholesale_banner_3b7204a4.png',
    backgroundColor: 'from-copper-600 to-amber-600',
    textColor: 'text-white',
    badge: 'Wholesale',
    icon: <Star className="w-6 h-6" />
  }
];

interface BannerSliderProps {
  autoPlayInterval?: number;
  showControls?: boolean;
  showDots?: boolean;
}

export function BannerSlider({ 
  autoPlayInterval = 5000, 
  showControls = true, 
  showDots = true 
}: BannerSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Simple navigation functions
  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  const handleGoToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isPaused && autoPlayInterval > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
      }, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [isPaused, autoPlayInterval]);

  const currentBanner = bannerSlides[currentSlide];

  return (
    <section 
      className="relative h-[160px] sm:h-[180px] md:h-[200px] lg:h-[200px] overflow-hidden rounded-lg mx-auto max-w-7xl shadow-sm w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      data-testid="banner-slider"
    >
      {/* Background with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-in-out transform w-full h-full"
        style={{ backgroundImage: `url('${currentBanner.backgroundImage}')` }}
      >
      </div>


      {/* Navigation Controls */}
      {showControls && (
        <>
          <button
            onClick={handlePrevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm p-4 rounded-full transition-all duration-200 group shadow-lg hover:shadow-xl z-20"
            data-testid="banner-prev-button"
            aria-label="Previous slide"
            style={{ border: '2px solid rgba(255,255,255,0.3)' }}
          >
            <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-200" />
          </button>

          <button
            onClick={handleNextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm p-4 rounded-full transition-all duration-200 group shadow-lg hover:shadow-xl z-20"
            data-testid="banner-next-button"
            aria-label="Next slide"
            style={{ border: '2px solid rgba(255,255,255,0.3)' }}
          >
            <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-200" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {showDots && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleGoToSlide(index)}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125 shadow-lg' 
                  : 'bg-white/50 hover:bg-white/70 hover:scale-110'
              }`}
              data-testid={`banner-dot-${index}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
        <div 
          className="h-full bg-white transition-all duration-100 ease-linear"
          style={{ 
            width: isPaused ? '100%' : '0%'
          }}
        />
      </div>
    </section>
  );
}