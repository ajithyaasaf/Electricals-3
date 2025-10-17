import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
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
import { useCartContext } from "@/contexts/cart-context";
import { signInWithGoogle } from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatPrice } from "@/lib/currency";
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
  const { cart } = useCartContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

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
    paymentMethod: "razorpay",
    sameAsShipping: true,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);

  // Get cart items from context
  const cartItems = cart?.items || [];
  const cartLoading = false;

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

  // Show loading while auth is being determined
  if (authLoading) {
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

  const shipping = subtotal >= 10000 ? 0 : 100; // ₹100 shipping for orders below ₹10,000
  const tax = subtotal * 0.18; // 18% GST for India
  const total = subtotal + shipping + tax;

  const updateFormData = (section: keyof CheckoutFormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
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
    if (!isAuthenticated) {
      toast({
        title: "Please sign in to complete your order",
        description: "You need to sign in to place an order. Your cart items will be saved.",
        variant: "default",
      });
      // Don't automatically call signInWithGoogle, let user choose
      return;
    }

    if (validateStep(1) && validateStep(2)) {
      const orderData = {
        total: total,
        shippingAddress: {
          ...formData.shippingAddress,
          country: "India"
        },
        paymentMethod: formData.paymentMethod,
        status: "pending"
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

        {/* Guest Checkout Notice */}
        {!isAuthenticated && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Guest Checkout</h3>
                <p className="mt-1 text-sm text-blue-600 dark:text-blue-300">
                  You can fill out your shipping information now, but you'll need to sign in before placing your order. 
                  Don't worry - your cart items will be saved!
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 text-blue-600 border-blue-300 hover:bg-blue-100 dark:text-blue-400 dark:border-blue-600 dark:hover:bg-blue-900/40"
                  onClick={() => setLocation('/auth')}
                  data-testid="button-sign-in-checkout"
                >
                  Sign In Now
                </Button>
              </div>
            </div>
          </div>
        )}

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
                          <SelectContent className="max-h-[200px] overflow-y-auto">
                            <SelectItem value="AP">Andhra Pradesh</SelectItem>
                            <SelectItem value="AR">Arunachal Pradesh</SelectItem>
                            <SelectItem value="AS">Assam</SelectItem>
                            <SelectItem value="BR">Bihar</SelectItem>
                            <SelectItem value="CG">Chhattisgarh</SelectItem>
                            <SelectItem value="GA">Goa</SelectItem>
                            <SelectItem value="GJ">Gujarat</SelectItem>
                            <SelectItem value="HR">Haryana</SelectItem>
                            <SelectItem value="HP">Himachal Pradesh</SelectItem>
                            <SelectItem value="JH">Jharkhand</SelectItem>
                            <SelectItem value="KA">Karnataka</SelectItem>
                            <SelectItem value="KL">Kerala</SelectItem>
                            <SelectItem value="MP">Madhya Pradesh</SelectItem>
                            <SelectItem value="MH">Maharashtra</SelectItem>
                            <SelectItem value="MN">Manipur</SelectItem>
                            <SelectItem value="ML">Meghalaya</SelectItem>
                            <SelectItem value="MZ">Mizoram</SelectItem>
                            <SelectItem value="NL">Nagaland</SelectItem>
                            <SelectItem value="OR">Odisha</SelectItem>
                            <SelectItem value="PB">Punjab</SelectItem>
                            <SelectItem value="RJ">Rajasthan</SelectItem>
                            <SelectItem value="SK">Sikkim</SelectItem>
                            <SelectItem value="TN">Tamil Nadu</SelectItem>
                            <SelectItem value="TS">Telangana</SelectItem>
                            <SelectItem value="TR">Tripura</SelectItem>
                            <SelectItem value="UK">Uttarakhand</SelectItem>
                            <SelectItem value="UP">Uttar Pradesh</SelectItem>
                            <SelectItem value="WB">West Bengal</SelectItem>
                            <SelectItem value="AN">Andaman and Nicobar Islands</SelectItem>
                            <SelectItem value="CH">Chandigarh</SelectItem>
                            <SelectItem value="DH">Dadra and Nagar Haveli and Daman and Diu</SelectItem>
                            <SelectItem value="DL">Delhi</SelectItem>
                            <SelectItem value="JK">Jammu and Kashmir</SelectItem>
                            <SelectItem value="LA">Ladakh</SelectItem>
                            <SelectItem value="LD">Lakshadweep</SelectItem>
                            <SelectItem value="PY">Puducherry</SelectItem>
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
                            id="razorpay"
                            name="paymentMethod"
                            value="razorpay"
                            checked={formData.paymentMethod === "razorpay"}
                            onChange={(e) => updateRootField("paymentMethod", e.target.value)}
                          />
                          <label htmlFor="razorpay" className="text-sm font-medium">
                            Razorpay (UPI, Cards, NetBanking, Wallets)
                          </label>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Pay securely using UPI, Credit/Debit Cards, Net Banking, or Digital Wallets
                        </p>
                        
                        <div className="flex items-center space-x-2 mt-4">
                          <input
                            type="radio"
                            id="cod"
                            name="paymentMethod"
                            value="cod"
                            checked={formData.paymentMethod === "cod"}
                            onChange={(e) => updateRootField("paymentMethod", e.target.value)}
                          />
                          <label htmlFor="cod" className="text-sm font-medium">
                            Cash on Delivery (COD)
                          </label>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Pay cash when your order is delivered. Available across India. No additional charges.
                        </p>
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
                        {formData.paymentMethod === "razorpay" 
                          ? "Razorpay (UPI, Cards, NetBanking, Wallets)"
                          : "Cash on Delivery (COD)"}
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
                        {createOrderMutation.isPending ? "Processing..." : `Place Order (${formatPrice(total)})`}
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
                      <span>{formatPrice(parseFloat(item.product?.price || "0") * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                
                {subtotal < 10000 && (
                  <div className="text-xs text-gray-500 mt-2">
                    Add {formatPrice(10000 - subtotal)} more for free shipping!
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