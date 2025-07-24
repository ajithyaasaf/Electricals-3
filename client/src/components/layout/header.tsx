import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SearchBar } from "@/components/common/search-bar";
import { CartSidebar } from "@/components/cart/cart-sidebar";
import { Zap, User, Heart, ShoppingCart, Menu, X, ChevronRight, ChevronDown } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { useIsMobile } from "@/hooks/use-mobile";

export function Header() {
  const { isAuthenticated, user } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const isMobile = useIsMobile();

  // Get cart count
  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const cartCount = Array.isArray(cartItems) ? cartItems.length : 0;

  // Amazon-style hierarchical navigation for electrical products
  const mobileNavigation = [
    {
      title: "Account & Services",
      items: [
        { name: "Your Account", href: "/account" },
        { name: "Order History", href: "/account/orders" },
        { name: "Wish Lists", href: "/account/wishlist" },
        { name: "Help & Support", href: "/help" },
      ]
    },
    {
      title: "Electrical Components",
      expandable: true,
      items: [
        { name: "Circuit Breakers & Panels", href: "/products?category=circuit-breakers" },
        { name: "Switches & Outlets", href: "/products?category=switches-outlets" },
        { name: "Wiring & Conduits", href: "/products?category=wiring-cables" },
        { name: "Transformers & Motors", href: "/products?category=transformers-motors" },
        { name: "Electrical Meters", href: "/products?category=electrical-meters" },
        { name: "Fuses & Protection", href: "/products?category=fuses-protection" },
      ]
    },
    {
      title: "Tools & Equipment",
      expandable: true,
      items: [
        { name: "Hand Tools", href: "/products?category=hand-tools" },
        { name: "Power Tools", href: "/products?category=power-tools" },
        { name: "Testing Equipment", href: "/products?category=testing-equipment" },
        { name: "Safety Gear", href: "/products?category=safety-gear" },
        { name: "Tool Storage", href: "/products?category=tool-storage" },
      ]
    },
    {
      title: "Lighting Solutions",
      expandable: true,
      items: [
        { name: "LED Fixtures", href: "/products?category=led-fixtures" },
        { name: "Commercial Lighting", href: "/products?category=commercial-lighting" },
        { name: "Outdoor Lighting", href: "/products?category=outdoor-lighting" },
        { name: "Smart Lighting", href: "/products?category=smart-lighting" },
        { name: "Emergency Lighting", href: "/products?category=emergency-lighting" },
      ]
    },
    {
      title: "Installation Services",
      expandable: true,
      items: [
        { name: "Residential Wiring", href: "/services?category=residential-wiring" },
        { name: "Commercial Projects", href: "/services?category=commercial-projects" },
        { name: "Emergency Repairs", href: "/services?category=emergency-repairs" },
        { name: "Inspections & Consulting", href: "/services?category=inspections-consulting" },
        { name: "Code Compliance", href: "/services?category=code-compliance" },
      ]
    },
    {
      title: "Shop by Project",
      expandable: true,
      items: [
        { name: "New Construction", href: "/products?project=new-construction" },
        { name: "Home Renovation", href: "/products?project=renovation" },
        { name: "Maintenance & Repair", href: "/products?project=maintenance" },
        { name: "Industrial Applications", href: "/products?project=industrial" },
      ]
    },
    {
      title: "Special Offers",
      items: [
        { name: "Today's Deals", href: "/products?featured=true" },
        { name: "Bulk Pricing", href: "/products?bulk=true" },
        { name: "Contractor Discounts", href: "/contractor-program" },
        { name: "Clearance Items", href: "/products?clearance=true" },
      ]
    }
  ];

  const desktopNavigation = [
    { name: "All Departments", href: "/products" },
    { name: "Circuit Breakers", href: "/products?category=circuit-breakers" },
    { name: "Wiring & Cables", href: "/products?category=wiring-cables" },
    { name: "Electrical Tools", href: "/products?category=electrical-tools" },
    { name: "Panels & Boxes", href: "/products?category=panels-boxes" },
    { name: "Installation Services", href: "/services?category=installation-services" },
    { name: "Professional Consulting", href: "/services?category=electrical-consulting" },
    { name: "Today's Deals", href: "/products?featured=true" },
  ];

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      {/* Top announcement bar */}
      <div className="bg-copper-700 text-white text-center py-2 text-sm">
        <span>Free shipping on electrical products over $100 | Professional installation services available</span>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-copper-500 to-copper-600 rounded-lg flex items-center justify-center">
              <Zap className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-copper-700">CopperBear</h1>
              <p className="text-xs text-gray-600">Electrical Solutions</p>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          {!isMobile && (
            <div className="flex-1 max-w-2xl mx-8">
              <SearchBar />
            </div>
          )}

          {/* Account & Cart */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Toggle */}
            {isMobile && (
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  {/* Header */}
                  <div className="bg-gray-800 text-white p-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-6 w-6" />
                      <span className="text-lg font-semibold">
                        {isAuthenticated ? `Hello, ${(user as any)?.email?.split('@')[0] || 'User'}` : 'Hello, sign in'}
                      </span>
                    </div>
                  </div>

                  {/* Amazon-style Navigation */}
                  <div className="flex-1 overflow-y-auto">
                    {mobileNavigation.map((section) => (
                      <div key={section.title} className="border-b border-gray-200">
                        {section.expandable ? (
                          <>
                            <button
                              onClick={() => toggleSection(section.title)}
                              className="w-full flex items-center justify-between p-4 text-left font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                            >
                              <span>{section.title}</span>
                              {expandedSections[section.title] ? (
                                <ChevronDown className="h-5 w-5 text-gray-500" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-gray-500" />
                              )}
                            </button>
                            {expandedSections[section.title] && (
                              <div className="bg-gray-50">
                                {section.items.map((item) => (
                                  <Link
                                    key={item.name}
                                    href={item.href}
                                    className="block px-6 py-3 text-sm text-gray-700 hover:text-copper-600 hover:bg-white transition-colors border-b border-gray-200 last:border-b-0"
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    {item.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="p-4 font-semibold text-gray-900 bg-gray-100">
                              {section.title}
                            </div>
                            <div>
                              {section.items.map((item) => (
                                <Link
                                  key={item.name}
                                  href={item.href}
                                  className="block px-6 py-3 text-sm text-gray-700 hover:text-copper-600 hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-b-0"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {item.name}
                                </Link>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex flex-col items-center text-gray-700 hover:text-copper-600">
                    <User className="h-5 w-5" />
                    <span className="text-xs mt-1 hidden sm:block">Account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/account">My Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account?tab=orders">Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account?tab=bookings">Service Bookings</Link>
                  </DropdownMenuItem>
                  {(user as any)?.isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Admin Panel</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.location.href = "/api/logout"}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="ghost" 
                className="flex flex-col items-center text-gray-700 hover:text-copper-600"
                onClick={() => window.location.href = "/api/login"}
              >
                <User className="h-5 w-5" />
                <span className="text-xs mt-1 hidden sm:block">Sign In</span>
              </Button>
            )}

            {/* Wishlist */}
            {isAuthenticated && (
              <Button variant="ghost" className="flex flex-col items-center text-gray-700 hover:text-copper-600">
                <Heart className="h-5 w-5" />
                <span className="text-xs mt-1 hidden sm:block">Wishlist</span>
              </Button>
            )}

            {/* Cart */}
            <Button 
              className="flex items-center space-x-2 bg-electric-blue-600 text-white hover:bg-electric-blue-700 relative"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="text-sm font-medium hidden sm:block">Cart</span>
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center p-0">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Navigation Menu - Desktop */}
        {!isMobile && (
          <nav className="border-t border-gray-200 py-3">
            <ul className="flex items-center space-x-8 text-sm overflow-x-auto">
              {desktopNavigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`whitespace-nowrap transition-colors ${
                      item.name === "Today's Deals"
                        ? "text-copper-600 font-semibold"
                        : "text-gray-700 hover:text-copper-600 font-medium"
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      {/* Cart Sidebar */}
      <CartSidebar open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
}
