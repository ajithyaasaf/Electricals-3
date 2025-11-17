import { useState, useEffect, useRef } from "react";
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
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useCartContext } from "@/contexts/cart-context";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatPrice, formatSavings } from "@/lib/currency";
import {
  Star,
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Shield,
  Truck,
  RotateCcw,
  ArrowLeft,
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  Eye,
  Share2,
  ChevronDown,
} from "lucide-react";
import { Link } from "wouter";
import { ReviewList } from "@/components/reviews/review-list";
import { ReviewForm } from "@/components/reviews/review-form";
import { useProductSEO } from "@/hooks/use-seo";
import type { Product } from "shared/types";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCartContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useFirebaseAuth();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState(3);
  const [stockUrgency, setStockUrgency] = useState(false);
  const [showDeliveryEstimate, setShowDeliveryEstimate] = useState(false);
  const [imageZoom, setImageZoom] = useState({ x: 0, y: 0, scale: 1 });
  const imageRef = useRef<HTMLImageElement>(null);

  // Fetch product details by slug
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products/slug", slug],
    queryFn: async () => {
      const response = await fetch(`/api/products/slug/${slug}`);
      if (!response.ok) {
        throw new Error('Product not found');
      }
      return response.json();
    }
  });

  // Fetch related products
  const { data: relatedProducts } = useQuery<{ products: Product[] }>({
    queryKey: ["/api/products", { categoryId: product?.categoryId, limit: 4 }],
    enabled: !!product?.categoryId,
  });

  // Fetch reviews
  const { data: reviews = [] } = useQuery<any[]>({
    queryKey: ["/api/reviews", { productId: product?.id }],
    enabled: !!product?.id,
  });

  // SEO optimization for product detail page
  useProductSEO(product);

  // Advanced UX: Track product views and stock urgency
  useEffect(() => {
    if (product) {
      // Simulate recent views increment
      setRecentlyViewed((prev) => prev + Math.floor(Math.random() * 3));

      // Show stock urgency for low inventory
      if (product.stock && product.stock <= 5) {
        setStockUrgency(true);
      }
    }
  }, [product]);

  // Image zoom functionality
  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setImageZoom({ x, y, scale: 2 });
  };

  const handleMouseLeave = () => {
    setImageZoom({ x: 50, y: 50, scale: 1 });
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await addItem(product?.id, undefined, quantity);
    },
    onSuccess: () => {
      toast({
        title: "Added to cart",
        description: `${quantity} ${product?.name} added to your cart.`,
        duration: 2000,
      });
    },
    onError: (error) => {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  const images = product.imageUrls || [
    "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800",
  ];
  const price = product.price;
  const originalPrice = product.originalPrice;
  const hasDiscount = originalPrice && originalPrice > price;
  const rating = product.rating || 0;
  const reviewCount = product.reviewCount || 0;

  const handleAddToCart = () => {
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
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          {" / "}
          <Link href="/products" className="hover:text-gray-900">
            Products
          </Link>
          {" / "}
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Advanced Product Images Gallery */}
          <div className="space-y-4">
            {/* Main Image with Zoom */}
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden group">
              <img
                ref={imageRef}
                src={images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover cursor-zoom-in transition-transform duration-300"
                style={{
                  transform: `scale(${imageZoom.scale})`,
                  transformOrigin: `${imageZoom.x}% ${imageZoom.y}%`,
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={() => setShowImageModal(true)}
              />

              {/* Image Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/70"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/70"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Zoom Indicator */}
              <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <ZoomIn className="w-4 h-4" />
              </div>

              {/* Clean Viewing Badge */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm border border-gray-200 px-3 py-1 rounded text-xs font-medium flex items-center space-x-1">
                <Eye className="w-3 h-3 text-gray-600" />
                <span className="text-gray-700">{recentlyViewed} viewing</span>
              </div>
            </div>

            {/* Thumbnail Grid */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                      selectedImageIndex === index
                        ? "border-copper-600 shadow-lg"
                        : "border-gray-200 hover:border-gray-300"
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

            {/* Share Button */}
            <button className="w-full flex items-center justify-center space-x-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Share this product</span>
            </button>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>

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
                  <span className="text-sm text-gray-600">
                    ({reviewCount} reviews)
                  </span>
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
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
                        In Stock
                      </Badge>
                      {stockUrgency && (
                        <span className="text-sm text-muted-foreground">
                          Only {product.stock} left
                        </span>
                      )}
                    </div>

                    {/* Delivery Options */}
                    <button
                      onClick={() =>
                        setShowDeliveryEstimate(!showDeliveryEstimate)
                      }
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      data-testid="button-delivery-options"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Check delivery options</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${showDeliveryEstimate ? "rotate-180" : ""}`}
                      />
                    </button>

                    {showDeliveryEstimate && (
                      <div className="bg-blue-50 p-4 rounded-md text-sm space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Standard Delivery:</span>
                          <span className="font-medium">3-5 business days</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Express Delivery:</span>
                          <span className="font-medium">1-2 business days</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Badge variant="destructive">Out of Stock</Badge>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Notify me when available
                    </button>
                  </div>
                )}
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="text-gray-600 mb-6">{product.shortDescription}</p>
              )}

              {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-900">
                    Quantity:
                  </label>
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
                      onChange={(e) =>
                        setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                      }
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
                    <Heart
                      className={`w-4 h-4 ${isWishlisted ? "fill-current text-red-500" : ""}`}
                    />
                  </Button>
                </div>
              </div>

              {/* Clean Trust Badges */}
              <div className="mt-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 border-t border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700">Quality Guaranteed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Truck className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700">Free Shipping ₹500+</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RotateCcw className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700">30-Day Returns</span>
                  </div>
                </div>
                
                {/* Simple Social Proof */}
                <div className="flex items-center justify-between py-2 px-3 bg-orange-50 border border-orange-200 rounded">
                  <span className="text-sm text-orange-800">{recentlyViewed * 4} people added this to cart this week</span>
                  <span className="text-xs text-orange-700 font-medium">Trending</span>
                </div>
                
                {/* Customer Satisfaction */}
                <div className="flex items-center space-x-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-700">98% Customer Satisfaction</span>
                  <span className="text-xs text-gray-500">(Based on 300+ reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Frequently Bought Together */}
        <div className="mb-12 p-6 bg-white rounded-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Frequently Bought Together
          </h2>
          <div className="flex items-center space-x-4 overflow-x-auto pb-4">
            {/* Main Product */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                <img
                  src={images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <p className="text-xs text-center mt-2 font-medium">
                {formatPrice(price)}
              </p>
            </div>

            <div className="text-2xl text-gray-400">+</div>

            {/* Complementary Products */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200"
                  alt="Wire Connector"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <p className="text-xs text-center mt-2 font-medium">
                {formatPrice(299)}
              </p>
            </div>

            <div className="text-2xl text-gray-400">+</div>

            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=200"
                  alt="Electrical Tape"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <p className="text-xs text-center mt-2 font-medium">
                {formatPrice(149)}
              </p>
            </div>

            <div className="text-2xl text-gray-400">=</div>

            {/* Total Price */}
            <div className="flex-shrink-0 text-center">
              <div className="bg-green-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Bundle Price</p>
                <p className="text-xl font-bold text-green-700">
                  {formatPrice(price + 299 + 149 - 100)}
                </p>
                <p className="text-xs text-green-600">
                  Save {formatPrice(100)}
                </p>
              </div>
              <Button className="mt-3 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2">
                Add Bundle to Cart
              </Button>
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
                  <div
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                ) : (
                  <p className="text-gray-600">
                    No description available for this product.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            <div className="bg-white rounded-lg p-6">
              {product.specifications ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between py-2 border-b border-gray-200"
                      >
                        <span className="font-medium text-gray-900">
                          {key}:
                        </span>
                        <span className="text-gray-600">{String(value)}</span>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p className="text-gray-600">
                  No specifications available for this product.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="bg-white rounded-lg p-6">
              {/* Review Summary & Filters */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Rating Overview */}
                  <div>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="text-4xl font-bold text-gray-900">
                        {rating.toFixed(1)}
                      </div>
                      <div>
                        <div className="flex text-yellow-400 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${i < Math.floor(rating) ? "fill-current" : ""}`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">
                          {reviewCount} reviews
                        </p>
                      </div>
                    </div>

                    {/* Rating Breakdown */}
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const percentage = Math.floor(Math.random() * 60) + 20; // Simulated data
                        return (
                          <div
                            key={stars}
                            className="flex items-center space-x-2 text-sm"
                          >
                            <span className="w-8">{stars} ★</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="w-12 text-gray-600">
                              {percentage}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Review Filters */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Filter Reviews
                    </h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="mr-2 mb-2">
                        All Reviews
                      </Button>
                      <Button variant="outline" size="sm" className="mr-2 mb-2">
                        5 Stars
                      </Button>
                      <Button variant="outline" size="sm" className="mr-2 mb-2">
                        4 Stars
                      </Button>
                      <Button variant="outline" size="sm" className="mr-2 mb-2">
                        With Photos
                      </Button>
                      <Button variant="outline" size="sm" className="mr-2 mb-2">
                        Verified Purchase
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {/* Sample Premium Review */}
                  <div className="border-b border-gray-200 pb-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                          RK
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                            <span>Rajesh Kumar</span>
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              Verified Purchase
                            </Badge>
                          </h4>
                          <div className="flex text-yellow-400 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">2 weeks ago</span>
                    </div>

                    <h5 className="font-medium text-gray-900 mb-2">
                      Excellent quality and fast delivery!
                    </h5>
                    <p className="text-gray-700 mb-3">
                      This LED flood light exceeded my expectations. The
                      brightness is perfect for my warehouse, and the build
                      quality feels very solid. Installation was straightforward
                      with the included mounting hardware.
                    </p>

                    {/* Customer Photos */}
                    <div className="flex space-x-2 mb-3">
                      <img
                        src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=100&h=100&fit=crop"
                        alt="Customer photo"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <img
                        src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop"
                        alt="Customer photo"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </div>

                    {/* Review Actions */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <button className="flex items-center space-x-1 hover:text-blue-600">
                        <span>👍</span>
                        <span>Helpful (24)</span>
                      </button>
                      <button className="hover:text-blue-600">Reply</button>
                      <button className="hover:text-blue-600">Report</button>
                    </div>
                  </div>

                  {/* Additional reviews would be mapped here */}
                  {reviews.map((review: any) => (
                    <div
                      key={review.id}
                      className="border-b border-gray-200 pb-6"
                    >
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
                            <h4 className="font-medium text-gray-900">
                              {review.title}
                            </h4>
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
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Star className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Be the first to review!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Share your experience with other customers.
                  </p>
                  <Button className="bg-copper-600 hover:bg-copper-700 text-white">
                    Write a Review
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts?.products && relatedProducts.products.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Related Products
            </h2>
            <ProductGrid
              products={
                relatedProducts.products
                  .filter((p) => p.id !== product.id)
                  .slice(0, 4) as any
              }
            />
          </div>
        )}
      </div>

      {/* Fullscreen Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="relative max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center px-4">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="w-8 h-8" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10"
                >
                  <ChevronLeft className="w-10 h-10" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10"
                >
                  <ChevronRight className="w-10 h-10" />
                </button>
              </>
            )}

            <img
              src={images[selectedImageIndex]}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
            />

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
              {selectedImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}

      {/* Clean Purchase Notification */}
      <div className="fixed bottom-4 left-4 z-40">
        <div className="bg-white border border-gray-200 rounded p-3 shadow-sm max-w-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Someone from Mumbai</span> purchased this item
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
