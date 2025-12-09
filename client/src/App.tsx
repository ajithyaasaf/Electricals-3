import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PerformanceMonitor } from "@/components/layout/performance-monitor";
import { NavigationProgress } from "@/components/navigation/navigation-progress";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { FirebaseRedirectHandler } from "@/components/auth/firebase-redirect-handler";
import { CartProvider } from "@/contexts/cart-context";
import { WishlistProvider } from "@/contexts/wishlist-context";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import Services from "@/pages/services";
import ServiceDetail from "@/pages/service-detail";

import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Account from "@/pages/account";
import OrderDetail from "@/pages/order-detail";
import Admin from "@/pages/admin";
import Auth from "@/pages/auth";
import Wishlist from "@/pages/wishlist";

function Router() {
  const { isAuthenticated, loading } = useFirebaseAuth();

  return (
    <Switch>
      {loading ? (
        // Show loading page while authentication is being determined
        <Route path="*">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-copper-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        </Route>
      ) : !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/auth" component={Auth} />
          <Route path="/products" component={Products} />
          <Route path="/products/:slug" component={ProductDetail} />
          <Route path="/services" component={Services} />
          <Route path="/services/:slug" component={ServiceDetail} />
          <Route path="/cart" component={Cart} />
          <Route path="/wishlist" component={Wishlist} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/account" component={Account} />
          <Route path="/account/orders/:orderId" component={OrderDetail} />
          <Route path="/admin" component={Admin} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/auth" component={Auth} />
          <Route path="/products" component={Products} />
          <Route path="/products/:slug" component={ProductDetail} />
          <Route path="/services" component={Services} />
          <Route path="/services/:slug" component={ServiceDetail} />
          <Route path="/cart" component={Cart} />
          <Route path="/wishlist" component={Wishlist} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/account" component={Account} />
          <Route path="/account/orders/:orderId" component={OrderDetail} />
          <Route path="/admin" component={Admin} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <WishlistProvider>
            <TooltipProvider>
              <FirebaseRedirectHandler />
              <PerformanceMonitor />
              <NavigationProgress />
              <Toaster />
              <Router />
            </TooltipProvider>
          </WishlistProvider>
        </CartProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
