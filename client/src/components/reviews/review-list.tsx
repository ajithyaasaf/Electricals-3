import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ReviewListProps {
  productId?: number;
  serviceId?: number;
}

export function ReviewList({ productId, serviceId }: ReviewListProps) {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["/api/reviews", { productId, serviceId }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (productId) params.set("productId", productId.toString());
      if (serviceId) params.set("serviceId", serviceId.toString());
      
      const response = await fetch(`/api/reviews?${params.toString()}`);
      return response.json();
    },
  });

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length 
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      {reviews.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium">
                {averageRating.toFixed(1)} out of 5
              </span>
            </div>
            <Badge variant="secondary">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </Badge>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Star className="mx-auto h-12 w-12 mb-4 text-gray-300" />
          <p>No reviews yet. Be the first to leave a review!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <div key={review.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <div className="flex items-start space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={review.user?.profileImageUrl} />
                  <AvatarFallback>
                    {review.user?.firstName ? 
                      review.user.firstName.charAt(0).toUpperCase() : 
                      <User className="w-5 h-5" />
                    }
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">
                        {review.user?.firstName && review.user?.lastName
                          ? `${review.user.firstName} ${review.user.lastName}`
                          : "Anonymous User"
                        }
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}