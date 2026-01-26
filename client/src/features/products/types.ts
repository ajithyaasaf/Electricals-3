// Product feature types
export interface ProductsResponse {
  products: ProductItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  sku?: string;
  stock: number;
  categoryId?: string;
  imageUrls: string[];
  specifications?: Record<string, any>;
  isFeatured: boolean;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  warranty?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
}

export interface ProductFilters {
  categoryId?: string;
  search: string;
  featured: boolean;
  minPrice: number;
  maxPrice: number;
  sortBy: "name" | "price" | "rating" | "newest";
  sortOrder: "asc" | "desc";
}