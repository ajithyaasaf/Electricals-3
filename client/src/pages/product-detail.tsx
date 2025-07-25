import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatPrice, formatSavings } from "@/lib/currency";
import { Star, Heart, ShoppingCart, Minus, Plus, Shield, Truck, RotateCcw, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { ReviewList } from "@/components/reviews/review-list";
import { ReviewForm } from "@/components/reviews/review-form";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Fetch product details
  const { data: product, isLoading } = useQuery({
    queryKey: ["/api/products", slug],
  });

  // Fetch related products
  const { data: relatedProducts } = useQuery({
    queryKey: ["/api/products", { categoryId: product?.categoryId, limit: 4 }],
    enabled: !!product?.categoryId,
  });

  // Fetch reviews
  const { data: reviews = [] } = useQuery({
    queryKey: ["/api/reviews", { productId: product?.id }],
    enabled: !!product?.id,
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/cart", {
        productId: product?.id,
        quantity,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: `${quantity} ${product?.name} added to your cart.`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Please sign in",
          description: "You need to sign in to add items to cart.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      });
    },
  });

  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
      if (isWishlisted) {
        await apiRequest("DELETE", `/api/wishlist/${product?.id}`);
      } else {
        await apiRequest("POST", "/api/wishlist", {
          productId: product?.id,
        });
      }
    },
    onSuccess: () => {
      setIsWishlisted(!isWishlisted);
      toast({
        title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
        description: `${product?.name} has been ${isWishlisted ? "removed from" : "added to"} your wishlist.`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Please sign in",
          description: "You need to sign in to manage your wishlist.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="w-full h-96" />
            <div className="space-y-4">
              <Skeleton className="w-3/4 h-8" />
              <Skeleton className="w-1/2 h-6" />
              <Skeleton className="w-full h-20" />
              <Skeleton className="w-1/3 h-10" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  const images = product.imageUrls || ["https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"];
  const price = parseFloat(product.price);
  const originalPrice = product.originalPrice ? parseFloat(product.originalPrice) : null;
  const hasDiscount = originalPrice && originalPrice > price;
  const rating = parseFloat(product.rating || "0");
  const reviewCount = product.reviewCount || 0;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to add items to cart.",
        variant: "destructive",
      });
      return;
    }
    addToCartMutation.mutate();
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to manage your wishlist.",
        variant: "destructive",
      });
      return;
    }
    toggleWishlistMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          {" / "}
          <Link href="/products" className="hover:text-gray-900">Products</Link>
          {" / "}
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden">
              <img
                src={images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square bg-white rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index ? "border-copper-600" : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              
              {product.sku && (
                <p className="text-sm text-gray-600 mb-4">SKU: {product.sku}</p>
              )}

              {/* Rating */}
              {rating > 0 && (
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400 mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(rating) ? "fill-current" : ""}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({reviewCount} reviews)</span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(price)}
                </span>
                {originalPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
                {hasDiscount && (
                  <Badge className="bg-red-500">
                    {formatSavings(originalPrice!, price)}
                  </Badge>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.stock && product.stock > 0 ? (
                  <p className="text-green-600 font-medium">
                    ✓ In Stock ({product.stock} available)
                  </p>
                ) : (
                  <p className="text-red-600 font-medium">
                    ✗ Out of Stock
                  </p>
                )}
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="text-gray-600 mb-6">{product.shortDescription}</p>
              )}

              {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-900">Quantity:</label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 text-center"
                      min="1"
                      max={product.stock || 999}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={quantity >= (product.stock || 0)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button
                    onClick={handleAddToCart}
                    disabled={addToCartMutation.isPending || !product.stock}
                    className="flex-1 bg-copper-600 hover:bg-copper-700 text-white"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleToggleWishlist}
                    disabled={toggleWishlistMutation.isPending}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current text-red-500" : ""}`} />
                  </Button>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">Quality Guaranteed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-700">Free Shipping</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RotateCcw className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-gray-700">30-Day Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="description" className="mb-12">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviewCount})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-6">
            <div className="bg-white rounded-lg p-6">
              <div className="prose max-w-none">
                {product.description ? (
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                ) : (
                  <p className="text-gray-600">No description available for this product.</p>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="specifications" className="mt-6">
            <div className="bg-white rounded-lg p-6">
              {product.specifications ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-200">
                      <span className="font-medium text-gray-900">{key}:</span>
                      <span className="text-gray-600">{String(value)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No specifications available for this product.</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <div className="bg-white rounded-lg p-6">
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex text-yellow-400 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? "fill-current" : ""}`}
                              />
                            ))}
                          </div>
                          {review.title && (
                            <h4 className="font-medium text-gray-900">{review.title}</h4>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-600">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No reviews yet for this product.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts?.products && relatedProducts.products.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <ProductGrid 
              products={relatedProducts.products.filter(p => p.id !== product.id).slice(0, 4)} 
            />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
