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
import { Zap, User, Heart, ShoppingCart, Menu, X } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { useIsMobile } from "@/hooks/use-mobile";

export function Header() {
  const { isAuthenticated, user } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  // Get cart count
  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const cartCount = cartItems.length;

  const navigation = [
    { name: "All Departments", href: "/products" },
    { name: "Circuit Breakers", href: "/products?category=circuit-breakers" },
    { name: "Wiring & Cables", href: "/products?category=wiring-cables" },
    { name: "Electrical Tools", href: "/products?category=electrical-tools" },
    { name: "Panels & Boxes", href: "/products?category=panels-boxes" },
    { name: "Installation Services", href: "/services?category=installation-services" },
    { name: "Professional Consulting", href: "/services?category=electrical-consulting" },
    { name: "Today's Deals", href: "/products?featured=true" },
  ];

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
                <SheetContent side="left" className="w-80">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-copper-500 to-copper-600 rounded-lg flex items-center justify-center">
                        <Zap className="text-white text-sm" />
                      </div>
                      <span className="text-lg font-bold text-copper-700">CopperBear</span>
                    </div>
                  </div>
                  
                  {/* Mobile Search */}
                  <div className="mb-6">
                    <SearchBar />
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="space-y-2">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:text-copper-600 hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>
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
                  {user?.isAdmin && (
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
            <Link href="/cart">
              <Button className="flex items-center space-x-2 bg-electric-blue-600 text-white hover:bg-electric-blue-700 relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="text-sm font-medium hidden sm:block">Cart</span>
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center p-0">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* Navigation Menu - Desktop */}
        {!isMobile && (
          <nav className="border-t border-gray-200 py-3">
            <ul className="flex items-center space-x-8 text-sm overflow-x-auto">
              {navigation.map((item) => (
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
    </header>
  );
}
