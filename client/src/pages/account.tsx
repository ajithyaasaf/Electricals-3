import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearch, Link } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { signInWithGoogle, signOutUser } from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  User, 
  Package, 
  Calendar, 
  Heart, 
  Settings, 
  Eye,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Truck
} from "lucide-react";
import { ORDER_STATUSES, BOOKING_STATUSES } from "@/lib/constants";
import type { OrderWithItems, BookingWithService } from "@/lib/types";

export default function Account() {
  const { isAuthenticated, loading: authLoading, user } = useFirebaseAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const searchParams = useSearch();
  
  // Get active tab from URL
  const urlParams = new URLSearchParams(searchParams);
  const defaultTab = urlParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Profile editing state
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to access your account.",
        variant: "destructive",
      });
      setTimeout(() => {
        signInWithGoogle();
      }, 1000);
    }
  }, [isAuthenticated, authLoading, toast]);

  // Initialize profile data
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.displayName?.split(' ')[0] || "",
        lastName: user.displayName?.split(' ')[1] || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Sign-out Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Fetch user orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
  });

  // Fetch service bookings
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["/api/bookings"],
    enabled: isAuthenticated,
  });

  // Fetch wishlist
  const { data: wishlist = [], isLoading: wishlistLoading } = useQuery({
    queryKey: ["/api/wishlist"],
    enabled: isAuthenticated,
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("DELETE", `/api/wishlist/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Please sign in",
          description: "You need to sign in to manage your wishlist.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist.",
        variant: "destructive",
      });
    },
  });

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="w-full h-96" />
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string, type: "order" | "booking") => {
    const statusLower = status.toLowerCase();
    
    if (type === "order") {
      switch (statusLower) {
        case "pending":
          return "bg-yellow-100 text-yellow-800";
        case "processing":
          return "bg-blue-100 text-blue-800";
        case "shipped":
          return "bg-purple-100 text-purple-800";
        case "delivered":
          return "bg-green-100 text-green-800";
        case "cancelled":
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    } else {
      switch (statusLower) {
        case "pending":
          return "bg-yellow-100 text-yellow-800";
        case "confirmed":
          return "bg-blue-100 text-blue-800";
        case "in_progress":
          return "bg-purple-100 text-purple-800";
        case "completed":
          return "bg-green-100 text-green-800";
        case "cancelled":
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    }
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "processing":
      case "confirmed":
      case "in_progress":
        return <Package className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "delivered":
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          {" / "}
          <span className="text-gray-900">My Account</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-600">
            Manage your profile, orders, and preferences
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center">
              <Heart className="w-4 h-4 mr-2" />
              Wishlist
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-copper-100 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-copper-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {user?.displayName || 'User'}
                    </h3>
                    <p className="text-gray-600">{user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button className="bg-copper-600 hover:bg-copper-700">
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)} className="bg-copper-600 hover:bg-copper-700">
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <Skeleton className="w-full h-20" />
                      </div>
                    ))}
                  </div>
                ) : (orders as any[]).length > 0 ? (
                  <div className="space-y-4">
                    {(orders as any[]).map((order: OrderWithItems) => (
                      <div key={order.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Order #{order.orderNumber}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Placed on {new Date(order.createdAt!).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge className={`${getStatusColor(order.status, "order")} flex items-center space-x-1`}>
                              {getStatusIcon(order.status)}
                              <span className="capitalize">{order.status}</span>
                            </Badge>
                            <p className="font-semibold">${parseFloat(order.totalAmount).toFixed(2)}</p>
                          </div>
                        </div>
                        
                        {order.items && order.items.length > 0 && (
                          <div className="space-y-2">
                            {order.items.slice(0, 2).map((item) => (
                              <div key={item.id} className="flex items-center space-x-3">
                                <img
                                  src={item.product?.imageUrls?.[0] || "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                                  alt={item.product?.name || "Product"}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{item.product?.name}</p>
                                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                </div>
                                <p className="text-sm font-medium">
                                  ${parseFloat(item.price).toFixed(2)}
                                </p>
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <p className="text-sm text-gray-600 mt-2">
                                +{order.items.length - 2} more items
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600 mb-4">Start shopping to see your orders here.</p>
                    <Button asChild className="bg-copper-600 hover:bg-copper-700">
                      <Link href="/products">Browse Products</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <Skeleton className="w-full h-20" />
                      </div>
                    ))}
                  </div>
                ) : (bookings as any[]).length > 0 ? (
                  <div className="space-y-4">
                    {(bookings as any[]).map((booking: BookingWithService) => (
                      <div key={booking.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {booking.service.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Booking #{booking.bookingNumber}
                            </p>
                          </div>
                          <Badge className={`${getStatusColor(booking.status, "booking")} flex items-center space-x-1`}>
                            {getStatusIcon(booking.status)}
                            <span className="capitalize">{booking.status.replace("_", " ")}</span>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>
                              {booking.scheduledDate 
                                ? new Date(booking.scheduledDate).toLocaleDateString()
                                : "Date TBD"
                              }
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>{booking.scheduledTime || "Time TBD"}</span>
                          </div>
                          {booking.address && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span>
                                {booking.address.street}, {booking.address.city}
                              </span>
                            </div>
                          )}
                          {booking.totalAmount && (
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">
                                ${parseFloat(booking.totalAmount).toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No service bookings</h3>
                    <p className="text-gray-600 mb-4">Book a service to see your appointments here.</p>
                    <Button asChild className="bg-electric-blue-600 hover:bg-electric-blue-700">
                      <Link href="/services">Browse Services</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My Wishlist</CardTitle>
              </CardHeader>
              <CardContent>
                {wishlistLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <Skeleton className="w-full h-32 mb-4" />
                        <Skeleton className="w-3/4 h-4 mb-2" />
                        <Skeleton className="w-1/2 h-4" />
                      </div>
                    ))}
                  </div>
                ) : (wishlist as any[]).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(wishlist as any[]).map((item: any) => (
                      <div key={item.id} className="border rounded-lg overflow-hidden">
                        <Link href={`/products/${item.product.slug || item.product.id}`}>
                          <img
                            src={item.product.imageUrls?.[0] || "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"}
                            alt={item.product.name}
                            className="w-full h-32 object-cover"
                          />
                        </Link>
                        <div className="p-4">
                          <Link href={`/products/${item.product.slug || item.product.id}`}>
                            <h3 className="font-medium text-gray-900 hover:text-copper-600 mb-2">
                              {item.product.name}
                            </h3>
                          </Link>
                          <div className="flex items-center justify-between">
                            <p className="text-lg font-semibold text-gray-900">
                              ${parseFloat(item.product.price).toFixed(2)}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeFromWishlistMutation.mutate(item.productId)}
                              disabled={removeFromWishlistMutation.isPending}
                            >
                              <Heart className="w-4 h-4 text-red-500 fill-current" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No items in wishlist</h3>
                    <p className="text-gray-600 mb-4">Save products you love to see them here.</p>
                    <Button asChild className="bg-copper-600 hover:bg-copper-700">
                      <Link href="/products">Browse Products</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-b pb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
                  <div className="space-y-4">
                    <Button 
                      variant="outline" 
                      onClick={handleSignOut}
                      className="w-full sm:w-auto"
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>

                <div className="border-b pb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-gray-600">Receive updates about your orders and services</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Marketing Emails</h4>
                        <p className="text-sm text-gray-600">Receive promotional offers and news</p>
                      </div>
                      <input type="checkbox" className="rounded" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Support</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Customer Support</p>
                        <p className="text-sm text-gray-600">(555) 123-4567</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Email Support</p>
                        <p className="text-sm text-gray-600">support@copperbear.com</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
