/**
 * Order Management Components for Admin Panel
 * 
 * Provides comprehensive order management UI including:
 * - Order listing with pagination
 * - Status filters and search
 * - Order details modal
 * - Status update with state machine validation
 * - Order history timeline
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
    Eye,
    Package,
    Truck,
    CheckCircle,
    XCircle,
    Clock,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Search,
    MapPin,
    Phone,
    Mail,
    CreditCard,
    Calendar,
    AlertTriangle,
    FileText,
} from "lucide-react";
import { formatPrice } from "@/lib/currency";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    productSku?: string;
    productImageUrl?: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
}

interface OrderHistory {
    id: string;
    orderId: string;
    previousStatus: string | null;
    newStatus: string;
    changedBy: string;
    changedByEmail?: string;
    changedByRole: string;
    reason?: string;
    createdAt: string;
}

interface Order {
    id: string;
    orderNumber?: string;
    userId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    status: OrderStatus;
    subtotal: number;
    tax: number;
    shippingCost: number;
    total: number;
    shippingAddress: {
        firstName: string;
        lastName: string;
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        phone?: string;
    };
    paymentMethod: string;
    paymentStatus: string;
    trackingNumber?: string;
    trackingCarrier?: string;
    trackingUrl?: string;
    cancelledAt?: string;
    cancelledBy?: string;
    cancellationReason?: string;
    itemCount: number;
    createdAt: string;
    updatedAt: string;
}

interface OrderDetails {
    order: Order;
    items: OrderItem[];
    history: OrderHistory[];
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: <Clock className="w-4 h-4" /> },
    confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-800 border-blue-300", icon: <CheckCircle className="w-4 h-4" /> },
    processing: { label: "Processing", color: "bg-purple-100 text-purple-800 border-purple-300", icon: <Package className="w-4 h-4" /> },
    shipped: { label: "Shipped", color: "bg-indigo-100 text-indigo-800 border-indigo-300", icon: <Truck className="w-4 h-4" /> },
    delivered: { label: "Delivered", color: "bg-green-100 text-green-800 border-green-300", icon: <CheckCircle className="w-4 h-4" /> },
    cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800 border-red-300", icon: <XCircle className="w-4 h-4" /> },
};

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["processing", "shipped", "delivered", "cancelled"],
    processing: ["shipped", "delivered", "cancelled"],
    shipped: ["delivered", "cancelled"],
    delivered: [],
    cancelled: [],
};

// ═══════════════════════════════════════════════════════════════════════════
// STATUS BADGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function OrderStatusBadge({ status }: { status: OrderStatus }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
        <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
            {config.icon}
            {config.label}
        </Badge>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// ORDER DETAILS MODAL
// ═══════════════════════════════════════════════════════════════════════════

interface OrderDetailsModalProps {
    orderId: string | null;
    open: boolean;
    onClose: () => void;
}

function OrderDetailsModal({ orderId, open, onClose }: OrderDetailsModalProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [trackingNumber, setTrackingNumber] = useState("");
    const [trackingCarrier, setTrackingCarrier] = useState("");

    const { data: details, isLoading } = useQuery<OrderDetails>({
        queryKey: ["/api/orders", orderId, "details"],
        queryFn: async () => {
            const response = await apiRequest("GET", `/api/orders/${orderId}/details`);
            return response.json();
        },
        enabled: !!orderId && open,
    });

    const updateTrackingMutation = useMutation({
        mutationFn: async () => {
            const response = await apiRequest("PUT", `/api/orders/${orderId}/tracking`, {
                trackingNumber,
                trackingCarrier,
            });
            return response.json();
        },
        onSuccess: () => {
            toast({ title: "Tracking updated", description: "Tracking information has been saved." });
            queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
        },
        onError: (error: any) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    if (!orderId) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Order {details?.order?.orderNumber || `#${orderId.slice(-8)}`}
                    </DialogTitle>
                    <DialogDescription>
                        Created on {details?.order ? new Date(details.order.createdAt).toLocaleString() : "..."}
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                ) : details ? (
                    <div className="space-y-6">
                        {/* Status and Summary */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="text-sm text-gray-600">Current Status</p>
                                <OrderStatusBadge status={details.order.status} />
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Order Total</p>
                                <p className="text-2xl font-bold">{formatPrice(details.order.total)}</p>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium">Customer Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Package className="w-4 h-4 text-gray-500" />
                                        <span>{details.order.customerName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        <span>{details.order.customerEmail}</span>
                                    </div>
                                    {details.order.customerPhone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-gray-500" />
                                            <span>{details.order.customerPhone}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium">Shipping Address</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-1 text-sm">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                                        <div>
                                            <p>{details.order.shippingAddress.firstName} {details.order.shippingAddress.lastName}</p>
                                            <p>{details.order.shippingAddress.street}</p>
                                            <p>{details.order.shippingAddress.city}, {details.order.shippingAddress.state} {details.order.shippingAddress.zipCode}</p>
                                            <p>{details.order.shippingAddress.country}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Payment Info */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" />
                                    Payment Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Method</p>
                                        <p className="font-medium uppercase">{details.order.paymentMethod}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Status</p>
                                        <Badge variant="outline" className="capitalize">{details.order.paymentStatus}</Badge>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Subtotal</p>
                                        <p className="font-medium">{formatPrice(details.order.subtotal)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Tax + Shipping</p>
                                        <p className="font-medium">{formatPrice(details.order.tax + details.order.shippingCost)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Items */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">
                                    Order Items ({details.items.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {details.items.map((item) => (
                                        <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                            {item.productImageUrl ? (
                                                <img
                                                    src={item.productImageUrl}
                                                    alt={item.productName}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                                    <Package className="w-6 h-6 text-gray-400" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="font-medium">{item.productName}</p>
                                                {item.productSku && <p className="text-xs text-gray-500">SKU: {item.productSku}</p>}
                                                <p className="text-sm text-gray-600">
                                                    {formatPrice(item.unitPrice)} × {item.quantity}
                                                </p>
                                            </div>
                                            <p className="font-semibold">{formatPrice(item.totalPrice)}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tracking Info */}
                        {details.order.status === "shipped" && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <Truck className="w-4 h-4" />
                                        Tracking Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {details.order.trackingNumber ? (
                                        <div className="p-3 bg-blue-50 rounded-lg">
                                            <p className="text-sm text-gray-600">Tracking Number</p>
                                            <p className="font-mono font-medium">{details.order.trackingNumber}</p>
                                            {details.order.trackingCarrier && (
                                                <p className="text-sm text-gray-600 mt-1">Carrier: {details.order.trackingCarrier}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Tracking Number</Label>
                                                <Input
                                                    value={trackingNumber}
                                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                                    placeholder="Enter tracking number"
                                                />
                                            </div>
                                            <div>
                                                <Label>Carrier</Label>
                                                <Select value={trackingCarrier} onValueChange={setTrackingCarrier}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select carrier" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="delhivery">Delhivery</SelectItem>
                                                        <SelectItem value="bluedart">Blue Dart</SelectItem>
                                                        <SelectItem value="dtdc">DTDC</SelectItem>
                                                        <SelectItem value="ecom-express">Ecom Express</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="col-span-2">
                                                <Button
                                                    onClick={() => updateTrackingMutation.mutate()}
                                                    disabled={!trackingNumber || updateTrackingMutation.isPending}
                                                >
                                                    {updateTrackingMutation.isPending ? "Saving..." : "Save Tracking Info"}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Order History / Timeline */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Order Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative">
                                    {details.history.map((entry, index) => (
                                        <div key={entry.id} className="flex gap-4 pb-4 last:pb-0">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-3 h-3 rounded-full ${index === 0 ? "bg-blue-500" : "bg-gray-300"}`} />
                                                {index < details.history.length - 1 && (
                                                    <div className="w-0.5 h-full bg-gray-200 mt-1" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {entry.newStatus}
                                                    </Badge>
                                                    <span className="text-xs text-gray-500">
                                                        {entry.previousStatus ? `from ${entry.previousStatus}` : ""}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(entry.createdAt).toLocaleString()}
                                                    {entry.changedByEmail && ` by ${entry.changedByEmail}`}
                                                </p>
                                                {entry.reason && (
                                                    <p className="text-xs text-gray-600 mt-1">Reason: {entry.reason}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cancellation Info */}
                        {details.order.status === "cancelled" && (
                            <Card className="border-red-200 bg-red-50">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-700">
                                        <AlertTriangle className="w-4 h-4" />
                                        Order Cancelled
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-red-700">
                                    <p>Cancelled on: {details.order.cancelledAt ? new Date(details.order.cancelledAt).toLocaleString() : "N/A"}</p>
                                    <p>Reason: {details.order.cancellationReason || "No reason provided"}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-8">Failed to load order details</p>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// STATUS UPDATE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface StatusUpdateProps {
    orderId: string;
    currentStatus: OrderStatus;
    onSuccess?: () => void;
}

function StatusUpdateSelect({ orderId, currentStatus, onSuccess }: StatusUpdateProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancelReason, setCancelReason] = useState("");

    const validNextStatuses = VALID_TRANSITIONS[currentStatus] || [];

    const updateStatusMutation = useMutation({
        mutationFn: async ({ status, reason }: { status: OrderStatus; reason?: string }) => {
            const response = await apiRequest("PUT", `/api/orders/${orderId}/status`, { status, reason });
            return response.json();
        },
        onSuccess: (data) => {
            toast({ title: "Status updated", description: data.message });
            queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
            onSuccess?.();
        },
        onError: (error: any) => {
            toast({ title: "Update failed", description: error.message, variant: "destructive" });
        },
    });

    const handleStatusChange = (newStatus: string) => {
        if (newStatus === "cancelled") {
            setShowCancelDialog(true);
        } else {
            updateStatusMutation.mutate({ status: newStatus as OrderStatus });
        }
    };

    const handleConfirmCancel = () => {
        updateStatusMutation.mutate({ status: "cancelled", reason: cancelReason });
        setShowCancelDialog(false);
        setCancelReason("");
    };

    // Terminal states - no changes allowed
    if (validNextStatuses.length === 0) {
        return <OrderStatusBadge status={currentStatus} />;
    }

    return (
        <>
            <Select value={currentStatus} onValueChange={handleStatusChange} disabled={updateStatusMutation.isPending}>
                <SelectTrigger className="w-[140px]">
                    <SelectValue>
                        {STATUS_CONFIG[currentStatus]?.label || currentStatus}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={currentStatus} disabled>
                        {STATUS_CONFIG[currentStatus]?.label} (current)
                    </SelectItem>
                    {validNextStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                            {STATUS_CONFIG[status]?.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel this order? Stock will be restored for all items.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Label htmlFor="cancelReason">Reason (optional)</Label>
                        <Textarea
                            id="cancelReason"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Enter reason for cancellation..."
                            className="mt-2"
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep Order</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmCancel}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Cancel Order
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ORDERS MANAGEMENT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function OrdersManagement() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const pageSize = 20;

    // Fetch order stats for filter counts
    const { data: stats } = useQuery<Record<string, number>>({
        queryKey: ["/api/orders/stats"],
        queryFn: async () => {
            const response = await apiRequest("GET", "/api/orders/stats");
            return response.json();
        },
    });

    // Fetch orders with filters
    const { data: ordersResponse, isLoading, refetch } = useQuery({
        queryKey: ["/api/orders", { status: statusFilter, offset: currentPage * pageSize, limit: pageSize }],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (statusFilter !== "all") params.set("status", statusFilter);
            params.set("offset", String(currentPage * pageSize));
            params.set("limit", String(pageSize));

            const response = await apiRequest("GET", `/api/orders?${params.toString()}`);
            return response.json();
        },
    });

    const orders: Order[] = ordersResponse?.orders || [];
    const hasMore = ordersResponse?.pagination?.hasMore || false;

    // Filter orders by search query (client-side)
    const filteredOrders = orders.filter((order) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            order.orderNumber?.toLowerCase().includes(query) ||
            order.id.toLowerCase().includes(query) ||
            order.customerName?.toLowerCase().includes(query) ||
            order.customerEmail?.toLowerCase().includes(query)
        );
    });

    const handleViewDetails = (orderId: string) => {
        setSelectedOrderId(orderId);
        setDetailsModalOpen(true);
    };

    const totalOrders = Object.values(stats || {}).reduce((sum, count) => sum + count, 0);

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Order Management
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                refetch();
                                queryClient.invalidateQueries({ queryKey: ["/api/orders/stats"] });
                            }}
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Status Filter Tabs */}
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={statusFilter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => { setStatusFilter("all"); setCurrentPage(0); }}
                    >
                        All ({totalOrders})
                    </Button>
                    {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((status) => (
                        <Button
                            key={status}
                            variant={statusFilter === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => { setStatusFilter(status); setCurrentPage(0); }}
                            className="flex items-center gap-1"
                        >
                            {STATUS_CONFIG[status].icon}
                            {STATUS_CONFIG[status].label} ({stats?.[status] || 0})
                        </Button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                        placeholder="Search by order number, customer name, or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Separator />

                {/* Orders Table */}
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="w-full h-16" />
                        ))}
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No orders found</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order #</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono font-medium">
                                        {order.orderNumber || `#${order.id.slice(-8)}`}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{order.customerName || "N/A"}</p>
                                            <p className="text-xs text-gray-500">{order.customerEmail}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>{order.itemCount} items</TableCell>
                                    <TableCell className="font-semibold">
                                        {formatPrice(order.total)}
                                    </TableCell>
                                    <TableCell>
                                        <StatusUpdateSelect
                                            orderId={order.id}
                                            currentStatus={order.status}
                                        />
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-600">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleViewDetails(order.id)}
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                {/* Pagination */}
                {(currentPage > 0 || hasMore) && (
                    <div className="flex items-center justify-between pt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                            disabled={currentPage === 0}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Previous
                        </Button>
                        <span className="text-sm text-gray-600">
                            Page {currentPage + 1}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => p + 1)}
                            disabled={!hasMore}
                        >
                            Next
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                )}
            </CardContent>

            {/* Order Details Modal */}
            <OrderDetailsModal
                orderId={selectedOrderId}
                open={detailsModalOpen}
                onClose={() => {
                    setDetailsModalOpen(false);
                    setSelectedOrderId(null);
                }}
            />
        </Card>
    );
}

export default OrdersManagement;
