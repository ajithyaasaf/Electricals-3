import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { signInWithGoogle } from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ArrowLeft, CreditCard, Truck, Lock, CheckCircle } from "lucide-react";

interface CheckoutFormData {
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  billingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentMethod: string;
  sameAsShipping: boolean;
}

export default function Checkout() {
  const { isAuthenticated, loading: authLoading } = useFirebaseAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CheckoutFormData>({
    shippingAddress: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
    billingAddress: {
      firstName: "",
      lastName: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
    paymentMethod: "credit-card",
    sameAsShipping: true,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);

  // Fetch cart items
  const { data: cartItems = [], isLoading: cartLoading } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order placed successfully!",
        description: `Your order #${order.orderNumber} has been confirmed.`,
      });
      setOrderComplete(true);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to proceed with checkout.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
    }
  }, [isAuthenticated, authLoading, toast]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="w-full h-96" />
        </div>
      </div>
    );
  }

  // Redirect if cart is empty
  if (!cartLoading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Cart is Empty</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Add some items to your cart before proceeding to checkout.</p>
          <Button asChild className="bg-copper-600 hover:bg-copper-700">
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Calculate totals
  const subtotal = cartItems.reduce((total: number, item: any) => {
    const price = parseFloat(item.product?.price || "0");
    return total + (price * item.quantity);
  }, 0);

  const shipping = subtotal > 100 ? 0 : 15.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const updateFormData = (section: keyof CheckoutFormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const updateRootField = (field: keyof CheckoutFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Shipping
        const shippingAddr = formData.shippingAddress;
        return !!(shippingAddr.firstName && shippingAddr.lastName && shippingAddr.email && 
                 shippingAddr.phone && shippingAddr.street && shippingAddr.city && 
                 shippingAddr.state && shippingAddr.zipCode);
      case 2: // Payment
        return !!formData.paymentMethod;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    } else {
      toast({
        title: "Incomplete information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
    }
  };

  const handlePlaceOrder = () => {
    if (validateStep(1) && validateStep(2)) {
      const orderData = {
        total: total.toFixed(2),
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        shippingCost: shipping.toFixed(2),
        shippingAddress: formData.shippingAddress,
        billingAddress: formData.sameAsShipping ? formData.shippingAddress : formData.billingAddress,
        paymentMethod: formData.paymentMethod,
        status: "pending",
        items: cartItems.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: parseFloat(item.product?.price || "0"),
        })),
      };
      
      createOrderMutation.mutate(orderData);
    } else {
      toast({
        title: "Incomplete information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
    }
  };

  // Order success screen
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Order Confirmed!</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Thank you for your purchase. We'll send you a confirmation email shortly.
            </p>
            <div className="space-x-4">
              <Button asChild className="bg-copper-600 hover:bg-copper-700">
                <Link href="/account?tab=orders">View Orders</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button variant="ghost" asChild className="mr-4">
            <Link href="/cart">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main checkout form */}
          <div className="lg:col-span-2">
            <Tabs value={currentStep.toString()} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="1" disabled={currentStep < 1}>
                  <Truck className="w-4 h-4 mr-2" />
                  Shipping
                </TabsTrigger>
                <TabsTrigger value="2" disabled={currentStep < 2}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Payment
                </TabsTrigger>
                <TabsTrigger value="3" disabled={currentStep < 3}>
                  <Lock className="w-4 h-4 mr-2" />
                  Review
                </TabsTrigger>
              </TabsList>

              {/* Step 1: Shipping Information */}
              <TabsContent value="1" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.shippingAddress.firstName}
                          onChange={(e) => updateFormData("shippingAddress", "firstName", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.shippingAddress.lastName}
                          onChange={(e) => updateFormData("shippingAddress", "lastName", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.shippingAddress.email}
                        onChange={(e) => updateFormData("shippingAddress", "email", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.shippingAddress.phone}
                        onChange={(e) => updateFormData("shippingAddress", "phone", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="street">Street Address *</Label>
                      <Input
                        id="street"
                        value={formData.shippingAddress.street}
                        onChange={(e) => updateFormData("shippingAddress", "street", e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={formData.shippingAddress.city}
                          onChange={(e) => updateFormData("shippingAddress", "city", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Select
                          value={formData.shippingAddress.state}
                          onValueChange={(value) => updateFormData("shippingAddress", "state", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="State" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CA">California</SelectItem>
                            <SelectItem value="NY">New York</SelectItem>
                            <SelectItem value="TX">Texas</SelectItem>
                            <SelectItem value="FL">Florida</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP Code *</Label>
                        <Input
                          id="zipCode"
                          value={formData.shippingAddress.zipCode}
                          onChange={(e) => updateFormData("shippingAddress", "zipCode", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleNext} className="bg-copper-600 hover:bg-copper-700">
                        Continue to Payment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Step 2: Payment Information */}
              <TabsContent value="2" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Payment Method</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="credit-card"
                            name="paymentMethod"
                            value="credit-card"
                            checked={formData.paymentMethod === "credit-card"}
                            onChange={(e) => updateRootField("paymentMethod", e.target.value)}
                          />
                          <label htmlFor="credit-card" className="text-sm font-medium">
                            Credit/Debit Card
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="razorpay"
                            name="paymentMethod"
                            value="razorpay"
                            checked={formData.paymentMethod === "razorpay"}
                            onChange={(e) => updateRootField("paymentMethod", e.target.value)}
                          />
                          <label htmlFor="razorpay" className="text-sm font-medium">
                            Razorpay (UPI, Cards, NetBanking)
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <Checkbox
                          id="sameAsShipping"
                          checked={formData.sameAsShipping}
                          onCheckedChange={(checked) => updateRootField("sameAsShipping", checked)}
                        />
                        <Label htmlFor="sameAsShipping">Billing address same as shipping</Label>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentStep(1)}
                      >
                        Back
                      </Button>
                      <Button onClick={handleNext} className="bg-copper-600 hover:bg-copper-700">
                        Review Order
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Step 3: Review Order */}
              <TabsContent value="3" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Review Your Order</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Shipping Address</h3>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <p>{formData.shippingAddress.firstName} {formData.shippingAddress.lastName}</p>
                        <p>{formData.shippingAddress.street}</p>
                        <p>{formData.shippingAddress.city}, {formData.shippingAddress.state} {formData.shippingAddress.zipCode}</p>
                        <p>{formData.shippingAddress.phone}</p>
                        <p>{formData.shippingAddress.email}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Payment Method</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {formData.paymentMethod === "credit-card" ? "Credit/Debit Card" : "Razorpay"}
                      </p>
                    </div>

                    <div className="flex justify-between">
                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentStep(2)}
                      >
                        Back
                      </Button>
                      <Button 
                        onClick={handlePlaceOrder}
                        disabled={createOrderMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {createOrderMutation.isPending ? "Processing..." : `Place Order ($${total.toFixed(2)})`}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {cartItems.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.product?.name} × {item.quantity}</span>
                      <span>${(parseFloat(item.product?.price || "0") * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                
                {subtotal < 100 && (
                  <div className="text-xs text-gray-500 mt-2">
                    Add ${(100 - subtotal).toFixed(2)} more for free shipping!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}