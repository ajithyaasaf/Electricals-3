import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Clock, 
  Award, 
  Users, 
  Zap, 
  CheckCircle, 
  Star, 
  TrendingUp,
  Phone,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Types for component props and Firebase data
interface FeatureCardData {
  id: string;
  icon: string;
  title: string;
  benefit: string;
  stat?: {
    value: string;
    label: string;
  };
  order?: number;
}

interface WhyChooseData {
  headline: string;
  bulletReasons: string[];
  ctaText: string;
  features: FeatureCardData[];
  lastUpdated?: string;
}

interface WhyChooseSectionProps {
  // Optional props for SSR and customization
  features?: FeatureCardData[];
  realtimePath?: string;
  headline?: string;
  bulletReasons?: string[];
  ctaText?: string;
  className?: string;
}

// Icon mapping for dynamic icon rendering
const iconMap = {
  Shield,
  Clock,
  Award,
  Users,
  Zap,
  CheckCircle,
  Star,
  TrendingUp,
  Phone,
  MapPin,
};

// Default fallback data for SSR and initial render
const defaultData: WhyChooseData = {
  headline: "Why Choose CopperBear Electrical?",
  bulletReasons: [
    "Licensed professionals with 15+ years experience",
    "24/7 emergency service with 2-hour response time",
    "Quality guarantee with lifetime warranty coverage"
  ],
  ctaText: "Get Free Quote",
  features: [
    {
      id: "certified",
      icon: "Shield",
      title: "Certified Experts",
      benefit: "Licensed electricians you can trust",
      stat: { value: "98%", label: "Customer satisfaction" }
    },
    {
      id: "fast-service",
      icon: "Clock",
      title: "Fast Response",
      benefit: "Emergency service within 2 hours",
      stat: { value: "2hr", label: "Response time" }
    },
    {
      id: "warranty",
      icon: "Award",
      title: "Quality Guarantee",
      benefit: "Lifetime warranty on all work",
      stat: { value: "100%", label: "Work guaranteed" }
    },
    {
      id: "experience",
      icon: "Users",
      title: "Experienced Team",
      benefit: "15+ years serving customers",
      stat: { value: "15+", label: "Years experience" }
    },
    {
      id: "modern-solutions",
      icon: "Zap",
      title: "Modern Solutions",
      benefit: "Latest electrical technology",
      stat: { value: "5⭐", label: "Google rating" }
    },
    {
      id: "local-trusted",
      icon: "MapPin",
      title: "Local & Trusted",
      benefit: "Serving your community",
      stat: { value: "1000+", label: "Projects completed" }
    }
  ]
};

/**
 * Modern, accessible Why Choose CopperBear Electrical section
 * 
 * Features:
 * - Responsive grid layout (1 col mobile, 2 col md, 3 col lg)
 * - Real-time Firestore data integration
 * - Framer Motion animations
 * - Accessibility compliant (WCAG 2.1 AA)
 * - Server-side rendering support
 * 
 * Integration steps:
 * 1. Firebase Firestore listener setup:
 *    - Create collection: 'siteContent' 
 *    - Document ID: 'whyChooseSection'
 *    - Data structure: WhyChooseData interface
 * 
 * 2. Admin editing integration:
 *    - Use realtimePath prop: '/siteContent/whyChooseSection'
 *    - Admin can edit: headline, bulletReasons, ctaText, features array
 *    - Features support dynamic icons via iconMap
 * 
 * 3. Usage examples:
 *    <WhyChooseSection /> // Uses defaults
 *    <WhyChooseSection realtimePath="/siteContent/whyChooseSection" />
 *    <WhyChooseSection features={customFeatures} />
 */
const WhyChooseSection: React.FC<WhyChooseSectionProps> = ({
  features: propFeatures,
  realtimePath,
  headline: propHeadline,
  bulletReasons: propBulletReasons,
  ctaText: propCtaText,
  className = "",
}) => {
  const [data, setData] = useState<WhyChooseData>(() => ({
    ...defaultData,
    headline: propHeadline || defaultData.headline,
    bulletReasons: propBulletReasons || defaultData.bulletReasons,
    ctaText: propCtaText || defaultData.ctaText,
    features: propFeatures || defaultData.features,
  }));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Real-time Firestore listener setup
  useEffect(() => {
    if (!realtimePath || typeof window === 'undefined') return;
    
    setIsLoading(true);

    const initializeListener = async () => {
      try {
        const { doc, onSnapshot } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        
        // Parse the realtime path - expecting format like 'siteContent/whyChooseSection'
        const pathParts = realtimePath.split('/');
        if (pathParts.length < 2) {
          console.warn('[WHY CHOOSE] Invalid realtime path format:', realtimePath);
          setIsLoading(false);
          return;
        }
        
        const [collection, docId] = pathParts;
        
        console.log('[WHY CHOOSE] Setting up real-time listener for:', { collection, docId });
        
        const unsubscribe = onSnapshot(
          doc(db, collection, docId), 
          (docSnap) => {
            if (docSnap.exists()) {
              const firestoreData = docSnap.data() as WhyChooseData;
              console.log('[WHY CHOOSE] Real-time update received:', firestoreData);
              
              setData(prevData => ({ 
                ...prevData, 
                ...firestoreData,
                lastUpdated: new Date().toISOString()
              }));
            } else {
              console.log('[WHY CHOOSE] Document does not exist, using defaults');
            }
            setIsLoading(false);
          },
          (error) => {
            console.error('[WHY CHOOSE] Error listening to real-time updates:', error);
            setIsLoading(false);
          }
        );

        return unsubscribe;
      } catch (error) {
        console.error('[WHY CHOOSE] Failed to initialize Firebase listener:', error);
        setIsLoading(false);
      }
    };
    
    let cleanup: (() => void) | undefined;
    
    initializeListener().then(unsubscribe => {
      cleanup = unsubscribe;
    });

    return () => {
      if (cleanup) {
        cleanup();
        console.log('[WHY CHOOSE] Real-time listener cleaned up');
      }
    };
  }, [realtimePath]);

  // Removed animations for consistency with rest of website

  // Render dynamic icon
  const renderIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Shield;
    return <IconComponent className="h-6 w-6" aria-hidden="true" />;
  };

  // Feature card component with accessibility
  const FeatureCard: React.FC<{ feature: FeatureCardData; index: number }> = ({ feature, index }) => (
    <div className="group">
      <Card 
        className="h-full transition-all duration-200 hover:shadow-lg focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary cursor-pointer"
        tabIndex={0}
        role="article"
        aria-labelledby={`feature-title-${feature.id}`}
        aria-describedby={`feature-benefit-${feature.id}`}
        data-testid={`feature-card-${feature.id}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            // Handle card interaction if needed
          }
        }}
      >
        <CardContent className="p-6 text-center">
          {/* Icon */}
          <div 
            className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4 group-hover:bg-primary/15 transition-colors"
            aria-hidden="true"
          >
            {renderIcon(feature.icon)}
          </div>
          
          {/* Title */}
          <h3 
            id={`feature-title-${feature.id}`}
            className="text-lg font-semibold text-foreground mb-2"
          >
            {feature.title}
          </h3>
          
          {/* Benefit */}
          <p 
            id={`feature-benefit-${feature.id}`}
            className="text-sm text-muted-foreground mb-3 line-clamp-2"
          >
            {feature.benefit}
          </p>
          
          {/* Stat */}
          {feature.stat && (
            <div className="text-center" aria-label={`Statistic: ${feature.stat.value} ${feature.stat.label}`}>
              <div className="text-xl font-bold text-primary" data-testid={`stat-value-${feature.id}`}>
                {feature.stat.value}
              </div>
              <div className="text-xs text-muted-foreground" data-testid={`stat-label-${feature.id}`}>
                {feature.stat.label}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading) {
    return (
      <section className={`py-16 ${className}`} aria-label="Why Choose CopperBear Loading">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className={`py-16 bg-background ${className}`}
      aria-labelledby="why-choose-heading"
      data-testid="why-choose-section"
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-12 items-start">
          {/* Hero Content - Left Side */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h2 
                id="why-choose-heading"
                className="text-3xl lg:text-4xl font-bold text-foreground mb-4"
                data-testid="section-headline"
              >
                {data.headline}
              </h2>
              
              {/* Bullet Points */}
              <ul className="space-y-3" role="list" aria-label="Key reasons to choose CopperBear">
                {data.bulletReasons.map((reason, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3"
                    data-testid={`bullet-reason-${index}`}
                  >
                    <CheckCircle 
                      className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" 
                      aria-hidden="true" 
                    />
                    <span className="text-muted-foreground leading-relaxed">
                      {reason}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button with Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg"
                  className="w-full sm:w-auto"
                  data-testid="cta-button"
                  aria-describedby="cta-description"
                >
                  {data.ctaText}
                </Button>
              </DialogTrigger>
              <DialogContent 
                className="sm:max-w-md"
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
              >
                <DialogHeader>
                  <DialogTitle id="modal-title">
                    Get Your Free Quote
                  </DialogTitle>
                  <DialogDescription id="modal-description">
                    Contact our certified electricians for a free consultation and quote.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Phone className="h-5 w-5 text-primary" aria-hidden="true" />
                    <div>
                      <div className="font-medium">Call Us Now</div>
                      <div className="text-sm text-muted-foreground">9944 325858</div>
                    </div>
                  </div>
                  <div className="text-center text-sm text-muted-foreground">
                    Or submit a request through our contact form and we'll get back to you within 24 hours.
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <div id="cta-description" className="sr-only">
              Opens a modal with contact information to get a free quote
            </div>
          </div>

          {/* Feature Cards Grid - Right Side */}
          <div className="lg:col-span-2">
            <div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              role="list"
              aria-label="CopperBear features and benefits"
            >
              {data.features
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((feature, index) => (
                  <div key={feature.id} role="listitem">
                    <FeatureCard feature={feature} index={index} />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;