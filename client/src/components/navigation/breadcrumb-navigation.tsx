import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Home } from "lucide-react";
import { SmartLink } from "./smart-link";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href: string;
  isActive?: boolean;
}

export function BreadcrumbNavigation() {
  const [location] = useLocation();
  
  // Fetch categories for dynamic breadcrumb building
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  // Type-safe category access
  const typedCategories = categories as Array<{ id: string; name: string; slug: string; }>;
  
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.split('/').filter(Boolean);
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    
    const breadcrumbs: BreadcrumbItem[] = [
      { label: "Home", href: "/" }
    ];
    
    if (pathSegments.length === 0) {
      return breadcrumbs;
    }
    
    // Handle different page types
    if (pathSegments[0] === 'products') {
      breadcrumbs.push({ label: "Products", href: "/products" });
      
      const categorySlug = searchParams.get('category');
      if (categorySlug) {
        const category = typedCategories.find(cat => cat.slug === categorySlug);
        if (category) {
          breadcrumbs.push({
            label: category.name,
            href: `/products?category=${categorySlug}`,
            isActive: true
          });
        }
      }
      
      // Product detail page
      if (pathSegments[1]) {
        breadcrumbs.push({
          label: "Product Details",
          href: `/products/${pathSegments[1]}`,
          isActive: true
        });
      }
    } else if (pathSegments[0] === 'services') {
      breadcrumbs.push({ label: "Services", href: "/services" });
      
      const categorySlug = searchParams.get('category');
      if (categorySlug) {
        breadcrumbs.push({
          label: categorySlug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          href: `/services?category=${categorySlug}`,
          isActive: true
        });
      }
      
      // Service detail page
      if (pathSegments[1]) {
        breadcrumbs.push({
          label: "Service Details",
          href: `/services/${pathSegments[1]}`,
          isActive: true
        });
      }
    } else if (pathSegments[0] === 'cart') {
      breadcrumbs.push({ label: "Shopping Cart", href: "/cart", isActive: true });
    } else if (pathSegments[0] === 'checkout') {
      breadcrumbs.push({ label: "Shopping Cart", href: "/cart" });
      breadcrumbs.push({ label: "Checkout", href: "/checkout", isActive: true });
    } else if (pathSegments[0] === 'account') {
      breadcrumbs.push({ label: "My Account", href: "/account" });
      
      if (pathSegments[1]) {
        const accountPages = {
          'orders': 'Order History',
          'wishlist': 'Wish Lists',
          'addresses': 'Addresses',
          'payment': 'Payment Methods',
          'security': 'Security Settings'
        };
        
        const pageName = accountPages[pathSegments[1] as keyof typeof accountPages];
        if (pageName) {
          breadcrumbs.push({
            label: pageName,
            href: `/account/${pathSegments[1]}`,
            isActive: true
          });
        }
      }
    } else if (pathSegments[0] === 'admin') {
      breadcrumbs.push({ label: "Admin Dashboard", href: "/admin", isActive: true });
    }
    
    return breadcrumbs;
  };
  
  const breadcrumbs = generateBreadcrumbs();
  
  // Don't show breadcrumbs on home page
  if (breadcrumbs.length <= 1) {
    return null;
  }
  
  return (
    <nav 
      className="bg-gray-50 border-b border-gray-200 px-4 py-3"
      aria-label="Breadcrumb"
    >
      <div className="max-w-7xl mx-auto">
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={breadcrumb.href} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
              )}
              
              {breadcrumb.isActive ? (
                <span className="text-gray-900 font-medium">
                  {breadcrumb.label}
                </span>
              ) : (
                <SmartLink
                  href={breadcrumb.href}
                  className={cn(
                    "text-gray-600 hover:text-copper-600",
                    "transition-colors duration-200",
                    index === 0 && "flex items-center"
                  )}
                >
                  {index === 0 && <Home className="h-4 w-4 mr-1" />}
                  {breadcrumb.label}
                </SmartLink>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}