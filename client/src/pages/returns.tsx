import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PackageOpen, XCircle, AlertCircle } from "lucide-react";

export default function ReturnsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-grow">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <h1 className="text-3xl font-bold mb-8 text-copper-900 border-b pb-4 border-copper-200">Returns & Exchanges</h1>

                    <div className="grid gap-6">
                        <Card className="border-l-4 border-l-copper-600 shadow-md">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center text-xl text-copper-800">
                                    <PackageOpen className="mr-2 h-5 w-5" />
                                    7-Day Return Policy
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 leading-relaxed">
                                    We accept returns within <strong>7 days</strong> of delivery. To be eligible for a return, your item must be strictly unused and in the same condition that you received it.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-md">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center text-xl text-copper-800">
                                    <AlertCircle className="mr-2 h-5 w-5" />
                                    Conditions for Return
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                    <li>The product box must <strong>not be opened</strong>.</li>
                                    <li>The product must be sealed in its original packaging.</li>
                                    <li>All original tags and labels must be intact.</li>
                                    <li>The receipt or proof of purchase is required.</li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-red-500 shadow-md bg-red-50/50">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center text-xl text-red-700">
                                    <XCircle className="mr-2 h-5 w-5" />
                                    No Exchange / No Replacement
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700">
                                    Please note that as of now, we offer <strong>Returns Only</strong>. We do not provide exchanges or replacements for products. If you wish to change an item, please return the original item for a refund and place a new order.
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
