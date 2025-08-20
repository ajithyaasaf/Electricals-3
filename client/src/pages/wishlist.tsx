// Wishlist Page - Main wishlist page component
import { useEffect } from 'react';
import { Heart, ArrowLeft, ShoppingCart, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WishlistGrid } from '@/components/wishlist/wishlist-grid';
import { useWishlist } from '@/contexts/wishlist-context';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { Link } from 'wouter';
import { formatPrice as formatCurrency } from '@/lib/currency';

export default function Wishlist() {
  const { 
    items, 
    loading, 
    totalItems, 
    totalValue, 
    analytics, 
    loadAnalytics,
    refreshWishlist 
  } = useWishlist();
  const { isAuthenticated } = useFirebaseAuth();
  
  useEffect(() => {
    if (isAuthenticated) {
      loadAnalytics();
    }
  }, [isAuthenticated, loadAnalytics]);
  
  useEffect(() => {
    // Refresh wishlist when component mounts
    refreshWishlist();
  }, [refreshWishlist]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-48"></div>
            <div className="h-4 bg-gray-200 rounded mb-8 w-32"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/products">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Heart className="h-8 w-8 text-red-500" />
                My Wishlist
              </h1>
              <p className="text-gray-600 mt-1">
                Keep track of products and services you love
              </p>
            </div>
            
            {totalItems > 0 && (
              <div className="text-right">
                <div className="text-2xl font-bold text-copper-600">
                  {formatCurrency(totalValue)}
                </div>
                <div className="text-sm text-gray-600">
                  Total value of {totalItems} items
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {totalItems === 0 ? (
          // Empty state
          <div className="text-center py-16">
            <Heart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start adding items to your wishlist to keep track of products and services you love. 
              Items in your wishlist are saved {isAuthenticated ? 'to your account' : 'locally'}.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/products">
                <Button>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Browse Products
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline">
                  Browse Services
                </Button>
              </Link>
            </div>
            
            {!isAuthenticated && (
              <div className="mt-8 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
                <p className="text-sm text-blue-800">
                  <strong>Sign in</strong> to sync your wishlist across devices and save items permanently.
                </p>
                <Link href="/auth">
                  <Button variant="outline" size="sm" className="mt-2">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <Tabs defaultValue="items" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="items">
                <Heart className="h-4 w-4 mr-2" />
                Wishlist Items ({totalItems})
              </TabsTrigger>
              <TabsTrigger value="analytics" disabled={!isAuthenticated || !analytics}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="items" className="mt-6">
              <WishlistGrid />
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-6">
              {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Summary Cards */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Total Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.totalItems}</div>
                      <div className="text-xs text-gray-500">
                        {analytics.addedThisWeek} added this week
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-copper-600">
                        {formatCurrency(analytics.totalValue)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Avg: {formatCurrency(analytics.averageItemPrice)}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Price Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.priceAlerts.active}</div>
                      <div className="text-xs text-gray-500">
                        {analytics.priceAlerts.triggered} triggered
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Top Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold truncate">{analytics.mostWishedCategory}</div>
                      <div className="text-xs text-gray-500">
                        Most wished category
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {analytics && analytics.categories.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Categories Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.categories.map((category) => (
                        <div key={category.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="font-medium">{category.name}</div>
                            <Badge variant="secondary">{category.count} items</Badge>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-copper-600">
                              {formatCurrency(category.value)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}