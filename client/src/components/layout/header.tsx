import { useState } from "react";
import { useLocation } from "wouter";
import { SmartLink } from "@/components/navigation/smart-link";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useCartContext } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SearchBar } from "@/components/common/search-bar";
import { CartSidebar } from "@/components/cart/cart-sidebar";

import {
  Zap,
  User,
  Heart,
  ShoppingCart,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import { signOutUser } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const { isAuthenticated, user, loading } = useFirebaseAuth();
  const { totalQuantity } = useCartContext();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Use cart count from cart context
  const cartCount = totalQuantity || 0;

  // Amazon-style hierarchical navigation for electrical products
  const mobileNavigation = [
    {
      title: "Account & Services",
      items: [
        { name: "Your Account", href: "/account" },
        { name: "Order History", href: "/account/orders" },
        { name: "Wish Lists", href: "/account/wishlist" },
        { name: "Help & Support", href: "/help" },
      ],
    },
    {
      title: "Electrical Components",
      expandable: true,
      items: [
        {
          name: "Circuit Breakers & Panels",
          href: "/products?category=circuit-breakers",
        },
        {
          name: "Switches & Outlets",
          href: "/products?category=switches-outlets",
        },
        { name: "Wiring & Conduits", href: "/products?category=wiring-cables" },
        {
          name: "Transformers & Motors",
          href: "/products?category=transformers-motors",
        },
        {
          name: "Electrical Meters",
          href: "/products?category=electrical-meters",
        },
        {
          name: "Fuses & Protection",
          href: "/products?category=fuses-protection",
        },
      ],
    },
    {
      title: "Tools & Equipment",
      expandable: true,
      items: [
        { name: "Hand Tools", href: "/products?category=hand-tools" },
        { name: "Power Tools", href: "/products?category=power-tools" },
        {
          name: "Testing Equipment",
          href: "/products?category=testing-equipment",
        },
        { name: "Safety Gear", href: "/products?category=safety-gear" },
        { name: "Tool Storage", href: "/products?category=tool-storage" },
      ],
    },
    {
      title: "Lighting Solutions",
      expandable: true,
      items: [
        { name: "LED Fixtures", href: "/products?category=led-fixtures" },
        {
          name: "Commercial Lighting",
          href: "/products?category=commercial-lighting",
        },
        {
          name: "Outdoor Lighting",
          href: "/products?category=outdoor-lighting",
        },
        { name: "Smart Lighting", href: "/products?category=smart-lighting" },
        {
          name: "Emergency Lighting",
          href: "/products?category=emergency-lighting",
        },
      ],
    },
    {
      title: "Installation Services",
      expandable: true,
      items: [
        {
          name: "Residential Wiring",
          href: "/services?category=residential-wiring",
        },
        {
          name: "Commercial Projects",
          href: "/services?category=commercial-projects",
        },
        {
          name: "Emergency Repairs",
          href: "/services?category=emergency-repairs",
        },
        {
          name: "Inspections & Consulting",
          href: "/services?category=inspections-consulting",
        },
        { name: "Code Compliance", href: "/services?category=code-compliance" },
      ],
    },
    {
      title: "Shop by Project",
      expandable: true,
      items: [
        {
          name: "New Construction",
          href: "/products?project=new-construction",
        },
        { name: "Home Renovation", href: "/products?project=renovation" },
        { name: "Maintenance & Repair", href: "/products?project=maintenance" },
        {
          name: "Industrial Applications",
          href: "/products?project=industrial",
        },
      ],
    },
    {
      title: "Special Offers",
      items: [
        { name: "Today's Deals", href: "/products?featured=true" },
        { name: "Bulk Pricing", href: "/products?bulk=true" },
        { name: "Contractor Discounts", href: "/contractor-program" },
        { name: "Clearance Items", href: "/products?clearance=true" },
      ],
    },
  ];

  const desktopNavigation = [
    { name: "All Departments", href: "/products" },
    { name: "Circuit Breakers", href: "/products?category=circuit-breakers" },
    { name: "Wiring & Cables", href: "/products?category=wiring-cables" },
    { name: "Electrical Tools", href: "/products?category=electrical-tools" },
    { name: "Panels & Boxes", href: "/products?category=panels-boxes" },
    {
      name: "Installation Services",
      href: "/services?category=installation-services",
    },
    {
      name: "Professional Consulting",
      href: "/services?category=electrical-consulting",
    },
    { name: "Today's Deals", href: "/products?featured=true" },
  ];

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle],
    }));
  };

  const handleSignIn = () => {
    setLocation("/auth");
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Sign-out Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      {/* Top announcement bar */}
      <div className="bg-copper-700 text-white text-center py-2 text-sm">
        <span>
          Free shipping on electrical products over ₹399 | Professional
          installation services available
        </span>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-3 sm:py-4">
          {/* Logo */}
          <SmartLink href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-copper-500 to-copper-600 rounded-lg flex items-center justify-center">
              <Zap className="text-white text-base sm:text-lg" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-copper-700 truncate">
                CopperBear
              </h1>
              <p className="text-xs text-gray-600 hidden sm:block">
                Electrical Solutions
              </p>
            </div>
          </SmartLink>

          {/* Search Bar - Desktop */}
          {!isMobile && (
            <div className="flex-1 max-w-2xl mx-4 lg:mx-8">
              <SearchBar />
            </div>
          )}

          {/* Account & Cart */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {/* Mobile Menu Toggle */}
            {isMobile && (
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 sm:h-11 sm:w-11 touch-manipulation"
                    style={{ minHeight: "44px", minWidth: "44px" }} // iOS minimum touch target
                  >
                    <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-full max-w-sm sm:max-w-md p-0 overflow-hidden"
                >
                  {/* Header */}
                  <div className="bg-copper-700 text-white p-4 sm:p-6">
                    <div className="flex items-center space-x-2">
                      <User className="h-6 w-6 flex-shrink-0" />
                      <span className="text-base sm:text-lg font-semibold truncate">
                        {isAuthenticated
                          ? `Hello, ${user?.displayName || user?.email?.split("@")[0] || "User"}`
                          : "Hello, sign in"}
                      </span>
                    </div>
                  </div>

                  {/* Amazon-style Navigation */}
                  <div className="flex-1 overflow-y-auto overscroll-contain">
                    {mobileNavigation.map((section) => (
                      <div
                        key={section.title}
                        className="border-b border-copper-200"
                      >
                        {section.expandable ? (
                          <>
                            <button
                              onClick={() => toggleSection(section.title)}
                              className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-semibold text-copper-800 hover:bg-copper-50 active:bg-copper-100 transition-colors touch-manipulation"
                              style={{ minHeight: "44px" }} // iOS minimum touch target
                            >
                              <span className="text-sm sm:text-base truncate pr-2">
                                {section.title}
                              </span>
                              {expandedSections[section.title] ? (
                                <ChevronDown className="h-5 w-5 text-copper-600 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-copper-600 flex-shrink-0" />
                              )}
                            </button>
                            {expandedSections[section.title] && (
                              <div className="bg-copper-50">
                                {section.items.map((item) => (
                                  <SmartLink
                                    key={item.name}
                                    href={item.href}
                                    className="block px-6 sm:px-8 py-3 sm:py-4 text-sm text-copper-700 hover:text-lime-600 active:text-lime-700 hover:bg-white active:bg-copper-25 transition-colors border-b border-copper-200 last:border-b-0 touch-manipulation"
                                    style={{ minHeight: "44px" }} // iOS minimum touch target
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    <span className="block truncate">
                                      {item.name}
                                    </span>
                                  </SmartLink>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="p-4 sm:p-5 font-semibold text-copper-800 bg-copper-100">
                              <span className="text-sm sm:text-base truncate">
                                {section.title}
                              </span>
                            </div>
                            <div>
                              {section.items.map((item) => (
                                <SmartLink
                                  key={item.name}
                                  href={item.href}
                                  className="block px-6 sm:px-8 py-3 sm:py-4 text-sm text-copper-700 hover:text-lime-600 active:text-lime-700 hover:bg-copper-50 active:bg-copper-100 transition-colors border-b border-copper-200 last:border-b-0 touch-manipulation"
                                  style={{ minHeight: "44px" }} // iOS minimum touch target
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  <span className="block truncate">
                                    {item.name}
                                  </span>
                                </SmartLink>
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
                  <Button
                    variant="ghost"
                    className="flex flex-col items-center justify-center text-gray-700 hover:text-copper-600 hover:bg-copper-50 rounded-lg p-3 min-h-[60px] min-w-[60px] transition-all duration-200"
                  >
                    <User className="h-5 w-5" />
                    <span className="text-xs mt-1 hidden sm:block">
                      Account
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <SmartLink href="/account">My Account</SmartLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <SmartLink href="/account?tab=orders">Orders</SmartLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <SmartLink href="/account?tab=bookings">Service Bookings</SmartLink>
                  </DropdownMenuItem>
                  {user?.email === "admin@copperbear.com" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <SmartLink href="/admin">Admin Panel</SmartLink>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                className="flex flex-col items-center justify-center text-gray-700 hover:text-copper-600 hover:bg-copper-50 rounded-lg p-3 min-h-[60px] min-w-[60px] transition-all duration-200"
                onClick={handleSignIn}
                disabled={loading}
              >
                <User className="h-5 w-5" />
                <span className="text-xs mt-1 hidden sm:block">Sign In</span>
              </Button>
            )}

            {/* Wishlist */}
            {isAuthenticated && (
              <Button
                variant="ghost"
                className="flex flex-col items-center justify-center text-gray-700 hover:text-copper-600 hover:bg-copper-50 rounded-lg p-3 min-h-[60px] min-w-[60px] transition-all duration-200"
              >
                <Heart className="h-5 w-5" />
                <span className="text-xs mt-1 hidden sm:block">Wishlist</span>
              </Button>
            )}

            {/* Cart */}
            <Button
              className="flex items-center space-x-1 sm:space-x-2 bg-lime-600 text-graphite hover:bg-lime-700 active:bg-lime-800 relative h-10 sm:h-11 px-3 sm:px-4 touch-manipulation"
              style={{ minHeight: "44px" }} // iOS minimum touch target
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm font-medium hidden xs:block">
                Cart
              </span>
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center p-0 min-w-[16px] sm:min-w-[20px]">
                  <span className="text-[10px] sm:text-xs">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Navigation Menu - Desktop */}
        {!isMobile && (
          <nav className="border-t border-gray-200 py-3">
            <ul className="flex items-center space-x-4 lg:space-x-8 text-sm overflow-x-auto scrollbar-hide">
              {desktopNavigation.map((item) => (
                <li key={item.name} className="flex-shrink-0">
                  <SmartLink
                    href={item.href}
                    className={`whitespace-nowrap transition-colors px-2 py-1 rounded-md touch-manipulation ${
                      item.name === "Today's Deals"
                        ? "text-copper-600 font-semibold bg-copper-50"
                        : "text-gray-700 hover:text-copper-600 hover:bg-copper-25 font-medium"
                    }`}
                  >
                    {item.name}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      {/* Cart Sidebar */}
      <CartSidebar open={cartOpen} onOpenChange={setCartOpen}>
        <div />
      </CartSidebar>


    </header>
  );
}
