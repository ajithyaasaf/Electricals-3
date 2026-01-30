import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Info } from "lucide-react";

export default function WarrantyPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-grow">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <h1 className="text-3xl font-bold mb-8 text-copper-900 border-b pb-4 border-copper-200">Warranty Information</h1>

                    <div className="space-y-6">
                        <div className="flex flex-col items-center justify-center p-8 bg-copper-50 rounded-lg border border-copper-100 text-center">
                            <ShieldCheck className="h-16 w-16 text-copper-600 mb-4" />
                            <h2 className="text-2xl font-semibold text-copper-900 mb-2">Product Specific Warranty</h2>
                            <p className="text-gray-600 max-w-xl">
                                Warranty terms and duration vary based on the product category and manufacturer.
                            </p>
                        </div>

                        <Card className="shadow-md">
                            <CardContent className="pt-6">
                                <div className="flex items-start">
                                    <Info className="h-6 w-6 text-blue-500 mr-4 mt-1 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Where to find warranty details?</h3>
                                        <p className="text-gray-700 leading-relaxed">
                                            Please refer to the specific <strong>Product Details Page</strong> for comprehensive warranty information regarding any item. The warranty period and coverage details are listed under the specifications section of each product.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
