import { useState } from "react";
import { Link, useLocation } from "wouter";
import { SmartLink } from "@/components/navigation/smart-link";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useCartContext } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
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
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
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
  Search,
} from "lucide-react";
import logoUrl from "@assets/Logo_1763402801870.png";
import { CATEGORIES } from "@/lib/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import { signOutUser } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const { isAuthenticated, user, loading } = useFirebaseAuth();
  const { totalQuantity } = useCartContext();
  const { totalItems: wishlistCount } = useWishlist();
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
        { name: "Wish Lists", href: "/wishlist" },
        { name: "Help & Support", href: "/help" },
      ],
    },
    {
      title: "Electrical Products",
      expandable: true,
      items: [
        { name: "Wires and Cables", href: "/products?category=wires-cables" },
        { name: "Switch and Sockets", href: "/products?category=switch-sockets" },
        { name: "Electric Accessories", href: "/products?category=electric-accessories" },
        { name: "Electrical Pipes and Fittings", href: "/products?category=electrical-pipes-fittings" },
        { name: "Distribution Box", href: "/products?category=distribution-box" },
        { name: "Led Bulb and Fittings", href: "/products?category=led-bulb-fittings" },
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

  // Priority navigation items - always visible
  const priorityNavigation = [
    { name: "All Products", href: "/products" },
    { name: "Wires and Cables", href: "/products?category=wires-cables" },
    { name: "Switch and Sockets", href: "/products?category=switch-sockets" },
    { name: "Today's Deals", href: "/products?featured=true" },
  ];

  // Secondary navigation items - shown based on screen size
  const secondaryNavigation = [
    { name: "Electric Accessories", href: "/products?category=electric-accessories" },
    { name: "Electrical Pipes and Fittings", href: "/products?category=electrical-pipes-fittings" },
    { name: "Distribution Box", href: "/products?category=distribution-box" },
    { name: "Led Bulb and Fittings", href: "/products?category=led-bulb-fittings" },
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
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 overflow-hidden">
      {/* Top announcement bar */}
      <div className="bg-copper-700 text-white text-center py-2 text-sm px-2">
        <span className="text-xs sm:text-sm truncate block">
          Free shipping on electrical products over ₹10,000 | Professional
          installation services available
        </span>
      </div>

      {/* Main header */}
      <div className="w-full px-2 sm:px-4 lg:px-6 overflow-hidden">
        <div className="flex items-center justify-between py-2 sm:py-3 gap-1 sm:gap-2">
          {/* Logo */}
          <SmartLink href="/" className="flex items-center flex-shrink-0 min-w-0">
            <img
              src={logoUrl}
              alt="CopperBear Logo"
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </SmartLink>

          {/* Search Bar - Desktop */}
          {!isMobile && (
            <div className="flex-1 max-w-2xl mx-2 lg:mx-4 min-w-0">
              <SearchBar />
            </div>
          )}

          {/* Account & Cart */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Mobile Search & Menu */}
            {isMobile && (
              <>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 flex-shrink-0"
                      data-testid="button-mobile-search"
                    >
                      <Search className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="top" className="h-auto p-4">
                    <SheetTitle className="sr-only">Search Products</SheetTitle>
                    <SearchBar />
                  </SheetContent>
                </Sheet>

                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 flex-shrink-0"
                      data-testid="button-mobile-menu"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-[85vw] max-w-sm p-0 overflow-y-auto"
                  >
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
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
                      {/* Quick Access Categories - Tile Grid */}
                      <div className="p-4 bg-white">
                        <h3 className="text-sm font-semibold text-copper-800 mb-3">Shop by Category</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {CATEGORIES.slice(0, 6).map((category) => (
                            <SmartLink
                              key={category.id}
                              href={`/products?category=${category.slug}`}
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center gap-2 p-3 bg-copper-50 hover:bg-copper-100 rounded-md border border-copper-200 transition-colors"
                              data-testid={`category-tile-${category.slug}`}
                            >
                              <Zap className="h-4 w-4 text-copper-600 flex-shrink-0" />
                              <span className="text-xs font-medium text-copper-800 line-clamp-2">{category.name}</span>
                            </SmartLink>
                          ))}
                        </div>
                      </div>

                      {/* Navigation Sections */}
                      {mobileNavigation.map((section) => (
                        <div
                          key={section.title}
                          className="border-t border-copper-200"
                        >
                          {section.expandable ? (
                            <>
                              <button
                                onClick={() => toggleSection(section.title)}
                                className="w-full flex items-center justify-between p-4 text-left font-semibold text-copper-800 hover:bg-copper-50 active:bg-copper-100 transition-colors"
                                data-testid={`section-toggle-${section.title}`}
                              >
                                <span className="text-sm truncate pr-2">
                                  {section.title}
                                </span>
                                {expandedSections[section.title] ? (
                                  <ChevronDown className="h-4 w-4 text-copper-600 flex-shrink-0" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-copper-600 flex-shrink-0" />
                                )}
                              </button>
                              {expandedSections[section.title] && (
                                <div className="bg-copper-50">
                                  {section.items.map((item) => (
                                    <SmartLink
                                      key={item.name}
                                      href={item.href}
                                      className="block px-6 py-3 text-sm text-copper-700 hover:text-lime-600 hover:bg-white transition-colors border-b border-copper-200 last:border-b-0"
                                      onClick={() => setMobileMenuOpen(false)}
                                      data-testid={`nav-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                                    >
                                      {item.name}
                                    </SmartLink>
                                  ))}
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="p-4 font-semibold text-copper-800 bg-copper-100">
                                <span className="text-sm">{section.title}</span>
                              </div>
                              <div>
                                {section.items.map((item) => (
                                  <SmartLink
                                    key={item.name}
                                    href={item.href}
                                    className="block px-6 py-3 text-sm text-copper-700 hover:text-lime-600 hover:bg-copper-50 transition-colors border-b border-copper-200 last:border-b-0"
                                    onClick={() => setMobileMenuOpen(false)}
                                    data-testid={`nav-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                                  >
                                    {item.name}
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
              </>
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
                    <Link href="/account" className="w-full cursor-pointer">My Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account?tab=orders" className="w-full cursor-pointer">Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account?tab=bookings" className="w-full cursor-pointer">Service Bookings</Link>
                  </DropdownMenuItem>
                  {user?.email === "admin@copperbear.com" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="w-full cursor-pointer">Admin Panel</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
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
            <SmartLink href="/wishlist" className="flex-shrink-0">
              <Button
                variant="ghost"
                className="flex flex-col items-center justify-center text-gray-700 hover:text-copper-600 hover:bg-copper-50 rounded-lg p-2 sm:p-3 min-h-[44px] min-w-[44px] sm:min-h-[60px] sm:min-w-[60px] transition-all duration-200 relative"
                data-testid="button-wishlist"
              >
                <Heart className="h-5 w-5 flex-shrink-0" />
                <span className="text-xs mt-1 hidden sm:block">Wishlist</span>
                {wishlistCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 hover:bg-red-600 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center p-0 min-w-[16px] sm:min-w-[20px]">
                    <span className="text-[10px] sm:text-xs">
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </span>
                  </Badge>
                )}
              </Button>
            </SmartLink>

            {/* Cart */}
            <Button
              className="flex items-center gap-1 sm:gap-2 bg-lime-600 text-white hover:bg-lime-700 active:bg-lime-800 relative h-10 sm:h-11 px-3 sm:px-4 touch-manipulation flex-shrink-0"
              style={{ minHeight: "44px" }}
              onClick={() => setCartOpen(true)}
              data-testid="button-cart"
            >
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">
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
            <ul className="flex items-center space-x-2 md:space-x-3 lg:space-x-4 xl:space-x-6 text-sm overflow-x-auto scrollbar-hide">
              {/* Priority items - always visible */}
              {priorityNavigation.map((item) => (
                <li key={item.name} className="flex-shrink-0">
                  <SmartLink
                    href={item.href}
                    className={`whitespace-nowrap transition-colors px-1 sm:px-2 py-1 rounded-md touch-manipulation text-xs sm:text-sm ${item.name === "Today's Deals"
                      ? "text-copper-600 font-semibold bg-copper-50"
                      : "text-gray-700 hover:text-copper-600 hover:bg-copper-25 font-medium"
                      }`}
                  >
                    {item.name}
                  </SmartLink>
                </li>
              ))}

              {/* Secondary items - shown on larger screens */}
              {secondaryNavigation.slice(0, 2).map((item) => (
                <li key={item.name} className="flex-shrink-0 hidden lg:block">
                  <SmartLink
                    href={item.href}
                    className="whitespace-nowrap transition-colors px-1 sm:px-2 py-1 rounded-md touch-manipulation text-xs sm:text-sm text-gray-700 hover:text-copper-600 hover:bg-copper-25 font-medium"
                  >
                    {item.name}
                  </SmartLink>
                </li>
              ))}

              {/* Services items - shown only on extra large screens */}
              {secondaryNavigation.slice(2).map((item) => (
                <li key={item.name} className="flex-shrink-0 hidden xl:block">
                  <SmartLink
                    href={item.href}
                    className="whitespace-nowrap transition-colors px-1 sm:px-2 py-1 rounded-md touch-manipulation text-xs sm:text-sm text-gray-700 hover:text-copper-600 hover:bg-copper-25 font-medium"
                  >
                    {item.name}
                  </SmartLink>
                </li>
              ))}

              {/* More dropdown for hidden items on smaller screens */}
              <li className="flex-shrink-0 lg:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="px-1 sm:px-2 py-1 text-xs sm:text-sm text-gray-700 hover:text-copper-600 hover:bg-copper-25 font-medium">
                      More
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {secondaryNavigation.map((item) => (
                      <DropdownMenuItem key={item.name} asChild>
                        <SmartLink href={item.href} className="w-full">
                          {item.name}
                        </SmartLink>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
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
