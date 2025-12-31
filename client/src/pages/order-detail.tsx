/**
 * Order Detail Page - Customer View
 * 
 * Shows detailed order information to customers including:
 * - Order status and timeline
 * - Order items with images
 * - Shipping and payment details
 * - Tracking information
 * - Cancel order functionality (for pending/confirmed orders)
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { apiRequest } from "@/lib/queryClient";
import { formatPrice } from "@/lib/currency";
import {
    Package,
    Truck,
    CheckCircle,
    XCircle,
    Clock,
    ArrowLeft,
    MapPin,
    CreditCard,
    CalendarDays,
    ExternalLink,
    AlertTriangle,
    Phone,
    Mail,
    Copy,
} from "lucide-react";
import { BANK_DETAILS } from "@/lib/constants";
import { BankTransferProofForm } from "@/components/payment/bank-transfer-proof-form";

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
    changedByRole: string;
    reason?: string;
    createdAt: string;
}

interface Order {
    id: string;
    orderNumber?: string;
    status: OrderStatus;
    total: number;
    subtotal: number;
    tax: number;
    shippingCost: number;
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

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode; description: string }> = {
    pending: {
        label: "Order Placed",
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: <Clock className="w-5 h-5" />,
        description: "Your order has been received and is awaiting confirmation."
    },
    confirmed: {
        label: "Confirmed",
        color: "bg-blue-100 text-blue-800 border-blue-300",
        icon: <CheckCircle className="w-5 h-5" />,
        description: "Your order has been confirmed and is being prepared."
    },
    processing: {
        label: "Processing",
        color: "bg-purple-100 text-purple-800 border-purple-300",
        icon: <Package className="w-5 h-5" />,
        description: "Your order is being packaged and prepared for shipping."
    },
    shipped: {
        label: "Shipped",
        color: "bg-indigo-100 text-indigo-800 border-indigo-300",
        icon: <Truck className="w-5 h-5" />,
        description: "Your order is on its way!"
    },
    delivered: {
        label: "Delivered",
        color: "bg-green-100 text-green-800 border-green-300",
        icon: <CheckCircle className="w-5 h-5" />,
        description: "Your order has been delivered successfully."
    },
    cancelled: {
        label: "Cancelled",
        color: "bg-red-100 text-red-800 border-red-300",
        icon: <XCircle className="w-5 h-5" />,
        description: "This order has been cancelled."
    },
};

const STATUS_STEPS: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered"];

// ═══════════════════════════════════════════════════════════════════════════
// STATUS TIMELINE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function OrderStatusTimeline({ currentStatus }: { currentStatus: OrderStatus }) {
    if (currentStatus === "cancelled") {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-red-700">Order Cancelled</h3>
                <p className="text-sm text-red-600 mt-1">{STATUS_CONFIG.cancelled.description}</p>
            </div>
        );
    }

    const currentIndex = STATUS_STEPS.indexOf(currentStatus);

    return (
        <div className="relative">
            {/* Progress bar */}
            <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 rounded">
                <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded transition-all duration-500"
                    style={{ width: `${(currentIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                />
            </div>

            {/* Steps */}
            <div className="relative flex justify-between">
                {STATUS_STEPS.map((status, index) => {
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;
                    const config = STATUS_CONFIG[status];

                    return (
                        <div key={status} className="flex flex-col items-center">
                            <div
                                className={`
                  w-10 h-10 rounded-full flex items-center justify-center z-10
                  transition-all duration-300
                  ${isCompleted
                                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                                        : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                                    }
                  ${isCurrent ? "ring-4 ring-amber-200" : ""}
                `}
                            >
                                {isCompleted ? <CheckCircle className="w-5 h-5" /> : config.icon}
                            </div>
                            <span
                                className={`mt-2 text-xs font-medium ${isCompleted ? "text-amber-700" : "text-gray-400"
                                    }`}
                            >
                                {config.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function OrderDetail() {
    const [, params] = useRoute("/account/orders/:orderId");
    const orderId = params?.orderId;
    const { isAuthenticated, loading: authLoading } = useFirebaseAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancelReason, setCancelReason] = useState("");

    // Fetch order details
    const { data: details, isLoading, error } = useQuery<OrderDetails>({
        queryKey: ["/api/orders", orderId, "details"],
        queryFn: async () => {
            const response = await apiRequest("GET", `/api/orders/${orderId}/details`);
            return response.json();
        },
        enabled: !!orderId && isAuthenticated,
    });

    // Cancel order mutation
    const cancelMutation = useMutation({
        mutationFn: async () => {
            const response = await apiRequest("POST", `/api/orders/${orderId}/cancel`, {
                reason: cancelReason,
            });
            return response.json();
        },
        onSuccess: (data) => {
            toast({
                title: "Order cancelled",
                description: data.message,
            });
            queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
            setShowCancelDialog(false);
            setCancelReason("");
        },
        onError: (error: any) => {
            toast({
                title: "Failed to cancel",
                description: error.message || "Could not cancel order",
                variant: "destructive",
            });
        },
    });

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied to clipboard" });
    };

    // Loading state
    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Header />
                <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
                <Footer />
            </div>
        );
    }

    // Error or not found
    if (error || !details) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Header />
                <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                    <AlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
                    <p className="text-gray-600 mb-6">
                        We couldn't find this order. Please check the order ID or go back to your orders.
                    </p>
                    <Link href="/account">
                        <Button>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to My Account
                        </Button>
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    const { order, items, history } = details;
    const config = STATUS_CONFIG[order.status];
    const canCancel = ["pending", "confirmed"].includes(order.status);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Back button and header */}
                <div className="mb-6">
                    <Link href="/account">
                        <Button variant="ghost" size="sm" className="mb-4">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to My Account
                        </Button>
                    </Link>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Order {order.orderNumber || `#${order.id.slice(-8)}`}
                            </h1>
                            <p className="text-gray-600 flex items-center gap-2 mt-1">
                                <CalendarDays className="w-4 h-4" />
                                Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </p>
                        </div>
                        <Badge variant="outline" className={`${config.color} text-sm px-3 py-1`}>
                            {config.icon}
                            <span className="ml-2">{config.label}</span>
                        </Badge>
                    </div>
                </div>

                {/* Order Status Timeline */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg">Order Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <OrderStatusTimeline currentStatus={order.status} />
                        <p className="text-center text-gray-600 mt-4">{config.description}</p>
                    </CardContent>
                </Card>

                {/* Bank Transfer Payment Action */}
                {order.paymentMethod === "bank_transfer" &&
                    (order.paymentStatus === "awaiting_payment" || order.paymentStatus === "verification_pending") && (
                        <Card className="mb-6 border-blue-200 bg-blue-50">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
                                    <CreditCard className="w-5 h-5" />
                                    {order.paymentStatus === "verification_pending"
                                        ? "Payment Verification Pending"
                                        : "Complete Your Payment"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {order.paymentStatus === "verification_pending" ? (
                                    <div className="flex items-center gap-3 text-blue-800">
                                        <Clock className="w-5 h-5" />
                                        <p>
                                            We have received your payment proof and are verifying the details.
                                            This usually takes 1-2 hours. You will be notified once approved.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <p className="text-sm text-blue-800">
                                            Please transfer <strong>{formatPrice(order.total)}</strong> to the account below and upload the proof.
                                        </p>

                                        {/* Bank Details Card */}
                                        <div className="bg-white p-4 rounded border border-blue-100">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-500 text-xs uppercase">Bank Name</p>
                                                    <p className="font-medium">{BANK_DETAILS.bankName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-xs uppercase">Account Name</p>
                                                    <p className="font-medium">{BANK_DETAILS.accountName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-xs uppercase">Account Number</p>
                                                    <p className="font-mono font-medium tracking-wide">{BANK_DETAILS.accountNumber}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-xs uppercase">IFSC Code</p>
                                                    <p className="font-mono font-medium">{BANK_DETAILS.ifscCode}</p>
                                                </div>
                                                <div className="col-span-1 md:col-span-2">
                                                    <p className="text-gray-500 text-xs uppercase">UPI ID</p>
                                                    <p className="font-medium">{BANK_DETAILS.upiId}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <BankTransferProofForm
                                            orderId={order.id}
                                            onSuccess={() => {
                                                queryClient.invalidateQueries({ queryKey: [`/api/orders/${order.id}`] });
                                                toast({ title: "Payment Proof Submitted" });
                                            }}
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                {/* Tracking Info (if shipped) */}
                {order.trackingNumber && (
                    <Card className="mb-6 border-blue-200 bg-blue-50">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Truck className="w-5 h-5 text-blue-600" />
                                Tracking Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Tracking Number:</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-medium">{order.trackingNumber}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(order.trackingNumber!)}
                                    >
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            {order.trackingCarrier && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Carrier:</span>
                                    <span className="font-medium capitalize">{order.trackingCarrier}</span>
                                </div>
                            )}
                            {order.trackingUrl && (
                                <a
                                    href={order.trackingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                                >
                                    Track Package <ExternalLink className="w-4 h-4" />
                                </a>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Order Items */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg">Items in Your Order ({items.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y">
                        {items.map((item) => (
                            <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                                {item.productImageUrl ? (
                                    <img
                                        src={item.productImageUrl}
                                        alt={item.productName}
                                        className="w-20 h-20 object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <Package className="w-8 h-8 text-gray-400" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h4 className="font-medium">{item.productName}</h4>
                                    {item.productSku && (
                                        <p className="text-xs text-gray-500">SKU: {item.productSku}</p>
                                    )}
                                    <p className="text-sm text-gray-600 mt-1">
                                        {formatPrice(item.unitPrice)} × {item.quantity}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">{formatPrice(item.totalPrice)}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Shipping & Payment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Shipping Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-1">
                            <p className="font-medium">
                                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                            </p>
                            <p>{order.shippingAddress.street}</p>
                            <p>
                                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                                {order.shippingAddress.zipCode}
                            </p>
                            <p>{order.shippingAddress.country}</p>
                            {order.shippingAddress.phone && (
                                <p className="flex items-center gap-2 pt-2">
                                    <Phone className="w-4 h-4 text-gray-500" />
                                    {order.shippingAddress.phone}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Payment Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span>{formatPrice(order.subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax (GST)</span>
                                    <span>{formatPrice(order.tax)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span>
                                        {order.shippingCost === 0 ? (
                                            <span className="text-green-600">Free</span>
                                        ) : (
                                            formatPrice(order.shippingCost)
                                        )}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-base font-semibold">
                                    <span>Total</span>
                                    <span>{formatPrice(order.total)}</span>
                                </div>
                                <div className="flex justify-between pt-2">
                                    <span className="text-gray-600">Payment Method</span>
                                    <Badge variant="outline" className="uppercase">
                                        {order.paymentMethod}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Order Activity / History */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg">Order Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative space-y-4">
                            {history.map((entry, index) => (
                                <div key={entry.id} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-3 h-3 rounded-full ${index === 0 ? "bg-amber-500" : "bg-gray-300"}`} />
                                        {index < history.length - 1 && <div className="w-0.5 flex-1 bg-gray-200" />}
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="capitalize">{entry.newStatus}</Badge>
                                            {entry.previousStatus && (
                                                <span className="text-xs text-gray-500">from {entry.previousStatus}</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(entry.createdAt).toLocaleString("en-IN")}
                                        </p>
                                        {entry.reason && (
                                            <p className="text-sm text-gray-600 mt-1">{entry.reason}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Cancellation Info */}
                {order.status === "cancelled" && order.cancellationReason && (
                    <Card className="mb-6 border-red-200 bg-red-50">
                        <CardHeader>
                            <CardTitle className="text-lg text-red-700 flex items-center gap-2">
                                <XCircle className="w-5 h-5" />
                                Cancellation Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-red-700">
                            <p><strong>Reason:</strong> {order.cancellationReason}</p>
                            {order.cancelledAt && (
                                <p className="mt-1">
                                    <strong>Cancelled on:</strong>{" "}
                                    {new Date(order.cancelledAt).toLocaleString("en-IN")}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-4">
                    <Link href="/support">
                        <Button variant="outline">Need Help?</Button>
                    </Link>
                    {canCancel && (
                        <Button
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => setShowCancelDialog(true)}
                        >
                            Cancel Order
                        </Button>
                    )}
                </div>

                {/* Cancel Dialog */}
                <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to cancel order {order.orderNumber || `#${order.id.slice(-8)}`}?
                                This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                            <Label htmlFor="cancelReason">Reason for cancellation (optional)</Label>
                            <Textarea
                                id="cancelReason"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Tell us why you're cancelling..."
                                className="mt-2"
                            />
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Keep Order</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => cancelMutation.mutate()}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={cancelMutation.isPending}
                            >
                                {cancelMutation.isPending ? "Cancelling..." : "Yes, Cancel Order"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </main>

            <Footer />
        </div>
    );
}
