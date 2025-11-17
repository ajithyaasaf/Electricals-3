// CopperBear Firestore Seeding System
// Seeds categories and products with authentic customer electrical data

import { 
  collection, 
  doc, 
  writeBatch, 
  getDocs, 
  query, 
  limit 
} from 'firebase/firestore';
import { db } from '@shared/firestore';
import { COLLECTIONS } from '../firestoreService';
import { AUTHENTIC_CATEGORIES, AUTHENTIC_PRODUCTS } from './electricalProductsData';

export class FirestoreSeeder {
  static async seedCategories(): Promise<string[]> {
    console.log('🌱 Seeding categories to Firestore...');
    
    const batch = writeBatch(db);
    const categoryIds: string[] = [];

    AUTHENTIC_CATEGORIES.forEach((category, index) => {
      // Use the category ID from the data instead of auto-generating
      const docRef = doc(db, COLLECTIONS.CATEGORIES, category.id);
      batch.set(docRef, {
        ...category,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      categoryIds.push(category.id);
      console.log(`📁 Creating category: ${category.name} with ID: ${category.id}`);
    });

    await batch.commit();
    console.log(`✅ Successfully seeded ${AUTHENTIC_CATEGORIES.length} categories`);
    return categoryIds;
  }

  static async seedProducts(categoryIds: string[]): Promise<void> {
    console.log('🌱 Seeding products to Firestore...');
    console.log(`📦 Total products to seed: ${AUTHENTIC_PRODUCTS.length}`);

    // Process products in batches of 25 (well within Firestore's 500 limit)
    const batchSize = 25;
    const totalProducts = AUTHENTIC_PRODUCTS.length;
    
    for (let i = 0; i < totalProducts; i += batchSize) {
      const batch = writeBatch(db);
      const batchProducts = AUTHENTIC_PRODUCTS.slice(i, i + batchSize);
      
      batchProducts.forEach((product, index) => {
        // Use the product ID from the data instead of auto-generating
        const docRef = doc(db, COLLECTIONS.PRODUCTS, product.id);
        
        // Use the categoryId from the product data itself
        // Products already have correct categoryIds assigned in electricalProductsData.ts
        console.log(`🔧 Processing product ${i + index + 1}: ${product.name} (${product.sku}) -> Category: ${product.categoryId}`);

        batch.set(docRef, {
          ...product,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });

      await batch.commit();
      console.log(`✅ Batch ${Math.floor(i / batchSize) + 1} committed: ${batchProducts.length} products`);
    }
    
    console.log(`✅ Successfully seeded all ${AUTHENTIC_PRODUCTS.length} products`);
  }

  static async checkIfDataExists(): Promise<boolean> {
    const categoriesQuery = query(collection(db, COLLECTIONS.CATEGORIES), limit(1));
    const productsQuery = query(collection(db, COLLECTIONS.PRODUCTS), limit(1));
    
    const [categoriesSnapshot, productsSnapshot] = await Promise.all([
      getDocs(categoriesQuery),
      getDocs(productsQuery)
    ]);

    return !categoriesSnapshot.empty && !productsSnapshot.empty;
  }

  static async clearDatabase(): Promise<void> {
    console.log('🧹 Clearing existing database data...');
    
    const batch = writeBatch(db);
    
    // Clear products
    const productsSnapshot = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
    productsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Clear categories
    const categoriesSnapshot = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
    categoriesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log('✅ Database cleared successfully');
  }

  static async seedDatabase(skipCheck: boolean = false): Promise<void> {
    try {
      if (!skipCheck) {
        console.log('🔍 Checking if data already exists...');
        const dataExists = await this.checkIfDataExists();
        
        if (dataExists) {
          console.log('📊 Database already contains data, skipping seeding');
          return;
        }
      }

      console.log('🚀 Starting database seeding process...');
      
      // Seed categories first
      const categoryIds = await this.seedCategories();
      
      // Then seed products with category references
      await this.seedProducts(categoryIds);
      
      console.log('🎉 Database seeding completed successfully!');
      console.log(`📊 Added ${AUTHENTIC_CATEGORIES.length} categories and ${AUTHENTIC_PRODUCTS.length} products`);
      
    } catch (error) {
      console.error('❌ Error seeding database:', error);
      throw error;
    }
  }
}