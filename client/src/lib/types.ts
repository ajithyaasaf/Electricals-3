export interface SearchFilters {
  categoryId?: number;
  search?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sortBy?: 'name' | 'price' | 'rating' | 'newest';
  sortOrder?: 'asc' | 'desc';
}

export interface CartContext {
  items: CartItemWithProduct[];
  totalItems: number;
  totalAmount: number;
  addItem: (productId: number, quantity?: number) => void;
  updateItem: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
}

export interface CartItemWithProduct {
  id: number;
  userId: string;
  productId: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: {
    id: number;
    name: string;
    price: string;
    imageUrls: string[] | null;
    stock: number;
  };
}

export interface ProductWithCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: string;
  originalPrice: string | null;
  sku: string | null;
  stock: number | null;
  categoryId: number | null;
  imageUrls: string[] | null;
  specifications: any;
  isFeatured: boolean | null;
  isActive: boolean | null;
  rating: string | null;
  reviewCount: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface ServiceWithCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  startingPrice: string;
  duration: number | null;
  categoryId: number | null;
  imageUrl: string | null;
  features: string[] | null;
  isActive: boolean | null;
  rating: string | null;
  reviewCount: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface OrderWithItems {
  id: number;
  userId: string;
  orderNumber: string;
  status: string;
  totalAmount: string;
  shippingAddress: any;
  billingAddress: any;
  paymentMethod: string | null;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  items: {
    id: number;
    orderId: number;
    productId: number | null;
    quantity: number;
    price: string;
    product?: {
      name: string;
      imageUrls: string[] | null;
    };
  }[];
}

export interface BookingWithService {
  id: number;
  userId: string;
  serviceId: number;
  bookingNumber: string;
  status: string;
  scheduledDate: string | null;
  scheduledTime: string | null;
  address: any;
  notes: string | null;
  totalAmount: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  service: {
    name: string;
    startingPrice: string;
    imageUrl: string | null;
  };
}
