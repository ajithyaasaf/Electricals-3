import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-copper-50 to-electric-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Professional Electrical Solutions for Every Project
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              From premium circuit breakers to expert installation services, CopperBear delivers reliable electrical products and professional expertise you can trust.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Button asChild className="bg-copper-600 hover:bg-copper-700 text-white">
                <Link href="/products">Shop Products</Link>
              </Button>
              <Button asChild className="bg-electric-blue-600 hover:bg-electric-blue-700 text-white">
                <Link href="/services">Book Service</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
              alt="Professional electrician working on electrical installation" 
              className="rounded-xl shadow-lg w-full h-auto" 
            />
            <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="text-green-600 text-lg" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Licensed & Insured</p>
                  <p className="text-sm text-gray-600">Professional electricians</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
