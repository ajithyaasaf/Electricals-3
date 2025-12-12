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
import { formatPrice } from "@/lib/currency";
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
  Truck,
  CreditCard,
  Shield,
  Bell,
  Download,
  FileText,
  Star,
  BarChart3,
  UserCheck,
  Building,
  Globe,
  Lock,
  Smartphone,
  AlertTriangle,
  TrendingUp,
  Plus,
  Trash2,
  Pencil
} from "lucide-react";
import { ORDER_STATUSES, BOOKING_STATUSES } from "@/lib/constants";
import type { OrderWithItems, BookingWithService } from "@/lib/types";
import { Address } from "@shared/types";
import { StateSelector } from "@/components/common/state-selector";

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

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to access your account.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
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
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
  });

  // Extract orders array from paginated response or fallback to empty array
  const orders = (ordersData as any)?.orders || [];

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

  // Address Management
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const defaultAddressState = {
    label: "Home",
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    phone: "",
    isDefault: false
  };

  const [addressForm, setAddressForm] = useState(defaultAddressState);

  const { data: addresses = [], isLoading: addressesLoading } = useQuery<Address[]>({
    queryKey: ["/api/addresses"],
    enabled: isAuthenticated,
  });

  const addAddressMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/addresses", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      setIsAddressDialogOpen(false);
      setAddressForm(defaultAddressState);
      toast({
        title: "Address saved",
        description: "Your new address has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save address",
        description: error.message || "Could not save address.",
        variant: "destructive",
      });
    }
  });

  const updateAddressMutation = useMutation({
    mutationFn: async (data: any) => {
      const { id, ...rest } = data;
      const response = await apiRequest("PUT", `/api/addresses/${id}`, rest);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      setIsAddressDialogOpen(false);
      setEditingAddressId(null);
      setAddressForm(defaultAddressState);
      toast({
        title: "Address updated",
        description: "Your address has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update address",
        description: error.message || "Could not update address.",
        variant: "destructive",
      });
    }
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/addresses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      toast({
        title: "Address deleted",
        description: "Address has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete",
        description: error.message || "Could not delete address.",
        variant: "destructive",
      });
    }
  });

  const handleEditAddress = (address: Address) => {
    setEditingAddressId(address.id);
    setAddressForm({
      label: address.label || "Home",
      firstName: address.firstName,
      lastName: address.lastName || "",
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phone: address.phone || "",
      isDefault: address.isDefault
    });
    setIsAddressDialogOpen(true);
  };

  const handleAddNewAddress = () => {
    setEditingAddressId(null);
    setAddressForm(defaultAddressState);
    setIsAddressDialogOpen(true);
  };

  const handleSaveAddress = () => {
    if (editingAddressId) {
      updateAddressMutation.mutate({ id: editingAddressId, ...addressForm });
    } else {
      addAddressMutation.mutate(addressForm);
    }
  };

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

        {/* Account Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{(orders as any[]).length}</p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
              <div className="w-12 h-12 bg-copper-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-copper-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{(bookings as any[]).length}</p>
                <p className="text-sm text-gray-600">Service Bookings</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{(wishlist as any[]).length}</p>
                <p className="text-sm text-gray-600">Saved Items</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice((orders as any[]).reduce((sum: number, order: any) => sum + (typeof order.total === 'number' ? order.total : 0), 0))}
                </p>
                <p className="text-sm text-gray-600">Total Spent</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="profile" className="flex items-center text-xs sm:text-sm">
              <User className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center text-xs sm:text-sm">
              <Package className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center text-xs sm:text-sm">
              <Calendar className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center text-xs sm:text-sm">
              <MapPin className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Addresses</span>
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center text-xs sm:text-sm">
              <Heart className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Wishlist</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center text-xs sm:text-sm">
              <CreditCard className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center text-xs sm:text-sm">
              <Shield className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center text-xs sm:text-sm">
              <Settings className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Settings</span>
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
                      <div key={order.id} className="p-4 border rounded-lg hover:border-copper-500 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Order #{order.orderNumber || order.id?.substring(0, 8).toUpperCase()}
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
                            <p className="font-semibold">{formatPrice(order.total || 0)}</p>
                          </div>
                        </div>

                        {order.items && order.items.length > 0 && (
                          <div className="space-y-2 mb-4">
                            {order.items.slice(0, 2).map((item) => (
                              <div key={item.id} className="flex items-center space-x-3">
                                <img
                                  src={item.productImageUrl || item.product?.imageUrls?.[0] || "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                                  alt={item.productName || item.product?.name || "Product"}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{item.productName || item.product?.name}</p>
                                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                </div>
                                <p className="text-sm font-medium">
                                  {formatPrice(item.totalPrice || parseFloat(item.price || "0") || 0)}
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

                        <div className="flex justify-end">
                          <Link href={`/account/orders/${order.id}`}>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              View Details
                            </Button>
                          </Link>
                        </div>
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
                                {formatPrice(Number(booking.totalAmount))}
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
                    <Button asChild className="bg-lime-600 hover:bg-lime-700">
                      <Link href="/services">Browse Services</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>


          {/* Addresses Tab */}
          <TabsContent value="addresses" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Saved Addresses</CardTitle>
                <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAddNewAddress}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Address
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{editingAddressId ? "Edit Address" : "Add New Address"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Label</Label>
                          <div className="flex gap-2 mb-2">
                            {["Home", "Work"].map((label) => (
                              <Badge
                                key={label}
                                variant={addressForm.label === label ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => setAddressForm({ ...addressForm, label })}
                              >
                                {label}
                              </Badge>
                            ))}
                          </div>
                          <Input
                            placeholder="Home, Office, etc."
                            value={addressForm.label}
                            onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone</Label>
                          <Input
                            placeholder="Phone number"
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>First Name</Label>
                          <Input
                            placeholder="John"
                            value={addressForm.firstName}
                            onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Last Name</Label>
                          <Input
                            placeholder="Doe"
                            value={addressForm.lastName}
                            onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Street Address</Label>
                        <Input
                          placeholder="123 Main St"
                          value={addressForm.street}
                          onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>City</Label>
                          <Input
                            placeholder="Mumbai"
                            value={addressForm.city}
                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>State</Label>
                          <StateSelector
                            value={addressForm.state}
                            onValueChange={(value) => setAddressForm({ ...addressForm, state: value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Pincode</Label>
                          <Input
                            placeholder="400001"
                            value={addressForm.zipCode}
                            onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                          />
                        </div>
                        <div className="flex items-center space-x-2 pt-8">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-copper-600 focus:ring-copper-500"
                            checked={addressForm.isDefault}
                            onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                          />
                          <Label>Set as default</Label>
                        </div>
                      </div>
                      <Button
                        className="w-full mt-4"
                        onClick={handleSaveAddress}
                        disabled={addAddressMutation.isPending || updateAddressMutation.isPending}
                      >
                        {addAddressMutation.isPending || updateAddressMutation.isPending ? "Saving..." : "Save Address"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {addressesLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="w-full h-24" />
                    ))}
                  </div>
                ) : addresses.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {addresses.map((address) => (
                      <div key={address.id} className="relative p-4 border rounded-lg hover:border-copper-500 transition-colors">
                        <div className="absolute top-4 right-4 flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-500 hover:text-copper-600 hover:bg-copper-50"
                            onClick={() => handleEditAddress(address)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => deleteAddressMutation.mutate(address.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{address.label}</h3>
                          {address.isDefault && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>{address.firstName} {address.lastName}</p>
                          <p>{address.street}</p>
                          <p>{address.city}, {address.state} {address.zipCode}</p>
                          <p>{address.country}</p>
                          {address.phone && <p className="flex items-center mt-2"><Phone className="w-3 h-3 mr-1" /> {address.phone}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No saved addresses</h3>
                    <p className="text-gray-600 mb-4">Add an address for faster checkout.</p>
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
                              {formatPrice(item.product.price)}
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

          {/* Payments Tab */}
          <TabsContent value="payments" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment Methods
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-6 bg-blue-600 rounded text-white flex items-center justify-center text-xs font-bold">
                            VISA
                          </div>
                          <div>
                            <p className="font-medium">•••• •••• •••• 4242</p>
                            <p className="text-sm text-gray-600">Expires 12/27</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Default</Badge>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Add New Payment Method
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Billing History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <p className="font-medium">Order #CB-2024-001</p>
                        <p className="text-sm text-gray-600">January 15, 2024</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹18,749</p>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Invoice
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <p className="font-medium">Order #CB-2023-087</p>
                        <p className="text-sm text-gray-600">December 8, 2023</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹11,738</p>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Invoice
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-600">Extra security for your account</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Login Notifications</p>
                        <p className="text-sm text-gray-600">Get notified of new sign-ins</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Lock className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium">Password</p>
                        <p className="text-sm text-gray-600">Last changed 3 months ago</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Change
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Active Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                      <div>
                        <p className="font-medium">Current Session</p>
                        <p className="text-sm text-gray-600">Chrome on Windows • United States</p>
                        <p className="text-xs text-gray-500">Last activity: Just now</p>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Current
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Mobile App</p>
                        <p className="text-sm text-gray-600">iOS App • New York</p>
                        <p className="text-xs text-gray-500">Last activity: 2 hours ago</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="w-5 h-5 mr-2" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Order Updates</p>
                      <p className="text-sm text-gray-600">Get notified about order status changes</p>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Promotional Emails</p>
                      <p className="text-sm text-gray-600">Receive special offers and deals</p>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Service Reminders</p>
                      <p className="text-sm text-gray-600">Maintenance and service notifications</p>
                    </div>
                    <input type="checkbox" className="toggle" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    Business Account
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Upgrade to Business</p>
                        <p className="text-sm text-gray-600">Access bulk pricing and contractor benefits</p>
                      </div>
                    </div>
                    <Button className="w-full">
                      Learn More About Business Account
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Account Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="w-full"
                  >
                    Sign Out
                  </Button>

                  <div className="pt-4 border-t">
                    <div className="flex items-center space-x-2 text-red-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">Danger Zone</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 mb-4">
                      These actions are permanent and cannot be undone.
                    </p>
                    <Button variant="destructive" className="w-full">
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
