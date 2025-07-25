// Mock Data Service for Development
// This provides seed data for development and testing
import { ELECTRICAL_CATEGORIES } from '@shared/data/categories';
import { ELECTRICAL_PRODUCTS } from '@shared/data/products';
import type { Category, Product } from '@shared/types';

export class MockDataService {
  static async initializeCategories(): Promise<void> {
    console.log('Initializing categories...');
    // Categories would be seeded into Firestore in a real implementation
  }

  static async initializeProducts(): Promise<void> {
    console.log('Initializing products...');
    // Products would be seeded into Firestore in a real implementation  
  }

  static getCategories(): (Category & { createdAt: Date; updatedAt: Date })[] {
    return ELECTRICAL_CATEGORIES.map(cat => ({
      ...cat,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }

  static getProducts(): (Product & { createdAt: Date; updatedAt: Date })[] {
    return ELECTRICAL_PRODUCTS.map(prod => ({
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
    return this.getProducts().filter(p =>
      p.name.toLowerCase().includes(searchTerm) ||
      p.description?.toLowerCase().includes(searchTerm) ||
      p.shortDescription?.toLowerCase().includes(searchTerm)
    );
  }
}