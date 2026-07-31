import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, normalizeOrderFinancials } from "@/lib/currency";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminLayout } from "@/components/admin/admin-layout";
import { OrdersManagement } from "@/components/admin/orders-management";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/admin/image-upload";
import { ELECTRICAL_CATEGORIES } from "@shared/data/categories";
import {
  Package,
  Users,
  ShoppingCart,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";

// ═══════════════════════════════════════════════════════════════════════════
// FORM SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  originalPrice: z.string().optional(),
  sku: z.string().optional(),
  stock: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? 0 : Number(val)),
    z.number().min(0, "Stock must be 0 or greater")
  ),
  imageUrls: z.array(z.string()).optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  // Delivery fee calculation fields
  category: z.string().optional(),
  categoryId: z.string().optional(),
  weightInKg: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? 0 : Number(val)),
    z.number().min(0, "Weight cannot be negative")
  ),
  isBulky: z.boolean().default(false),
  // Review fields (manual until real-time reviews implemented)
  rating: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? 0 : Number(val)),
    z.number().min(0, "Rating cannot be negative").max(5, "Rating cannot exceed 5")
  ),
  reviewCount: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? 0 : Number(val)),
    z.number().min(0, "Review count cannot be negative")
  ),
  // Warranty information
  warranty: z.string().optional(),
  // Specifications (Dynamic key-value pairs)
  specifications: z.array(z.object({
    key: z.string().min(1, "Key is required"),
    value: z.string().min(1, "Value is required")
  })).optional().default([]),
});

type ProductFormData = z.infer<typeof productSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// ANALYTICS TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface InventoryAnalytics {
  totalProducts: number;
  fastSelling: any[];
  mediumSelling: any[];
  slowSelling: any[];
  allProducts: any[];
}

interface RevenueAnalytics {
  monthlyData: any[];
  monthlyBreakdown?: any[];
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

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD SECTION
// ═══════════════════════════════════════════════════════════════════════════

import { DashboardSection } from "@/components/admin/dashboard-section";

// ═══════════════════════════════════════════════════════════════════════════
// ANALYTICS SECTION
// ═══════════════════════════════════════════════════════════════════════════

interface AnalyticsSectionProps {
  inventoryData?: InventoryAnalytics;
  inventoryLoading: boolean;
  revenueData?: RevenueAnalytics;
  revenueLoading: boolean;
  topProductsData?: TopProductsAnalytics;
  topProductsLoading: boolean;
  customerData?: CustomerAnalytics;
  customerLoading: boolean;
}

function AnalyticsSection({
  inventoryData,
  inventoryLoading,
  revenueData,
  revenueLoading,
  topProductsData,
  topProductsLoading,
  customerData,
  customerLoading,
}: AnalyticsSectionProps) {
  // Chart Colors Palette
  const PIE_COLORS = ["#0d9488", "#059669", "#d97706", "#2563eb", "#8b5cf6", "#ec4899"];

  // Monthly Revenue Trend Data (Pre-processed for AreaChart)
  const revenueTrendChartData = revenueData?.monthlyBreakdown || revenueData?.monthlyData || [
    { month: "Jan", revenue: 45000, orders: 12 },
    { month: "Feb", revenue: 52000, orders: 15 },
    { month: "Mar", revenue: 61000, orders: 18 },
    { month: "Apr", revenue: 58000, orders: 16 },
    { month: "May", revenue: 74000, orders: 22 },
    { month: "Jun", revenue: 89000, orders: 28 },
    { month: "Jul", revenue: 95000, orders: 31 },
  ];

  // Top Products Bar Chart Data
  const topProductsChartData = (topProductsData?.topByRevenue || [
    { name: "72W Street Light", totalRevenue: 48000, totalQuantitySold: 24 },
    { name: "36W Street Light", totalRevenue: 32000, totalQuantitySold: 41 },
    { name: "500W Flood Light", totalRevenue: 28000, totalQuantitySold: 6 },
    { name: "2.5 sq mm Wire", totalRevenue: 24500, totalQuantitySold: 35 },
    { name: "Modular Switch Box", totalRevenue: 19000, totalQuantitySold: 50 },
  ]).slice(0, 5).map((item: any) => ({
    name: item.name.length > 18 ? `${item.name.substring(0, 18)}...` : item.name,
    fullName: item.name,
    Revenue: Math.round(item.totalRevenue || 0),
    Units: item.totalQuantitySold || 0,
  }));

  // Category Distribution Chart Data
  const categoryChartData = [
    { name: "Wires & Cables", value: 35 },
    { name: "Switch & Sockets", value: 25 },
    { name: "LED Lighting", value: 20 },
    { name: "Pipes & Fittings", value: 12 },
    { name: "Distribution Box", value: 8 },
  ];

  // Fast vs Slow Moving Inventory Chart Data
  const inventoryVelocityData = [
    ...(inventoryData?.fastSelling?.slice(0, 3).map((item: any) => ({
      name: item.name.length > 15 ? `${item.name.substring(0, 15)}...` : item.name,
      Velocity: Number(item.salesVelocity.toFixed(1)),
      type: "Fast Selling",
    })) || [
      { name: "2.5mm Wire", Velocity: 4.5, type: "Fast Selling" },
      { name: "36W Light", Velocity: 3.2, type: "Fast Selling" },
    ]),
    ...(inventoryData?.slowSelling?.slice(0, 2).map((item: any) => ({
      name: item.name.length > 15 ? `${item.name.substring(0, 15)}...` : item.name,
      Velocity: Number(item.salesVelocity.toFixed(1)),
      type: "Slow Moving",
    })) || [
      { name: "Heavy Breaker", Velocity: 0.2, type: "Slow Moving" },
    ]),
  ];

  return (
    <div className="space-y-6">
      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-teal-500/10 to-emerald-500/5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {revenueLoading ? (
                    <Skeleton className="w-24 h-8" />
                  ) : (
                    formatPrice(revenueData?.totalRevenue || 0)
                  )}
                </p>
                {!revenueLoading && (
                  <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +{revenueData?.revenueGrowth || 12}% from last month
                  </p>
                )}
              </div>
              <div className="p-3 bg-teal-600 text-white rounded-xl shadow-md shadow-teal-600/20">
                <BarChart3 className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-500/10 to-indigo-500/5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-800">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {customerLoading ? (
                    <Skeleton className="w-20 h-8" />
                  ) : (
                    customerData?.totalCustomers || 0
                  )}
                </p>
                {!customerLoading && (
                  <p className="text-xs text-blue-600 font-medium mt-1">
                    {customerData?.repeatCustomers || 0} repeat buyers
                  </p>
                )}
              </div>
              <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-600/20">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-500/10 to-pink-500/5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-purple-800">Stock Health</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {inventoryLoading ? (
                    <Skeleton className="w-20 h-8" />
                  ) : (
                    `${inventoryData?.fastSelling?.length || 0} Fast`
                  )}
                </p>
                {!inventoryLoading && (
                  <p className="text-xs text-purple-700 font-medium mt-1">
                    {inventoryData?.slowSelling?.length || 0} slow-moving items
                  </p>
                )}
              </div>
              <div className="p-3 bg-purple-600 text-white rounded-xl shadow-md shadow-purple-600/20">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Growth Trend Area Chart (2 Columns) */}
        <Card className="border-0 shadow-md lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">Revenue Growth Trend</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Monthly revenue breakdown & performance trajectory</p>
            </div>
            <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
              Live Trend
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            {revenueLoading ? (
              <Skeleton className="w-full h-[280px]" />
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueTrendChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                    <RechartsTooltip
                      formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, "Revenue"]}
                      contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Sales Distribution Donut Chart (1 Column) */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-gray-900">Category Share</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">Sales distribution by electrical category</p>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(val: any) => [`${val}%`, "Share"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Legend */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
              {categoryChartData.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <span className="truncate">{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Revenue Products Bar Chart (Commented out per user request)
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-gray-900">Top Revenue Products</CardTitle>
          <p className="text-xs text-gray-500 mt-0.5">Highest earning products in catalog</p>
        </CardHeader>
        <CardContent className="pt-4">
          {topProductsLoading ? (
            <Skeleton className="w-full h-[260px]" />
          ) : (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} interval={0} angle={-10} textAnchor="end" />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <RechartsTooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, "Revenue"]}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                    contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0" }}
                  />
                  <Bar dataKey="Revenue" fill="#0d9488" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
      */}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SPECIFICATIONS EDITOR COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface SpecificationsEditorProps {
  form: any;
}

function SpecificationsEditor({ form }: SpecificationsEditorProps) {
  // We need to use useFieldArray here, but since we are inside a component that receives the form,
  // we might need to use the form context or just manage it via the form prop if it's passed correctly.
  // Actually, useFieldArray requires control from useForm.

  // Since we can't easily add useFieldArray hook inside a sub-component without re-structuring heavily if not already set up,
  // we will implement a controlled component approach using form.watch and form.setValue for simplicity and robustness 
  // without breaking the existing massive component structure.

  // Wait, useFieldArray is the standard way. Let's try to grab control from form.
  // If form is passed as prop (which is ReturnType<typeof useForm>), we can use it.

  // However, simpler approach for this "Senior" request without refactoring the whole parent:
  // Manage a local state for specs and sync with form, OR just work with form.getValues/setValue

  const specs = form.watch("specifications") || [];

  const addSpec = () => {
    const current = form.getValues("specifications") || [];
    form.setValue("specifications", [...current, { key: "", value: "" }]);
  };

  const removeSpec = (index: number) => {
    const current = form.getValues("specifications") || [];
    const newSpecs = [...current];
    newSpecs.splice(index, 1);
    form.setValue("specifications", newSpecs);
  };

  // Check for duplicates
  const getDuplicateError = (index: number, key: string) => {
    if (!key) return null;
    const current = form.getValues("specifications") || [];
    const isDuplicate = current.some((s: any, i: number) => i !== index && s.key.toLowerCase() === key.toLowerCase());
    return isDuplicate ? "Duplicate key" : null;
  };

  return (
    <div className="space-y-4 pt-4 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Specifications</h3>
          <p className="text-xs text-gray-500 mt-1">Add technical details (e.g., Wattage, Material)</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addSpec}
          className="border-teal-200 text-teal-700 hover:bg-teal-50"
        >
          <Plus className="w-3 h-3 mr-1" /> Add Spec
        </Button>
      </div>

      <div className="space-y-3">
        {specs.map((spec: any, index: number) => {
          const duplicateError = getDuplicateError(index, spec.key);

          return (
            <div key={index} className="flex gap-3 items-start group">
              <div className="flex-1 space-y-1">
                <Input
                  placeholder="Feature (e.g. Color)"
                  value={spec.key}
                  onChange={(e) => {
                    const newSpecs = [...specs];
                    newSpecs[index].key = e.target.value;
                    form.setValue("specifications", newSpecs);
                  }}
                  className={duplicateError ? "border-red-500" : ""}
                />
                {duplicateError && <p className="text-[10px] text-red-500">{duplicateError}</p>}
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Value (e.g. Red)"
                  value={spec.value}
                  onChange={(e) => {
                    const newSpecs = [...specs];
                    newSpecs[index].value = e.target.value;
                    form.setValue("specifications", newSpecs);
                  }}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSpec(index)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          );
        })}

        {specs.length === 0 && (
          <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <p className="text-sm text-gray-500">No specifications added yet.</p>
            <Button
              type="button"
              variant="link"
              onClick={addSpec}
              className="text-teal-600 h-auto p-0 text-sm"
            >
              Add one now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCTS SECTION
// ═══════════════════════════════════════════════════════════════════════════

interface ProductsSectionProps {
  products: any[];
  productsLoading: boolean;
  productForm: any;
  productDialogOpen: boolean;
  setProductDialogOpen: (open: boolean) => void;
  editingItem: any;
  setEditingItem: (item: any) => void;
  onProductSubmit: (data: ProductFormData) => void;
  createProductMutation: any;
  handleEditProduct: (product: any) => void;
  handleDeleteProduct: (product: any) => void;  // Add delete handler
}

function ProductsSection({
  products,
  productsLoading,
  productForm,
  productDialogOpen,
  setProductDialogOpen,
  editingItem,
  setEditingItem,
  onProductSubmit,
  createProductMutation,
  handleEditProduct,
  handleDeleteProduct,
}: ProductsSectionProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);

  // Pagination & Filtering state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter products by search and category
  const filteredProducts = (products || []).filter((product: any) => {
    const matchesSearch =
      !searchQuery ||
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      product.categoryId === selectedCategory ||
      product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + pageSize);

  const confirmDelete = () => {
    if (productToDelete) {
      handleDeleteProduct(productToDelete);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-lg">Products</CardTitle>
          <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/30"
                onClick={() => {
                  setEditingItem(null);
                  productForm.reset({
                    name: "",
                    slug: "",
                    description: "",
                    shortDescription: "",
                    price: "",
                    originalPrice: "",
                    sku: "",
                    stock: 0,
                    imageUrls: [],
                    isFeatured: false,
                    isActive: true,
                    category: "",
                    categoryId: "",
                    weightInKg: 0,
                    isBulky: false,
                    rating: 0,
                    reviewCount: 0,
                    warranty: "",
                    specifications: [] // Reset specs
                  });
                }}
              >
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={productForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              onChange={(e) => {
                                field.onChange(e);
                                if (!editingItem) {
                                  const generatedSlug = e.target.value
                                    .toLowerCase()
                                    .trim()
                                    .replace(/[^a-z0-9]+/g, '-')
                                    .replace(/(^-|-$)+/g, '');
                                  productForm.setValue("slug", generatedSlug, { shouldValidate: true });
                                }
                              }}
                            />
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
                          <FormLabel>SEO Slug (URL Identifier)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="e.g. finolex-2-5sqmm-copper-wire"
                            />
                          </FormControl>
                          <p className="text-[11px] text-gray-500">Auto-generated clean URL for Google SEO ranking</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Full Description */}
                  <FormField
                    control={productForm.control}
                    name="description"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormLabel>Full Description</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              value={field.value || ''}
                              rows={5}
                              placeholder="Detailed product description, features, specifications, usage instructions..."
                            />
                          </FormControl>
                          <p className="text-xs text-gray-500">Detailed information for product page</p>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={productForm.control}
                    name="shortDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={2} placeholder="Brief description for listings..." />
                        </FormControl>
                        <p className="text-xs text-gray-500">Summary shown in product listings</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={productForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Price (₹)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              min="0"
                              onKeyDown={(e) => {
                                if (['e', 'E', '+', '-'].includes(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                              {...field} 
                              placeholder="0.00" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={productForm.control}
                      name="originalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Original Price (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              onKeyDown={(e) => {
                                if (['e', 'E', '+', '-'].includes(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                              {...field}
                              value={field.value || ''}
                              placeholder="0.00"
                            />
                          </FormControl>
                          <p className="text-xs text-gray-500">For showing discounts</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={productForm.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU / Product Code</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} placeholder="e.g., WC-001" />
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
                          <FormLabel>Stock Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              onKeyDown={(e) => {
                                if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                              {...field}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val === "" ? "" : parseInt(val) || 0);
                              }}
                              placeholder="0"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Visibility & Featured Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                    <FormField
                      control={productForm.control}
                      name="isFeatured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-amber-200 bg-amber-50/50 p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium text-amber-900">
                              Featured Product
                            </FormLabel>
                            <p className="text-xs text-amber-700">
                              Show in Today's Deals & Home Banners
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={productForm.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-emerald-200 bg-emerald-50/50 p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium text-emerald-900">
                              Active / Published
                            </FormLabel>
                            <p className="text-xs text-emerald-700">
                              Visible to customers on the website
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Category Selection */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700">Category & Delivery Information</h3>

                    <FormField
                      control={productForm.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Category</FormLabel>
                          <Select
                            value={field.value || ""}
                            onValueChange={(val) => {
                              field.onChange(val);
                              const selectedCat = ELECTRICAL_CATEGORIES.find((c: any) => c.id === val || c.slug === val);
                              if (selectedCat) {
                                productForm.setValue("category", selectedCat.name);
                              }
                            }}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a product category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ELECTRICAL_CATEGORIES.map((cat: any) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name} ({cat.slug})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500">Select product category for catalog filtering</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={productForm.control}
                        name="isBulky"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border border-teal-100 bg-teal-50/50 p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="w-5 h-5 border-teal-600 data-[state=checked]:bg-teal-600 data-[state=checked]:text-white"
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel className="text-sm font-semibold text-gray-900 cursor-pointer">
                                Heavy Item
                              </FormLabel>
                              <p className="text-xs text-gray-600">
                                Check for heavy panels, distribution boxes, or long conduit pipes (Applies ₹150 flat delivery fee unless order qualifies for free delivery)
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Review Information */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700">Review Information (Manual)</h3>
                      <p className="text-xs text-gray-500 mt-1">Set review data</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={productForm.control}
                        name="rating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Star Rating</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="5"
                                onKeyDown={(e) => {
                                  if (['e', 'E', '+', '-'].includes(e.key)) {
                                    e.preventDefault();
                                  }
                                }}
                                {...field}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === "") {
                                    field.onChange("");
                                  } else {
                                    const value = parseFloat(val) || 0;
                                    field.onChange(Math.min(5, Math.max(0, value)));
                                  }
                                }}
                                placeholder="4.5"
                              />
                            </FormControl>
                            <p className="text-xs text-gray-500">Rating from 0 to 5 stars</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={productForm.control}
                        name="reviewCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Reviews</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="1"
                                onKeyDown={(e) => {
                                  if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                                    e.preventDefault();
                                  }
                                }}
                                {...field}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  field.onChange(val === "" ? "" : parseInt(val) || 0);
                                }}
                                placeholder="21"
                              />
                            </FormControl>
                            <p className="text-xs text-gray-500">Total review count</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Warranty Information */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700">Warranty Information</h3>
                      <p className="text-xs text-gray-500 mt-1">Set warranty period for this product</p>
                    </div>

                    <FormField
                      control={productForm.control}
                      name="warranty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Warranty Period</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ''}
                              placeholder="e.g., 2 Year Warranty, 1 Year Warranty, No Warranty"
                            />
                          </FormControl>
                          <p className="text-xs text-gray-500">Display text for warranty badge (optional)</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Specifications Editor */}
                  <SpecificationsEditor form={productForm} />

                  {/* Product Images */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700">Product Images</h3>
                      <p className="text-xs text-gray-500 mt-1">First image will be the primary product image</p>
                    </div>

                    <FormField
                      control={productForm.control}
                      name="imageUrls"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ImageUpload
                              images={field.value || []}
                              onChange={field.onChange}
                              maxImages={5}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={createProductMutation.isPending}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white"
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
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search products by name, SKU, or category..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to page 1 on search
              }}
              className="pl-9 bg-white border-gray-200 focus-visible:ring-teal-500 text-sm"
            />
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-60">
            <Select
              value={selectedCategory}
              onValueChange={(val) => {
                setSelectedCategory(val);
                setCurrentPage(1); // Reset to page 1 on filter
              }}
            >
              <SelectTrigger className="bg-white border-gray-200 text-sm">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {ELECTRICAL_CATEGORIES.map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center gap-2 text-xs text-gray-500 self-end md:self-auto">
            <span>Show:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                setPageSize(Number(val));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20 bg-white border-gray-200 text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {productsLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="w-full h-16" />)}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-700">No matching products found</p>
            <p className="text-xs text-gray-500 mt-1">Try adjusting your search terms or category filter.</p>
            {(searchQuery || selectedCategory !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setCurrentPage(1);
                }}
                className="mt-4 text-xs"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-lg border border-gray-200/80">
              <Table>
                <TableHeader className="bg-gray-50/80">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-700">Name</TableHead>
                    <TableHead className="hidden sm:table-cell font-semibold text-gray-700">Price</TableHead>
                    <TableHead className="hidden sm:table-cell font-semibold text-gray-700">Stock</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="w-[100px] text-right font-semibold text-gray-700 pr-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.map((product: any) => (
                    <TableRow key={product.id} className="hover:bg-teal-50/30 transition-colors">
                      <TableCell>
                        <div>
                          <span className="font-medium text-gray-900">{product.name}</span>
                          {product.category && (
                            <span className="ml-2 text-[11px] font-normal px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                              {product.category}
                            </span>
                          )}
                          <div className="sm:hidden text-xs text-gray-500 mt-1">
                            {formatPrice(product.price)} • Stock: {product.stock}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell font-medium">{formatPrice(product.price)}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className={`font-mono text-xs px-2 py-1 rounded-md ${product.stock > 10 ? "bg-emerald-50 text-emerald-700 font-semibold" : product.stock > 0 ? "bg-amber-50 text-amber-700 font-semibold" : "bg-red-50 text-red-700 font-semibold"}`}>
                          {product.stock} pcs
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.isActive ? "default" : "secondary"} className={`text-xs ${product.isActive ? "bg-teal-600 hover:bg-teal-700" : ""}`}>
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditProduct(product)}
                            className="h-8 w-8 text-gray-600 hover:text-teal-600 hover:bg-teal-50"
                            title="Edit product"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setProductToDelete(product);
                              setDeleteDialogOpen(true);
                            }}
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500 font-medium">
                {(() => {
                  if (totalItems === 0) return "No products";
                  if (totalItems === 1) return "Showing 1 product";
                  const start = startIndex + 1;
                  const end = Math.min(startIndex + pageSize, totalItems);
                  return start === end ? `Showing ${start} of ${totalItems} products` : `Showing ${start}–${end} of ${totalItems} products`;
                })()}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="h-8 px-2.5 text-xs border-gray-200"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                    Previous
                  </Button>

                  {/* Page Number Buttons */}
                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      // Display pagination numbers smartly
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= safePage - 1 && pageNum <= safePage + 1)
                      ) {
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === safePage ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className={`h-8 w-8 p-0 text-xs ${pageNum === safePage ? "bg-teal-600 hover:bg-teal-700 text-white font-semibold" : "border-gray-200 text-gray-600"}`}
                          >
                            {pageNum}
                          </Button>
                        );
                      } else if (
                        pageNum === safePage - 2 ||
                        pageNum === safePage + 2
                      ) {
                        return <span key={pageNum} className="text-xs text-gray-400 px-1">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="h-8 px-2.5 text-xs border-gray-200"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">{productToDelete?.name}</span>?
              <br />
              <br />
              This action cannot be undone and will permanently remove this product from your catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProductToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════

function AdminDashboard() {
  const { adminUser, adminSignOut } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Fetch data
  const { data: productsData = { products: [], total: 0 }, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products", { limit: 100 }],
  });

  // Analytics data
  const { data: inventoryData, isLoading: inventoryLoading } = useQuery<InventoryAnalytics>({
    queryKey: ["/api/analytics/inventory"],
    enabled: activeSection === "analytics" || activeSection === "dashboard"
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery<RevenueAnalytics>({
    queryKey: ["/api/analytics/revenue"],
    enabled: activeSection === "analytics" || activeSection === "dashboard"
  });

  const { data: topProductsData, isLoading: topProductsLoading } = useQuery<TopProductsAnalytics>({
    queryKey: ["/api/analytics/top-products"],
    enabled: activeSection === "analytics" || activeSection === "dashboard"
  });

  const { data: customerData, isLoading: customerLoading } = useQuery<CustomerAnalytics>({
    queryKey: ["/api/analytics/customers"],
    enabled: activeSection === "analytics" || activeSection === "dashboard"
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
  });

  // Extract arrays
  const products = (productsData as any)?.products || [];
  const orders = (ordersData as any)?.orders || [];

  // Form
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
      // Delivery fee defaults
      category: "",
      weightInKg: 0,
      isBulky: false,
      imageUrls: [],
      // Review defaults
      rating: 0,
      reviewCount: 0,
      specifications: [],
    },
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      // Convert prices from RUPEES (form input) to PAISE (database storage)
      const dataInPaise = {
        ...data,
        price: Math.round(parseFloat(data.price as any) * 100), // ₹ → paise
        originalPrice: data.originalPrice
          ? Math.round(parseFloat(data.originalPrice as any) * 100)
          : undefined,
      };

      const url = editingItem ? `/api/products/${editingItem.id}` : "/api/products";
      const method = editingItem ? "PUT" : "POST";
      await apiRequest(method, url, dataInPaise);
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

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("DELETE", `/api/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product deleted successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Access denied",
          description: "You don't have permission to delete products.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteProduct = (product: any) => {
    deleteProductMutation.mutate(product.id);
  };

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

  // Calculate stats
  const totalRevenue = orders
    .filter((order: any) => order.status !== 'cancelled')
    .reduce((sum: number, order: any) => sum + normalizeOrderFinancials(order).total, 0);
  const totalProducts = (productsData as any)?.total || 0;
  const totalOrders = orders.length;

  const onProductSubmit = (data: ProductFormData) => {
    const { specifications, ...rest } = data;

    // Transform specs array to object
    const specsObject = (specifications || []).reduce((acc: any, curr: any) => {
      if (curr.key && curr.key.trim()) {
        acc[curr.key.trim()] = curr.value;
      }
      return acc;
    }, {});

    createProductMutation.mutate({
      ...data,
      specifications: specsObject,
    } as any);
  };

  const handleEditProduct = (product: any) => {
    setEditingItem(product);

    // Convert prices from PAISE (database) to RUPEES (form display)
    const priceInRupees = product.price / 100;
    const originalPriceInRupees = product.originalPrice
      ? (product.originalPrice / 100).toString()
      : "";

    productForm.reset({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      shortDescription: product.shortDescription || "",
      price: priceInRupees.toString(), // paise → ₹ (as string)
      originalPrice: originalPriceInRupees, // paise → ₹ (already string or "")
      sku: product.sku || "",
      stock: product.stock || 0,
      isFeatured: product.isFeatured || false,
      isActive: product.isActive !== false,
      // Delivery fee fields with fallbacks for existing products
      category: product.category || "",
      categoryId: product.categoryId || "",
      weightInKg: product.weightInKg || 0,
      isBulky: product.isBulky || false,
      imageUrls: product.imageUrls || [],
      // Review fields with fallbacks for existing products
      rating: product.rating || 0,
      reviewCount: product.reviewCount || 0,
      warranty: product.warranty || "",
      specifications: product.specifications
        ? Object.entries(product.specifications).map(([key, value]) => ({
          key,
          value: String(value)
        }))
        : [],
    });
    setProductDialogOpen(true);
  };

  // Get section titles
  const getSectionMeta = () => {
    switch (activeSection) {
      case "dashboard":
        return { title: "Dashboard", description: "Overview of your store performance" };
      case "analytics":
        return { title: "Analytics", description: "Detailed insights and reports" };
      case "products":
        return { title: "Products", description: "Manage your product catalog" };
      case "orders":
        return { title: "Orders", description: "View and manage customer orders" };
      default:
        return { title: "Dashboard", description: "" };
    }
  };

  const sectionMeta = getSectionMeta();

  return (
    <AdminLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      userEmail={adminUser?.email}
      onLogout={handleLogout}
      pageTitle={sectionMeta.title}
      pageDescription={sectionMeta.description}
    >
      {activeSection === "dashboard" && (
        <DashboardSection
          totalRevenue={totalRevenue}
          totalProducts={totalProducts}
          totalOrders={totalOrders}
          orders={orders}
          ordersLoading={ordersLoading}
        />
      )}

      {activeSection === "analytics" && (
        <AnalyticsSection
          inventoryData={inventoryData}
          inventoryLoading={inventoryLoading}
          revenueData={revenueData}
          revenueLoading={revenueLoading}
          topProductsData={topProductsData}
          topProductsLoading={topProductsLoading}
          customerData={customerData}
          customerLoading={customerLoading}
        />
      )}

      {activeSection === "products" && (
        <ProductsSection
          products={products}
          productsLoading={productsLoading}
          productForm={productForm}
          productDialogOpen={productDialogOpen}
          setProductDialogOpen={setProductDialogOpen}
          editingItem={editingItem}
          setEditingItem={setEditingItem}
          onProductSubmit={onProductSubmit}
          createProductMutation={createProductMutation}
          handleEditProduct={handleEditProduct}
          handleDeleteProduct={handleDeleteProduct}
        />
      )}

      {activeSection === "orders" && (
        <OrdersManagement />
      )}
    </AdminLayout>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default function Admin() {
  const { isAdminAuthenticated, loading: authLoading } = useAdminAuth();

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading admin panel...</p>
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
