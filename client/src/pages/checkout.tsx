import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ArrowLeft, CreditCard, Truck, Lock, CheckCircle, AlertCircle, ShoppingBag, Package, Shield } from "lucide-react";
import { StateSelector } from "@/components/common/state-selector";
import { Address } from "@shared/types";
import { checkServiceability, getServiceabilityMessage } from "@shared/delivery-zones";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  saveAddress: boolean;
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
    paymentMethod: "cod",
    sameAsShipping: true,
    saveAddress: false,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);
  const [pincodeServiceability, setPincodeServiceability] = useState<{
    isServiceable: boolean;
    message: string;
    checked: boolean;
  }>({ isServiceable: false, message: '', checked: false });

  // Get cart items from context
  const cartItems = cart?.items || [];
  const cartLoading = false;

  const { data: addresses = [] } = useQuery<Address[]>({
    queryKey: ["/api/addresses"],
    enabled: isAuthenticated,
  });

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const handleAddressSelect = (addressId: string) => {
    if (addressId === "new") {
      setSelectedAddressId(null);
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          firstName: "",
          lastName: "",
          email: prev.shippingAddress.email,
          phone: "",
          street: "",
          city: "",
          state: "",
          zipCode: "",
        },
        saveAddress: false // Reset save address for new address
      }));
      return;
    }

    const selected = addresses.find(a => a.id === addressId);
    if (selected) {
      setSelectedAddressId(addressId);
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          firstName: selected.firstName,
          lastName: selected.lastName || "",
          phone: selected.phone || "",
          street: selected.street,
          city: selected.city,
          state: selected.state,
          zipCode: selected.zipCode,
        },
        saveAddress: false // Don't save an existing address again
      }));
    }
  };

  // Auto-select default address
  useEffect(() => {
    if (isAuthenticated && addresses.length > 0 && !formData.shippingAddress.street) {
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
      if (defaultAddr) {
        handleAddressSelect(defaultAddr.id);
      }
    }
  }, [isAuthenticated, addresses]);

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      // 1. If saveAddress is true, save the address first
      if (formData.saveAddress && isAuthenticated) {
        try {
          // Assuming 'addresses' is available from a useQuery hook for user addresses
          const userAddresses = (queryClient.getQueryData(["/api/addresses"]) as any[]) || [];
          await apiRequest("POST", "/api/addresses", {
            label: "Home", // Default label
            firstName: formData.shippingAddress.firstName,
            lastName: formData.shippingAddress.lastName,
            street: formData.shippingAddress.street,
            city: formData.shippingAddress.city,
            state: formData.shippingAddress.state,
            zipCode: formData.shippingAddress.zipCode,
            country: "India",
            phone: formData.shippingAddress.phone,
            isDefault: userAddresses.length === 0
          });
          queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
        } catch (err) {
          console.error("Failed to save address", err);
        }
      }

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
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sign in required",
          description: "Please sign in to place an order.",
          variant: "destructive",
        });
        return;
      }
      // Parse error message from response
      const errorMessage = error?.message || "Failed to place order. Please try again.";
      const errorCode = error?.code;

      // Show specific error for stock issues
      if (errorCode === "INSUFFICIENT_STOCK" || errorMessage.includes("Insufficient stock")) {
        toast({
          title: "Stock Issue",
          description: errorMessage,
          variant: "destructive",
        });
        // Refresh cart to show updated stock
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
        return;
      }

      if (errorCode === "PRODUCT_NOT_FOUND" || errorMessage.includes("no longer exists")) {
        toast({
          title: "Product Unavailable",
          description: errorMessage,
          variant: "destructive",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
        return;
      }

      if (errorCode === "CART_EMPTY") {
        toast({
          title: "Cart Empty",
          description: "Your cart is empty. Add items before placing an order.",
          variant: "destructive",
        });
        setLocation("/cart");
        return;
      }

      toast({
        title: "Error",
        description: errorMessage,
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

  // Get totals from cart context (server-calculated with weight-based shipping)
  // This ensures checkout display matches what order will actually save
  const subtotal = cart?.totals?.subtotal || 0;
  const shipping = cart?.totals?.shipping || 0;
  const tax = cart?.totals?.tax || 0;
  const total = cart?.totals?.total || 0;

  const updateFormData = (section: keyof CheckoutFormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value,
      },
    }));
  };

  // Handle pincode change with real-time serviceability validation
  const handlePincodeChange = (pincode: string) => {
    updateFormData("shippingAddress", "zipCode", pincode);

    // Only validate if we have a complete 6-digit pincode
    if (pincode.length === 6) {
      const result = checkServiceability(pincode);
      setPincodeServiceability({
        isServiceable: result.isServiceable,
        message: result.message,
        checked: true,
      });

      // Show immediate feedback
      if (!result.isServiceable) {
        toast({
          title: "Delivery Not Available",
          description: result.message,
          variant: "destructive",
        });
      } else if (result.estimatedDelivery) {
        toast({
          title: "Delivery Available!",
          description: `${result.message}\nEstimated delivery: ${result.estimatedDelivery}`,
        });
      }
    } else {
      // Reset validation if pincode is incomplete
      setPincodeServiceability({ isServiceable: false, message: '', checked: false });
    }
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
        const basicInfoValid = !!(shippingAddr.firstName && shippingAddr.email &&
          shippingAddr.phone && shippingAddr.street && shippingAddr.city &&
          shippingAddr.state && shippingAddr.zipCode);

        // Also check pincode serviceability
        if (basicInfoValid && shippingAddr.zipCode.length === 6) {
          const serviceabilityCheck = checkServiceability(shippingAddr.zipCode);
          if (!serviceabilityCheck.isServiceable) {
            toast({
              title: "Delivery Not Available",
              description: serviceabilityCheck.message,
              variant: "destructive",
            });
            return false;
          }
        }

        return basicInfoValid;
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
                    {isAuthenticated && addresses.length > 0 && (
                      <div className="mb-6">
                        <Label className="mb-2 block">Saved Addresses</Label>
                        {!formData.shippingAddress.street ? (
                          <Select onValueChange={handleAddressSelect}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a saved address" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">Use a new address</SelectItem>
                              {addresses.map((addr) => (
                                <SelectItem key={addr.id} value={addr.id}>
                                  {addr.label} - {addr.street}, {addr.city}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="border border-copper-200 rounded-lg p-4 bg-copper-50 relative">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-900">
                                    {formData.shippingAddress.firstName} {formData.shippingAddress.lastName}
                                  </h4>
                                  <span className="text-xs bg-copper-100 text-copper-800 px-2 py-0.5 rounded-full">
                                    {addresses.find(a =>
                                      a.street === formData.shippingAddress.street &&
                                      a.zipCode === formData.shippingAddress.zipCode
                                    )?.label || "Custom"}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">{formData.shippingAddress.street}</p>
                                <p className="text-sm text-gray-600">
                                  {formData.shippingAddress.city}, {formData.shippingAddress.state} {formData.shippingAddress.zipCode}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">Phone: {formData.shippingAddress.phone}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-copper-600 hover:text-copper-700 hover:bg-copper-100"
                                onClick={() => handleAddressSelect("new")}
                              >
                                Change
                              </Button>
                            </div>
                          </div>
                        )}
                        <Separator className="my-4" />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.shippingAddress.firstName}
                          onChange={(e) => updateFormData("shippingAddress", "firstName", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.shippingAddress.lastName}
                          onChange={(e) => updateFormData("shippingAddress", "lastName", e.target.value)}
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
                          data-testid="input-city"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <StateSelector
                          value={formData.shippingAddress.state}
                          onValueChange={(value) => updateFormData("shippingAddress", "state", value)}
                          placeholder="Select state..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">Pin code *</Label>
                        <Input
                          id="zipCode"
                          value={formData.shippingAddress.zipCode}
                          onChange={(e) => handlePincodeChange(e.target.value)}
                          required
                          data-testid="input-zipcode"
                          maxLength={6}
                          placeholder="625xxx"
                          className={
                            pincodeServiceability.checked
                              ? pincodeServiceability.isServiceable
                                ? "border-green-500 focus:ring-green-500"
                                : "border-red-500 focus:ring-red-500"
                              : ""
                          }
                        />
                        {pincodeServiceability.checked && (
                          <div
                            className={`flex items-start gap-2 text-sm mt-2 ${pincodeServiceability.isServiceable
                              ? "text-green-700 bg-green-50 border border-green-200"
                              : "text-red-700 bg-red-50 border border-red-200"
                              } p-2 rounded-md`}
                          >
                            {pincodeServiceability.isServiceable ? (
                              <>
                                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{pincodeServiceability.message}</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{pincodeServiceability.message}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {isAuthenticated && !selectedAddressId && (
                      <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                          id="saveAddress"
                          checked={formData.saveAddress}
                          onCheckedChange={(checked) =>
                            setFormData(prev => ({ ...prev, saveAddress: checked as boolean }))
                          }
                        />
                        <Label htmlFor="saveAddress">Save this address for future use</Label>
                      </div>
                    )}

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
            <Card className="sticky top-8 shadow-sm border-2 border-gray-100/50 overflow-hidden">
              <CardHeader className="bg-gray-50/50 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShoppingBag className="w-5 h-5 text-copper-600" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Product List */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                  {cartItems.map((item: any) => (
                    <div key={item.id} className="flex gap-3 group">
                      {/* Product Thumbnail */}
                      <div className="w-12 h-12 rounded-md bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                        {item.product?.imageUrls?.[0] ? (
                          <img
                            src={item.product.imageUrls[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.product?.name}
                          </p>
                          <p className="text-sm font-semibold text-gray-900 tabular-nums">
                            {formatPrice(parseFloat(item.product?.price || "0") * item.quantity)}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Calculations */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium tabular-nums">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className={`font-medium tabular-nums ${shipping === 0 ? "text-green-600" : ""}`}>
                      {shipping === 0 ? "Free" : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-1">
                      Tax <span className="text-xs text-gray-400">(18% GST)</span>
                    </span>
                    <span className="font-medium tabular-nums">{formatPrice(tax)}</span>
                  </div>
                </div>

                <Separator className="bg-gray-200" />

                {/* Total */}
                <div className="flex justify-between items-end">
                  <span className="text-base font-semibold text-gray-900">Total Amount</span>
                  <span className="text-xl font-bold text-copper-700 leading-none tabular-nums">
                    {formatPrice(total)}
                  </span>
                </div>

                {/* Trust Badges */}
                <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-2 text-[10px] text-gray-500 mt-2">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-green-600" />
                    Secure Checkout
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    Fast Delivery
                  </div>
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