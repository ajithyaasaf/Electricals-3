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
import { useWishlist } from "@/contexts/wishlist-context";
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
import { addToRecentlyViewed } from "@/components/common/recently-viewed";

// Helper to format specification keys (e.g., ip_rating -> IP Rating)
const formatSpecKey = (key: string): string => {
  const acronyms = ["IP", "LED", "CRI", "GST", "UV", "RGB", "USB", "AC", "DC"];

  return key
    .split(/_|\s+/)
    .map((word) => {
      const upper = word.toUpperCase();
      if (acronyms.includes(upper)) return upper;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
};

// Helper to format specification values (e.g., true -> Yes)
const formatSpecValue = (value: any): string => {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  if (value === null || value === undefined) return "-";
  return String(value);
};

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCartContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useFirebaseAuth();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [showImageModal, setShowImageModal] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState(3);
  const [stockUrgency, setStockUrgency] = useState(false);
  const [showDeliveryEstimate, setShowDeliveryEstimate] = useState(false);
  const [imageZoom, setImageZoom] = useState({ x: 0, y: 0, scale: 1 });
  const [scrollY, setScrollY] = useState(0);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      // Show sticky bar after scrolling past 500px (roughly past main image)
      setShowStickyBar(currentScrollY > 500);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

      // Track recently viewed
      addToRecentlyViewed({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.imageUrls?.[0] || "",
        slug: product.slug,
        category: product.category || ""
      });
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
      await addItem(product?.id, undefined, quantity, undefined, product);
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
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCartMutation.mutate();
  };

  const handleToggleWishlist = async () => {
    if (!product) return;

    if (isWishlisted) {
      await removeFromWishlist(product.id);
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist.`,
      });
    } else {
      await addToWishlist(product.id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />




      {/* Sticky Add to Cart Bar - Appears on Scroll */}
      <div
        className={`fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md shadow-md z-40 transform transition-transform duration-300 border-b border-gray-200 ${showStickyBar ? "translate-y-0" : "-translate-y-full"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={images[0]}
              alt={product.name}
              className="w-10 h-10 object-cover rounded shadow-sm"
            />
            <div className="hidden md:block">
              <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
              <p className="text-sm font-bold text-copper-600">{formatPrice(price)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleAddToCart}
              className="bg-copper-600 hover:bg-copper-700 text-white shadow-lg shadow-copper-200"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb - Elegant Minimalist */}
        <nav className="text-sm text-gray-500 mb-8 pt-4 flex items-center space-x-2">
          <Link href="/" className="hover:text-copper-600 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link href="/products" className="hover:text-copper-600 transition-colors">Products</Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 mb-20 relative">

          {/* Left Column - Sticky Image Gallery */}
          <div className="space-y-6 lg:sticky lg:top-24 h-fit">

            {/* Main Image with Premium Zoom Interaction */}
            <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm group">
              <img
                ref={imageRef}
                src={images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover cursor-crosshair transition-transform duration-500 ease-out"
                style={{
                  transform: `scale(${imageZoom.scale})`,
                  transformOrigin: `${imageZoom.x}% ${imageZoom.y}%`,
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={() => setShowImageModal(true)}
              />

              {/* Badges - Floating glassmorphism */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {hasDiscount && (
                  <Badge className="bg-white/90 backdrop-blur text-red-600 border-red-100 shadow-sm px-3 py-1 text-xs uppercase tracking-wider">
                    -{formatSavings(originalPrice!, price)}
                  </Badge>
                )}
                {recentlyViewed > 5 && (
                  <Badge className="bg-white/90 backdrop-blur text-gray-800 border-gray-200 shadow-sm px-3 py-1 text-xs flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {recentlyViewed} viewing
                  </Badge>
                )}
              </div>

              {/* Navigation Arrows (Hover only) */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Carousel - Clean & Minimal */}
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all duration-300 ${selectedImageIndex === index
                      ? "border-copper-600 ring-4 ring-copper-50"
                      : "border-transparent opacity-70 hover:opacity-100 hover:border-gray-200"
                      }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Premium Buy Box Info */}
          <div className="flex flex-col pt-2">

            {/* Header Section */}
            <div className="mb-6 border-b border-gray-100 pb-6">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight tracking-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 text-sm">
                {rating > 0 && (
                  <div className="flex items-center gap-1 group cursor-pointer hover:bg-gray-50 px-2 py-1 -ml-2 rounded-lg transition-colors">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-current" : "text-gray-200"}`} />
                      ))}
                    </div>
                    <span className="font-medium text-gray-700 underline decoration-gray-300 underline-offset-4 group-hover:decoration-copper-400">
                      {reviewCount} reviews
                    </span>
                  </div>
                )}
                {product.sku && <span className="text-gray-400">|</span>}
                {product.sku && <span className="text-gray-500 font-mono">SKU: {product.sku}</span>}
              </div>
            </div>

            {/* Price Section - Big Statement */}
            <div className="mb-8">
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold text-gray-900 tracking-tight">
                  {formatPrice(price)}
                </span>
                {originalPrice && (
                  <span className="text-xl text-gray-400 line-through decoration-2">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                    Save {formatPrice(originalPrice! - price)}
                  </span>
                  <p className="text-sm text-gray-500">(Includes 18% GST)</p>
                </div>
              )}
            </div>

            {/* Description Excerpt */}
            {product.shortDescription && (
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                {product.shortDescription}
              </p>
            )}

            {/* Purchase Options */}
            <div className="space-y-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">

              {/* Quantity Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="p-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center border-none focus:ring-0 font-medium text-gray-900"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={quantity >= (product.stock || 0)}
                      className="p-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  {product.stock && product.stock < 10 && (
                    <span className="text-red-600 text-sm font-medium animate-pulse">
                      Only {product.stock} left in stock!
                    </span>
                  )}
                </div>
              </div>

              {/* Primary Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.stock}
                  className="flex-1 h-12 text-lg font-semibold bg-copper-600 hover:bg-copper-700 text-white rounded-xl shadow-lg shadow-copper-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {product.stock ? "Add to Cart" : "Out of Stock"}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleToggleWishlist}
                  className="h-12 px-6 rounded-xl border-gray-200 hover:border-copper-200 hover:bg-copper-50 transition-colors"
                >
                  <Heart className={`w-6 h-6 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                </Button>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200/50">
                {product.warranty && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4 text-copper-600" />
                    <span>{product.warranty}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <RotateCcw className="w-4 h-4 text-copper-600" />
                  <span>7-Day Returns</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-copper-600" />
                  <span>Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Frequently Bought Together (Refreshed) */}
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
                {formatPrice(29900)}
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
                {formatPrice(14900)}
              </p>
            </div>

            <div className="text-2xl text-gray-400">=</div>

            {/* Total Price */}
            <div className="flex-shrink-0 text-center">
              <div className="bg-green-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Bundle Price</p>
                <p className="text-xl font-bold text-green-700">
                  {formatPrice(price + 29900 + 14900 - 10000)}
                </p>
                <p className="text-xs text-green-600">
                  Save {formatPrice(10000)}
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            {/* <TabsTrigger value="reviews">Reviews ({reviewCount})</TabsTrigger> */}
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
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {product.specifications && Object.keys(product.specifications).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y divide-gray-100 md:divide-y-0">
                  {Object.entries(product.specifications).map(([key, value], index) => (
                    <div
                      key={key}
                      className={`flex flex-col sm:flex-row sm:justify-between px-6 py-4 hover:bg-copper-50/10 transition-colors ${
                        // Add borders for grid separation
                        index % 2 === 0 ? "md:border-r border-gray-100" : ""
                        } ${
                        // Add bottom borders for all except last row(s)
                        index < Object.keys(product.specifications!).length - (Object.keys(product.specifications!).length % 2 === 0 ? 2 : 1)
                          ? "border-b border-gray-100"
                          : ""
                        }`}
                    >
                      <span className="text-sm font-medium text-gray-900 mb-1 sm:mb-0">
                        {formatSpecKey(key)}
                      </span>
                      <span className="text-sm text-gray-600 sm:text-right font-mono sm:font-sans">
                        {formatSpecValue(value)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                    <Clock className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-1">No specifications found</h4>
                  <p className="text-gray-500 max-w-xs">Detailed technical specifications haven't been added for this product yet.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* <TabsContent value="reviews" className="mt-6">
            <div className="bg-white rounded-lg p-6">
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const percentage = Math.floor(Math.random() * 60) + 20; 
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

              {reviews.length > 0 ? (
                <div className="space-y-6">
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

                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <button className="flex items-center space-x-1 hover:text-blue-600">
                        <span>👍</span>
                        <span>Helpful (24)</span>
                      </button>
                      <button className="hover:text-blue-600">Reply</button>
                      <button className="hover:text-blue-600">Report</button>
                    </div>
                  </div>

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
          */}
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
      {
        showImageModal && (
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
        )
      }

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
    </div >
  );
}
