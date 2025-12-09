import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminLogin } from "@/components/admin/admin-login";
import { OrdersManagement } from "@/components/admin/orders-management";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Package,
  Users,
  ShoppingCart,
  Calendar,
  Plus,
  Edit,
  Trash2,
  BarChart3,

  TrendingUp,
  Activity,
  LogOut,
  Shield,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
  Truck,
  Package2,
  X,
  Eye,
  Printer
} from "lucide-react";
import { Link } from "wouter";

// Form schemas
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  originalPrice: z.string().optional(),
  sku: z.string().optional(),
  stock: z.number().min(0, "Stock must be 0 or greater"),
  categoryId: z.number().optional(),
  imageUrls: z.array(z.string()).optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  startingPrice: z.string().min(1, "Starting price is required"),
  duration: z.number().optional(),
  categoryId: z.number().optional(),
  imageUrl: z.string().optional(),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  parentId: z.number().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;
type ServiceFormData = z.infer<typeof serviceSchema>;
type CategoryFormData = z.infer<typeof categorySchema>;

// Analytics types
interface InventoryAnalytics {
  totalProducts: number;
  fastSelling: any[];
  mediumSelling: any[];
  slowSelling: any[];
  allProducts: any[];
}

interface RevenueAnalytics {
  monthlyData: any[];
  totalRevenue: number;
  totalOrders: number;
  averageMonthlyRevenue: number;
  revenueGrowth: number;
}

interface TopProductsAnalytics {
  topByRevenue: any[];
  topByQuantity: any[];
  totalProductsWithSales: number;
  totalRevenue: number;
}

interface CustomerAnalytics {
  totalCustomers: number;
  oneTimeCustomers: number;
  repeatCustomers: number;
  repeatRate: number;
  avgOrdersPerCustomer: number;
  avgCustomerValue: number;
  topCustomers: any[];
}

function AdminDashboard() {
  const { adminUser, adminSignOut } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Fetch data with proper typing
  const { data: productsData = { products: [], total: 0 }, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products", { limit: 100 }],
  });

  const { data: servicesData = { services: [], total: 0 }, isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/services", { limit: 100 }],
  });

  const { data: categoriesData = { categories: [] }, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: ordersData = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
  });

  const { data: bookingsData = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["/api/bookings"],
  });

  // Analytics data
  const { data: inventoryData, isLoading: inventoryLoading } = useQuery<InventoryAnalytics>({
    queryKey: ["/api/analytics/inventory"],
    enabled: activeTab === "analytics" || activeTab === "dashboard"
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery<RevenueAnalytics>({
    queryKey: ["/api/analytics/revenue"],
    enabled: activeTab === "analytics" || activeTab === "dashboard"
  });

  const { data: topProductsData, isLoading: topProductsLoading } = useQuery<TopProductsAnalytics>({
    queryKey: ["/api/analytics/top-products"],
    enabled: activeTab === "analytics" || activeTab === "dashboard"
  });

  const { data: customerData, isLoading: customerLoading } = useQuery<CustomerAnalytics>({
    queryKey: ["/api/analytics/customers"],
    enabled: activeTab === "analytics" || activeTab === "dashboard"
  });

  // Extract arrays for easier access
  const products = (productsData as any)?.products || [];
  const services = (servicesData as any)?.services || [];
  const categories = (categoriesData as any)?.categories || [];
  const orders = Array.isArray(ordersData) ? ordersData : [];
  const bookings = Array.isArray(bookingsData) ? bookingsData : [];

  // Forms
  const productForm = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      shortDescription: "",
      price: "",
      originalPrice: "",
      sku: "",
      stock: 0,
      isFeatured: false,
      isActive: true,
    },
  });

  const serviceForm = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      shortDescription: "",
      startingPrice: "",
      isActive: true,
    },
  });

  const categoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
    },
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const url = editingItem ? `/api/products/${editingItem.id}` : "/api/products";
      const method = editingItem ? "PUT" : "POST";
      await apiRequest(method, url, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setProductDialogOpen(false);
      setEditingItem(null);
      productForm.reset();
      toast({
        title: "Success",
        description: `Product ${editingItem ? "updated" : "created"} successfully.`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Access denied",
          description: "You don't have permission to perform this action.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: `Failed to ${editingItem ? "update" : "create"} product.`,
        variant: "destructive",
      });
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      const url = editingItem ? `/api/services/${editingItem.id}` : "/api/services";
      const method = editingItem ? "PUT" : "POST";
      await apiRequest(method, url, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setServiceDialogOpen(false);
      setEditingItem(null);
      serviceForm.reset();
      toast({
        title: "Success",
        description: `Service ${editingItem ? "updated" : "created"} successfully.`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Access denied",
          description: "You don't have permission to perform this action.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: `Failed to ${editingItem ? "update" : "create"} service.`,
        variant: "destructive",
      });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      await apiRequest("POST", "/api/categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setCategoryDialogOpen(false);
      categoryForm.reset();
      toast({
        title: "Success",
        description: "Category created successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Access denied",
          description: "You don't have permission to perform this action.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create category.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    try {
      await adminSignOut();
      toast({
        title: "Logged out",
        description: "Successfully logged out of admin panel.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate dashboard stats
  const totalRevenue = orders.reduce((sum: number, order: any) =>
    sum + parseFloat(order.total || "0"), 0);
  const totalProducts = (productsData as any)?.total || 0;
  const totalServices = (servicesData as any)?.total || 0;
  const totalOrders = orders.length;

  const onProductSubmit = (data: ProductFormData) => {
    createProductMutation.mutate(data);
  };

  const onServiceSubmit = (data: ServiceFormData) => {
    createServiceMutation.mutate(data);
  };

  const onCategorySubmit = (data: CategoryFormData) => {
    createCategoryMutation.mutate(data);
  };

  const handleEditProduct = (product: any) => {
    setEditingItem(product);
    productForm.reset({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      shortDescription: product.shortDescription || "",
      price: product.price,
      originalPrice: product.originalPrice || "",
      sku: product.sku || "",
      stock: product.stock || 0,
      categoryId: product.categoryId || undefined,
      isFeatured: product.isFeatured || false,
      isActive: product.isActive !== false,
    });
    setProductDialogOpen(true);
  };

  const handleEditService = (service: any) => {
    setEditingItem(service);
    serviceForm.reset({
      name: service.name,
      slug: service.slug,
      description: service.description || "",
      shortDescription: service.shortDescription || "",
      startingPrice: service.startingPrice,
      duration: service.duration || undefined,
      categoryId: service.categoryId || undefined,
      imageUrl: service.imageUrl || "",
      isActive: service.isActive !== false,
    });
    setServiceDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-copper-600" />
                <h1 className="text-xl font-bold text-gray-900">CopperBear Admin</h1>
              </div>
              <Badge variant="secondary" className="bg-copper-100 text-copper-800">
                Authenticated
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/', '_blank')}
                className="flex items-center space-x-2 text-copper-600 border-copper-200 hover:bg-copper-50"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Site</span>
              </Button>
              <span className="text-sm text-gray-600">
                Welcome, {adminUser?.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2 border-copper-200 text-copper-600 hover:bg-copper-50 hover:text-copper-700"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Manage products, services, orders, and users
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 bg-copper-50 border-copper-200">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-copper-600 data-[state=active]:text-white data-[state=active]:border-copper-700"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-copper-600 data-[state=active]:text-white data-[state=active]:border-copper-700"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="data-[state=active]:bg-copper-600 data-[state=active]:text-white data-[state=active]:border-copper-700"
            >
              Products
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className="data-[state=active]:bg-copper-600 data-[state=active]:text-white data-[state=active]:border-copper-700"
            >
              Services
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="data-[state=active]:bg-copper-600 data-[state=active]:text-white data-[state=active]:border-copper-700"
            >
              Categories
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-copper-600 data-[state=active]:text-white data-[state=active]:border-copper-700"
            >
              Orders
            </TabsTrigger>
            <TabsTrigger
              value="bookings"
              className="data-[state=active]:bg-copper-600 data-[state=active]:text-white data-[state=active]:border-copper-700"
            >
              Bookings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ₹{totalRevenue.toFixed(2)}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-lime-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Products</p>
                      <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
                    </div>
                    <Package className="w-8 h-8 text-copper-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                    </div>
                    <ShoppingCart className="w-8 h-8 text-copper-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Services</p>
                      <p className="text-2xl font-bold text-gray-900">{totalServices}</p>
                    </div>
                    <Activity className="w-8 h-8 text-lime-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="w-full h-12" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 5).map((order: any) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-copper-50 rounded-lg">
                          <div>
                            <p className="font-medium">#{order.id.slice(-8)}</p>
                            <p className="text-sm text-gray-600">
                              {order.customerName || 'Unknown'} • {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{parseFloat(order.total).toFixed(2)}</p>
                            <Badge variant="outline" className="text-xs">
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  {bookingsLoading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="w-full h-12" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bookings.slice(0, 5).map((booking: any) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 bg-copper-50 rounded-lg">
                          <div>
                            <p className="font-medium">#{booking.bookingNumber}</p>
                            <p className="text-sm text-gray-600">
                              {booking.service?.name}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {booking.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Analytics Overview Cards */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {revenueLoading ? (
                          <Skeleton className="w-20 h-8" />
                        ) : (
                          `₹${revenueData?.totalRevenue ? (revenueData.totalRevenue / 12).toFixed(0) : '0'}`
                        )}
                      </p>
                      {!revenueLoading && revenueData?.revenueGrowth && (
                        <p className="text-sm text-lime-600">+{revenueData.revenueGrowth}% from last month</p>
                      )}
                    </div>
                    <BarChart3 className="w-8 h-8 text-lime-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Fast Selling</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {inventoryLoading ? (
                          <Skeleton className="w-16 h-8" />
                        ) : (
                          inventoryData?.fastSelling?.length || 0
                        )}
                      </p>
                      <p className="text-sm text-gray-500">products</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-lime-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Slow Moving</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {inventoryLoading ? (
                          <Skeleton className="w-16 h-8" />
                        ) : (
                          inventoryData?.slowSelling?.length || 0
                        )}
                      </p>
                      <p className="text-sm text-gray-500">products</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Customer Repeat Rate</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {customerLoading ? (
                          <Skeleton className="w-20 h-8" />
                        ) : (
                          `${customerData?.repeatRate?.toFixed(1) || 0}%`
                        )}
                      </p>
                      <p className="text-sm text-gray-500">returning customers</p>
                    </div>
                    <Users className="w-8 h-8 text-copper-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Charts and Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Inventory Tracking */}
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  {inventoryLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="w-full h-12" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-lime-600 mb-2">Fast Selling Products</h4>
                        {inventoryData?.fastSelling?.slice(0, 3).map((product: any) => (
                          <div key={product.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm font-medium">{product.name}</span>
                            <div className="text-right">
                              <span className="text-xs text-gray-500">{product.totalSold} sold</span>
                              <div className="text-xs text-lime-600">{product.salesVelocity.toFixed(1)}/day</div>
                            </div>
                          </div>
                        )) || <p className="text-sm text-gray-500">No fast-selling products</p>}
                      </div>

                      <div className="pt-4">
                        <h4 className="font-medium text-amber-600 mb-2">Slow Moving Stock</h4>
                        {inventoryData?.slowSelling?.slice(0, 3).map((product: any) => (
                          <div key={product.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm font-medium">{product.name}</span>
                            <div className="text-right">
                              <span className="text-xs text-gray-500">Stock: {product.stock}</span>
                              <div className="text-xs text-amber-600">{product.salesVelocity.toFixed(1)}/day</div>
                            </div>
                          </div>
                        )) || <p className="text-sm text-gray-500">All products moving well</p>}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Revenue Products</CardTitle>
                </CardHeader>
                <CardContent>
                  {topProductsLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="w-full h-12" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {topProductsData?.topByRevenue?.slice(0, 5).map((product: any, index: number) => (
                        <div key={product.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                          <div>
                            <span className="text-sm font-medium">#{index + 1} {product.name}</span>
                            <div className="text-xs text-gray-500">{product.totalQuantitySold} units sold</div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-lime-600">₹{product.totalRevenue.toFixed(0)}</span>
                          </div>
                        </div>
                      )) || <p className="text-sm text-gray-500">No sales data available</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Customer Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Insights</CardTitle>
              </CardHeader>
              <CardContent>
                {customerLoading ? (
                  <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="w-full h-16" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-copper-600">{customerData?.totalCustomers || 0}</p>
                      <p className="text-sm text-gray-600">Total Customers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-lime-600">{customerData?.repeatCustomers || 0}</p>
                      <p className="text-sm text-gray-600">Repeat Customers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-600">₹{customerData?.avgCustomerValue?.toFixed(0) || 0}</p>
                      <p className="text-sm text-gray-600">Avg Customer Value</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-600">{customerData?.avgOrdersPerCustomer?.toFixed(1) || 0}</p>
                      <p className="text-sm text-gray-600">Avg Orders/Customer</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Products</CardTitle>
                  <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-copper-600 hover:bg-copper-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingItem ? "Edit Product" : "Add New Product"}
                        </DialogTitle>
                      </DialogHeader>

                      <Form {...productForm}>
                        <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={productForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Product Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={productForm.control}
                              name="slug"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Slug</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={productForm.control}
                            name="shortDescription"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Short Description</FormLabel>
                                <FormControl>
                                  <Textarea {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={productForm.control}
                              name="price"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Price</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.01" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={productForm.control}
                              name="stock"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Stock</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={productForm.control}
                            name="categoryId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {categories.map((category: any) => (
                                      <SelectItem key={category.id} value={category.id.toString()}>
                                        {category.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            disabled={createProductMutation.isPending}
                            className="w-full bg-copper-600 hover:bg-copper-700 text-white"
                          >
                            {createProductMutation.isPending
                              ? "Saving..."
                              : editingItem
                                ? "Update Product"
                                : "Create Product"
                            }
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="w-full h-16" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product: any) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>₹{parseFloat(product.price).toFixed(2)}</TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>
                            <Badge variant={product.isActive ? "default" : "secondary"}>
                              {product.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Services</CardTitle>
                  <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-lime-600 hover:bg-lime-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Service
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingItem ? "Edit Service" : "Add New Service"}
                        </DialogTitle>
                      </DialogHeader>

                      <Form {...serviceForm}>
                        <form onSubmit={serviceForm.handleSubmit(onServiceSubmit)} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={serviceForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Service Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={serviceForm.control}
                              name="slug"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Slug</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={serviceForm.control}
                            name="shortDescription"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Short Description</FormLabel>
                                <FormControl>
                                  <Textarea {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={serviceForm.control}
                              name="startingPrice"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Starting Price</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.01" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={serviceForm.control}
                              name="duration"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Duration (minutes)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={serviceForm.control}
                            name="categoryId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {categories.map((category: any) => (
                                      <SelectItem key={category.id} value={category.id.toString()}>
                                        {category.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            disabled={createServiceMutation.isPending}
                            className="w-full bg-lime-600 hover:bg-lime-700 text-white"
                          >
                            {createServiceMutation.isPending
                              ? "Saving..."
                              : editingItem
                                ? "Update Service"
                                : "Create Service"
                            }
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {servicesLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="w-full h-16" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Starting Price</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {services.map((service: any) => (
                        <TableRow key={service.id}>
                          <TableCell className="font-medium">{service.name}</TableCell>
                          <TableCell>₹{parseFloat(service.startingPrice).toFixed(2)}</TableCell>
                          <TableCell>
                            {service.duration ? `${service.duration} min` : "Varies"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={service.isActive ? "default" : "secondary"}>
                              {service.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditService(service)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Categories</CardTitle>
                  <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-lime-500 hover:bg-lime-600 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Category
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                      </DialogHeader>

                      <Form {...categoryForm}>
                        <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
                          <FormField
                            control={categoryForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={categoryForm.control}
                            name="slug"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Slug</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={categoryForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            disabled={createCategoryMutation.isPending}
                            className="w-full bg-lime-500 hover:bg-lime-600 text-white"
                          >
                            {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {categoriesLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="w-full h-16" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category: any) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>{category.slug}</TableCell>
                          <TableCell>{category.description || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="mt-6">
            <OrdersManagement />
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
                    {[...Array(10)].map((_, i) => (
                      <Skeleton key={i} className="w-full h-16" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Booking #</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking: any) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">#{booking.bookingNumber}</TableCell>
                          <TableCell>{booking.service?.name}</TableCell>
                          <TableCell>
                            {booking.address?.firstName} {booking.address?.lastName}
                          </TableCell>
                          <TableCell>
                            {booking.scheduledDate
                              ? new Date(booking.scheduledDate).toLocaleDateString()
                              : "TBD"
                            }
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {booking.status.replace("_", " ")}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function Admin() {
  const { isAdminAuthenticated, loading: authLoading } = useAdminAuth();

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-copper-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated as admin
  if (!isAdminAuthenticated) {
    return <AdminLogin onLoginSuccess={() => { }} />;
  }

  // Show admin dashboard if authenticated
  return <AdminDashboard />;
}
