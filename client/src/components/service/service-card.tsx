import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatPrice } from "@/lib/currency";
import { Clock, Star, Calendar } from "lucide-react";
import type { ServiceWithCategory } from "@/lib/types";

interface ServiceCardProps {
  service: ServiceWithCategory;
  showCategory?: boolean;
}

export function ServiceCard({ service, showCategory = false }: ServiceCardProps) {
  const { isAuthenticated } = useFirebaseAuth();
  const { toast } = useToast();

  const bookServiceMutation = useMutation({
    mutationFn: async () => {
      // This would navigate to booking page
      window.location.href = `/services/${service.slug}?book=true`;
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Please sign in",
          description: "You need to sign in to book services.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
    },
  });

  const handleBookService = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to book services.",
        variant: "destructive",
      });
      return;
    }

    bookServiceMutation.mutate();
  };

  const imageUrl = service.imageUrl || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300";
  const rating = parseFloat(service.rating || "0");
  const reviewCount = service.reviewCount || 0;
  const startingPrice = parseFloat(service.startingPrice);
  const duration = service.duration ? `${Math.floor(service.duration / 60)}h ${service.duration % 60}m` : null;

  const categoryColors = {
    "installation-services": "from-teal-50 to-teal-100",
    "repair-maintenance": "from-teal-light-50 to-teal-light-100", 
    "electrical-consulting": "from-teal-50 to-teal-light-50",
  };

  const buttonColors = {
    "installation-services": "bg-teal-600 hover:bg-teal-700",
    "repair-maintenance": "bg-teal-light-600 hover:bg-teal-light-700",
    "electrical-consulting": "bg-teal-600 hover:bg-teal-700",
  };

  const categorySlug = service.category?.slug || "installation-services";
  const cardBg = categoryColors[categorySlug as keyof typeof categoryColors] || categoryColors["installation-services"];
  const buttonColor = buttonColors[categorySlug as keyof typeof buttonColors] || buttonColors["installation-services"];

  return (
    <div className={`bg-gradient-to-br ${cardBg} rounded-xl p-6 hover:shadow-lg transition-shadow duration-300`}>
      <Link href={`/services/${service.slug}`}>
        <div className="mb-4">
          <img
            src={imageUrl}
            alt={service.name}
            className="w-full h-32 object-cover rounded-lg"
          />
        </div>

        {showCategory && service.category && (
          <p className="text-sm text-gray-500 mb-2">{service.category.name}</p>
        )}

        <h4 className="text-xl font-semibold text-gray-900 mb-3">{service.name}</h4>
        
        <p className="text-gray-600 mb-4 line-clamp-3">{service.shortDescription}</p>

        {/* Features */}
        {service.features && service.features.length > 0 && (
          <ul className="text-sm text-gray-600 space-y-1 mb-6">
            {service.features.slice(0, 4).map((feature, index) => (
              <li key={index}>• {feature}</li>
            ))}
          </ul>
        )}

        {/* Rating and Duration */}
        <div className="flex items-center justify-between mb-4">
          {rating > 0 && (
            <div className="flex items-center">
              <div className="flex text-teal-light-500 text-sm">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-current" : ""}`}
                  />
                ))}
              </div>
              <span className="text-gray-500 text-sm ml-2">({reviewCount})</span>
            </div>
          )}
          
          {duration && (
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-1" />
              {duration}
            </div>
          )}
        </div>

        {/* Price and Book Button */}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">
            From {formatPrice(startingPrice)}
          </span>
          <Button
            onClick={handleBookService}
            disabled={bookServiceMutation.isPending}
            className={`${buttonColor} text-white`}
          >
            {bookServiceMutation.isPending ? (
              "Booking..."
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                Book Service
              </>
            )}
          </Button>
        </div>
      </Link>
    </div>
  );
}
