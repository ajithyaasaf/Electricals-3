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
import { ImageUpload } from "@/components/admin/image-upload";
import { formatPrice } from "@/lib/currency";
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
} from "lucide-react";

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
  stock: z.number().min(0, "Stock must be 0 or greater"),
  imageUrls: z.array(z.string()).optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  // Delivery fee calculation fields
  category: z.string().optional(),
  weightInKg: z.number().min(0, "Weight cannot be negative").default(0),
  isBulky: z.boolean().default(false),
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

interface DashboardSectionProps {
  totalRevenue: number;
  totalProducts: number;
  totalOrders: number;
  orders: any[];
  ordersLoading: boolean;
}

function DashboardSection({ totalRevenue, totalProducts, totalOrders, orders, ordersLoading }: DashboardSectionProps) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {formatPrice(totalRevenue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900">{totalProducts}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50 sm:col-span-2 lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900">{totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="w-full h-16 rounded-lg" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">#{order.id.slice(-8)}</p>
                    <p className="text-sm text-gray-600">
                      {order.customerName || 'Unknown'} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatPrice(order.total)}</p>
                    <Badge variant="outline" className="text-xs capitalize">
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

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
  return (
    <div className="space-y-6">
      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {revenueLoading ? (
                    <Skeleton className="w-20 h-8" />
                  ) : (
                    `₹${revenueData?.totalRevenue ? (revenueData.totalRevenue / 12).toFixed(0) : '0'}`
                  )}
                </p>
                {!revenueLoading && revenueData?.revenueGrowth && (
                  <p className="text-sm text-green-600">+{revenueData.revenueGrowth}% from last month</p>
                )}
              </div>
              <BarChart3 className="w-8 h-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>


      </div>

      {/* Analytics Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Performance */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Inventory Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {inventoryLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="w-full h-12" />)}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-600 mb-2">Fast Selling Products</h4>
                  {inventoryData?.fastSelling?.slice(0, 3).map((product: any) => (
                    <div key={product.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium">{product.name}</span>
                      <div className="text-right">
                        <span className="text-xs text-gray-500">{product.totalSold} sold</span>
                        <div className="text-xs text-green-600">{product.salesVelocity.toFixed(1)}/day</div>
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
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Top Revenue Products</CardTitle>
          </CardHeader>
          <CardContent>
            {topProductsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="w-full h-12" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {topProductsData?.topByRevenue?.slice(0, 5).map((product: any, index: number) => (
                  <div key={product.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <span className="text-sm font-medium">#{index + 1} {product.name}</span>
                      <div className="text-xs text-gray-500">{product.totalQuantitySold} units sold</div>
                    </div>
                    <span className="text-sm font-bold text-teal-600">₹{product.totalRevenue.toFixed(0)}</span>
                  </div>
                )) || <p className="text-sm text-gray-500">No sales data available</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Customer Analytics */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Customer Insights</CardTitle>
        </CardHeader>
        <CardContent>
          {customerLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="w-full h-16" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-teal-600">{customerData?.totalCustomers || 0}</p>
                <p className="text-sm text-gray-600">Total Customers</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-green-600">{customerData?.repeatCustomers || 0}</p>
                <p className="text-sm text-gray-600">Repeat Customers</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-700">₹{customerData?.avgCustomerValue?.toFixed(0) || 0}</p>
                <p className="text-sm text-gray-600">Avg Customer Value</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-700">{customerData?.avgOrdersPerCustomer?.toFixed(1) || 0}</p>
                <p className="text-sm text-gray-600">Avg Orders/Customer</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
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
  onProductSubmit,
  createProductMutation,
  handleEditProduct,
  handleDeleteProduct,  // Add delete handler
}: ProductsSectionProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);

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
              <Button className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/30">
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
                            <Input type="number" step="0.01" {...field} placeholder="0.00" />
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
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              placeholder="0"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Delivery Fee Configuration */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700">Delivery Information</h3>

                    <FormField
                      control={productForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Wires and Cables" />
                          </FormControl>
                          <p className="text-xs text-gray-500">Used for default weight if not specified</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={productForm.control}
                        name="weightInKg"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                              />
                            </FormControl>
                            <p className="text-xs text-gray-500">Actual product weight</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={productForm.control}
                        name="isBulky"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-gray-200 p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-medium">
                                Bulky Item
                              </FormLabel>
                              <p className="text-xs text-gray-500">
                                Requires truck/special delivery
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

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
        {productsLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="w-full h-16" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>No products yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Price</TableHead>
                  <TableHead className="hidden sm:table-cell">Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{product.name}</span>
                        <div className="sm:hidden text-sm text-gray-500">
                          {formatPrice(product.price)} • Stock: {product.stock}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{formatPrice(product.price)}</TableCell>
                    <TableCell className="hidden sm:table-cell">{product.stock}</TableCell>
                    <TableCell>
                      <Badge variant={product.isActive ? "default" : "secondary"} className="text-xs">
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditProduct(product)}
                          className="h-8 w-8"
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
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
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
  const totalRevenue = orders.reduce((sum: number, order: any) =>
    sum + parseFloat(order.total || "0"), 0);
  const totalProducts = (productsData as any)?.total || 0;
  const totalOrders = orders.length;

  const onProductSubmit = (data: ProductFormData) => {
    createProductMutation.mutate(data);
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
      weightInKg: product.weightInKg || 0,
      isBulky: product.isBulky || false,
      imageUrls: product.imageUrls || [],
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
