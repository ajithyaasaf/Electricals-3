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
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ArrowLeft, CreditCard, Truck, Lock } from "lucide-react";

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
  const { isAuthenticated, isLoading: authLoading } = useAuth();
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

  // Fetch cart items
  const { data: cartItems = [], isLoading: cartLoading } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      const orderData = {
        shippingAddress: formData.shippingAddress,
        billingAddress: formData.sameAsShipping ? formData.shippingAddress : formData.billingAddress,
        paymentMethod: formData.paymentMethod,
        totalAmount: total.toFixed(2),
        items: cartItems.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
      };

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
      
      // Redirect to account page to view order
      window.location.href = "/account?tab=orders";
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Please sign in",
          description: "You need to sign in to place an order.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
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

  // Redirect if cart is empty
  if (!cartLoading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Cart is Empty</h1>
          <p className="text-gray-600 mb-6">Add some items to your cart before proceeding to checkout.</p>
          <Button asChild>
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
        const shipping = formData.shippingAddress;
        return !!(shipping.firstName && shipping.lastName && shipping.email && 
                 shipping.phone && shipping.street && shipping.city && 
                 shipping.state && shipping.zipCode);
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
      placeOrderMutation.mutate();
    } else {
      toast({
        title: "Incomplete information",
        description: "Please complete all checkout steps.",
        variant: "destructive",
      });
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="w-full h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          {" / "}
          <Link href="/cart" className="hover:text-gray-900">Cart</Link>
          {" / "}
          <span className="text-gray-900">Checkout</span>
        </nav>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <Link href="/cart">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Cart
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Tabs value={currentStep.toString()} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="1" disabled={currentStep < 1}>
                  1. Shipping
                </TabsTrigger>
                <TabsTrigger value="2" disabled={currentStep < 2}>
                  2. Payment
                </TabsTrigger>
                <TabsTrigger value="3" disabled={currentStep < 3}>
                  3. Review
                </TabsTrigger>
              </TabsList>

              {/* Step 1: Shipping Information */}
              <TabsContent value="1" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Truck className="w-5 h-5 mr-2" />
                      Shipping Information
                    </CardTitle>
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
                            {/* Add more states as needed */}
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
                    <CardTitle className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Payment Method Selection */}
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
                            id="paypal"
                            name="paymentMethod"
                            value="paypal"
                            checked={formData.paymentMethod === "paypal"}
                            onChange={(e) => updateRootField("paymentMethod", e.target.value)}
                          />
                          <label htmlFor="paypal" className="text-sm font-medium">
                            PayPal
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Billing Address */}
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <Checkbox
                          id="sameAsShipping"
                          checked={formData.sameAsShipping}
                          onCheckedChange={(checked) => updateRootField("sameAsShipping", checked)}
                        />
                        <Label htmlFor="sameAsShipping">Billing address same as shipping</Label>
                      </div>

                      {!formData.sameAsShipping && (
                        <div className="space-y-4 p-4 border rounded-lg">
                          <h3 className="font-medium">Billing Address</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="billingFirstName">First Name *</Label>
                              <Input
                                id="billingFirstName"
                                value={formData.billingAddress.firstName}
                                onChange={(e) => updateFormData("billingAddress", "firstName", e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="billingLastName">Last Name *</Label>
                              <Input
                                id="billingLastName"
                                value={formData.billingAddress.lastName}
                                onChange={(e) => updateFormData("billingAddress", "lastName", e.target.value)}
                              />
                            </div>
                          </div>
                          {/* Add other billing address fields as needed */}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setCurrentStep(1)}>
                        Back to Shipping
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
                    {/* Order Items */}
                    <div>
                      <h3 className="font-medium mb-4">Order Items</h3>
                      <div className="space-y-4">
                        {cartItems.map((item: any) => (
                          <div key={item.id} className="flex items-center space-x-4 py-2 border-b">
                            <img
                              src={item.product.imageUrls?.[0] || ""}
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <p className="font-medium">{item.product.name}</p>
                              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-medium">
                              ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping & Billing Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium mb-2">Shipping Address</h3>
                        <div className="text-sm text-gray-600">
                          <p>{formData.shippingAddress.firstName} {formData.shippingAddress.lastName}</p>
                          <p>{formData.shippingAddress.street}</p>
                          <p>{formData.shippingAddress.city}, {formData.shippingAddress.state} {formData.shippingAddress.zipCode}</p>
                          <p>{formData.shippingAddress.phone}</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2">Payment Method</h3>
                        <p className="text-sm text-gray-600 capitalize">
                          {formData.paymentMethod.replace("-", " ")}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setCurrentStep(2)}>
                        Back to Payment
                      </Button>
                      <Button
                        onClick={handlePlaceOrder}
                        disabled={placeOrderMutation.isPending}
                        className="bg-electric-blue-600 hover:bg-electric-blue-700"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        {placeOrderMutation.isPending ? "Processing..." : "Place Order"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-medium">FREE</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                {/* Security Notice */}
                <div className="mt-6 p-3 bg-green-50 rounded-lg text-center">
                  <Lock className="w-5 h-5 mx-auto text-green-600 mb-2" />
                  <p className="text-sm text-green-800">
                    Your payment information is secure and encrypted
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
