import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, MapPin, IndianRupee, Scale } from "lucide-react";

export default function ShippingPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-grow">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <h1 className="text-3xl font-bold mb-8 text-copper-900 border-b pb-4 border-copper-200">Shipping Information</h1>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="border-l-4 border-l-copper-600 shadow-md md:col-span-2">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center text-xl text-copper-800">
                                    <MapPin className="mr-2 h-5 w-5" />
                                    Service Areas
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 mb-2">
                                    Currently, we are exclusively serving <strong>Madurai</strong> only.
                                </p>
                                <p className="text-sm text-gray-500 italic">
                                    We will be expanding our delivery services to other regions soon!
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-md">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center text-xl text-green-700">
                                    <Truck className="mr-2 h-5 w-5" />
                                    Free Delivery
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700">
                                    Enjoy <strong>FREE Delivery</strong> on all orders above <strong>₹2,999</strong>.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-md">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center text-xl text-copper-800">
                                    <IndianRupee className="mr-2 h-5 w-5" />
                                    Standard Charges
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700">
                                    For orders below ₹2,999, a standard delivery charge of <strong>₹50</strong> applies.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-yellow-500 shadow-md bg-yellow-50/30 md:col-span-2">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center text-xl text-yellow-800">
                                    <Scale className="mr-2 h-5 w-5" />
                                    Weight-Based Shipping
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700">
                                    Please note that if the total weight of the products in your order is high, the delivery charge may vary based on the weight. The final shipping cost will be calculated at checkout.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
