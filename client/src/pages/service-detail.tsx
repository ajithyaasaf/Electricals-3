import { useState } from "react";
import { useParams, useSearch } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatPrice } from "@/lib/currency";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Star, Calendar as CalendarIcon, Clock, Shield, CheckCircle, Phone, MapPin } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

const bookingSchema = z.object({
  scheduledDate: z.date({
    required_error: "Please select a date for your service.",
  }),
  scheduledTime: z.string().min(1, "Please select a time slot."),
  address: z.object({
    street: z.string().min(1, "Street address is required."),
    city: z.string().min(1, "City is required."),
    state: z.string().min(1, "State is required."),
    zipCode: z.string().min(1, "ZIP code is required."),
  }),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearch();
  const { isAuthenticated } = useFirebaseAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const urlParams = new URLSearchParams(searchParams);
  const autoOpenBooking = urlParams.get("book") === "true";

  // Fetch service details
  const { data: service, isLoading } = useQuery({
    queryKey: ["/api/services", slug],
  });

  // Fetch reviews
  const { data: reviews = [] } = useQuery({
    queryKey: ["/api/reviews", { serviceId: service?.id }],
    enabled: !!service?.id,
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
      },
      notes: "",
    },
  });

  const bookServiceMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      await apiRequest("POST", "/api/bookings", {
        serviceId: service?.id,
        scheduledDate: data.scheduledDate.toISOString(),
        scheduledTime: data.scheduledTime,
        address: data.address,
        notes: data.notes,
        totalAmount: service?.startingPrice,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Service booked successfully!",
        description: "We'll contact you within 24 hours to confirm your appointment.",
      });
      setBookingDialogOpen(false);
      form.reset();
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
      toast({
        title: "Error",
        description: "Failed to book service. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BookingFormData) => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to book services.",
        variant: "destructive",
      });
      return;
    }
    bookServiceMutation.mutate(data);
  };

  const handleBookService = () => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to book services.",
        variant: "destructive",
      });
      return;
    }
    setBookingDialogOpen(true);
  };

  // Auto-open booking dialog if URL parameter is present
  useState(() => {
    if (autoOpenBooking && isAuthenticated) {
      setBookingDialogOpen(true);
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="w-full h-96" />
            <div className="space-y-4">
              <Skeleton className="w-3/4 h-8" />
              <Skeleton className="w-1/2 h-6" />
              <Skeleton className="w-full h-20" />
              <Skeleton className="w-1/3 h-10" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h1>
          <p className="text-gray-600 mb-6">The service you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/services">Browse Services</Link>
          </Button>
        </div>
      </div>
    );
  }

  const imageUrl = service.imageUrl || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600";
  const startingPrice = parseFloat(service.startingPrice);
  const rating = parseFloat(service.rating || "0");
  const reviewCount = service.reviewCount || 0;
  const duration = service.duration ? `${Math.floor(service.duration / 60)}h ${service.duration % 60}m` : "Varies";

  const timeSlots = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          {" / "}
          <Link href="/services" className="hover:text-gray-900">Services</Link>
          {" / "}
          <span className="text-gray-900">{service.name}</span>
        </nav>

        {/* Service Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Service Image */}
          <div className="aspect-video bg-white rounded-lg overflow-hidden">
            <img
              src={imageUrl}
              alt={service.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Service Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.name}</h1>

              {/* Rating */}
              {rating > 0 && (
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400 mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(rating) ? "fill-current" : ""}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({reviewCount} reviews)</span>
                </div>
              )}

              {/* Price and Duration */}
              <div className="flex items-center space-x-6 mb-6">
                <div>
                  <span className="text-3xl font-bold text-gray-900">
                    From {formatPrice(startingPrice)}
                  </span>
                  <p className="text-sm text-gray-600">Starting price</p>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>{duration}</span>
                </div>
              </div>

              {/* Short Description */}
              {service.shortDescription && (
                <p className="text-gray-600 mb-6">{service.shortDescription}</p>
              )}

              {/* Features */}
              {service.features && service.features.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">What's Included:</h3>
                  <ul className="space-y-2">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Book Service Button */}
              <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={handleBookService}
                    className="w-full bg-lime-600 hover:bg-lime-700 text-white"
                    size="lg"
                  >
                    <CalendarIcon className="w-5 h-5 mr-2" />
                    Book This Service
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Book {service.name}</DialogTitle>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {/* Date Selection */}
                      <FormField
                        control={form.control}
                        name="scheduledDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Preferred Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={`pl-3 text-left font-normal ${
                                      !field.value && "text-muted-foreground"
                                    }`}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Time Selection */}
                      <FormField
                        control={form.control}
                        name="scheduledTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Time</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a time slot" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {timeSlots.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Address */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">Service Address</h3>
                        
                        <FormField
                          control={form.control}
                          name="address.street"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Street Address</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Main Street" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="address.city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input placeholder="City" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="address.state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                  <Input placeholder="State" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="address.zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP Code</FormLabel>
                              <FormControl>
                                <Input placeholder="12345" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Notes */}
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Notes (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Please describe your electrical needs or any specific requirements..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={bookServiceMutation.isPending}
                        className="w-full bg-lime-600 hover:bg-lime-700"
                      >
                        {bookServiceMutation.isPending ? "Booking..." : "Confirm Booking"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              {/* Service Guarantees */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">Licensed & Insured</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-700">Quality Guaranteed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-gray-700">24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Details Tabs */}
        <Tabs defaultValue="description" className="mb-12">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviewCount})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-6">
            <div className="bg-white rounded-lg p-6">
              <div className="prose max-w-none">
                {service.description ? (
                  <div dangerouslySetInnerHTML={{ __html: service.description }} />
                ) : (
                  <p className="text-gray-600">No detailed description available for this service.</p>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <div className="bg-white rounded-lg p-6">
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex text-yellow-400 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? "fill-current" : ""}`}
                              />
                            ))}
                          </div>
                          {review.title && (
                            <h4 className="font-medium text-gray-900">{review.title}</h4>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-600">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No reviews yet for this service.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
