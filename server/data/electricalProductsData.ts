// CopperBear Customer Products Data - Complete 25 Product Catalog
// Real customer product data with proper specifications and market pricing

import type { Category, Product } from '@shared/types';
import { ELECTRICAL_CATEGORIES } from '@shared/data/categories';
import { ELECTRICAL_PRODUCTS } from '@shared/data/products';

// Import categories from shared source to ensure consistency
export const AUTHENTIC_CATEGORIES: Omit<Category, 'createdAt' | 'updatedAt'>[] = ELECTRICAL_CATEGORIES;

// Complete CopperBear customer products - All 25 products from CSV
export const AUTHENTIC_PRODUCTS: Omit<Product, 'createdAt' | 'updatedAt'>[] = ELECTRICAL_PRODUCTS;

// Development data service with timestamp handling for complete customer products
export class AuthenticElectricalDataService {
  static getCategories(): (Category & { createdAt: Date; updatedAt: Date })[] {
    return AUTHENTIC_CATEGORIES.map(cat => ({
      ...cat,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }

  static getProducts(): (Product & { createdAt: Date; updatedAt: Date })[] {
    return AUTHENTIC_PRODUCTS.map(prod => ({
      ...prod,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }

  static getFeaturedProducts(): (Product & { createdAt: Date; updatedAt: Date })[] {
    return this.getProducts().filter(p => p.isFeatured);
  }

  static getProductsByCategory(categoryId: string): (Product & { createdAt: Date; updatedAt: Date })[] {
    return this.getProducts().filter(p => p.categoryId === categoryId);
  }

  static searchProducts(query: string): (Product & { createdAt: Date; updatedAt: Date })[] {
    const searchTerm = query.toLowerCase();
    return this.getProducts().filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      (product.description && product.description.toLowerCase().includes(searchTerm)) ||
      (product.shortDescription && product.shortDescription.toLowerCase().includes(searchTerm)) ||
      product.specifications?.brand?.toLowerCase().includes(searchTerm)
    );
  }
}