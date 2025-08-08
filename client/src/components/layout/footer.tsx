import { Link } from "wouter";
import { Zap, CreditCard } from "lucide-react";
import { SiVisa, SiMastercard, SiAmericanexpress, SiPaypal } from "react-icons/si";
import { COMPANY_INFO, CONTACT_INFO } from "@/lib/constants";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const productLinks = [
    { name: "Circuit Breakers", href: "/products?category=circuit-breakers" },
    { name: "Wiring & Cables", href: "/products?category=wiring-cables" },
    { name: "Electrical Tools", href: "/products?category=electrical-tools" },
    { name: "Panels & Boxes", href: "/products?category=panels-boxes" },
    { name: "Outlets & Switches", href: "/products?category=outlets-switches" },
    { name: "All Products", href: "/products" },
  ];

  const serviceLinks = [
    { name: "Electrical Installation", href: "/services?category=installation-services" },
    { name: "Repair & Maintenance", href: "/services?category=repair-maintenance" },
    { name: "Electrical Consulting", href: "/services?category=electrical-consulting" },
    { name: "Safety Inspections", href: "/services" },
    { name: "Book Service", href: "/services" },
  ];

  const supportLinks = [
    { name: "Contact Us", href: "/contact" },
    { name: "Help Center", href: "/help" },
    { name: "Order Tracking", href: "/account?tab=orders" },
    { name: "Returns & Exchanges", href: "/returns" },
    { name: "Shipping Info", href: "/shipping" },
    { name: "Warranty", href: "/warranty" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Accessibility", href: "/accessibility" },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-copper-500 to-copper-600 rounded-lg flex items-center justify-center">
                <Zap className="text-white text-lg" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-copper-400">CopperBear</h4>
                <p className="text-xs text-gray-400">Electrical Solutions</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4 text-sm">{COMPANY_INFO.description}</p>
            
            <div className="space-y-2 text-sm text-gray-400">
              <p>{CONTACT_INFO.phone}</p>
              <p>{CONTACT_INFO.email}</p>
              <p>{CONTACT_INFO.address}</p>
            </div>

            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-copper-400 transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-copper-400 transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-copper-400 transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h5 className="text-lg font-semibold mb-4">Products</h5>
            <ul className="space-y-2 text-sm">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h5 className="text-lg font-semibold mb-4">Services</h5>
            <ul className="space-y-2 text-sm">
              {serviceLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h5 className="text-lg font-semibold mb-4">Customer Support</h5>
            <ul className="space-y-2 text-sm">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-400">
            <p>&copy; {currentYear} CopperBear Electrical Solutions. All rights reserved.</p>
            <div className="flex space-x-4">
              {legalLinks.map((link) => (
                <Link key={link.name} href={link.href} className="hover:text-white transition-colors">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-sm text-gray-400">We Accept:</span>
            <div className="flex space-x-3 text-2xl text-gray-400">
              <SiVisa className="w-8 h-6" title="Visa" />
              <SiMastercard className="w-8 h-6" title="Mastercard" />
              <SiAmericanexpress className="w-8 h-6" title="American Express" />
              <SiPaypal className="w-8 h-6" title="PayPal" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
