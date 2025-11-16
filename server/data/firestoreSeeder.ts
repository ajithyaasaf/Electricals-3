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
      const docRef = doc(collection(db, COLLECTIONS.CATEGORIES));
      batch.set(docRef, {
        ...category,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      categoryIds.push(docRef.id);
    });

    await batch.commit();
    console.log(`✅ Successfully seeded ${AUTHENTIC_CATEGORIES.length} categories`);
    return categoryIds;
  }

  static async seedProducts(categoryIds: string[]): Promise<void> {
    console.log('🌱 Seeding products to Firestore...');
    console.log(`📦 Total products to seed: ${AUTHENTIC_PRODUCTS.length}`);

    // Map category slugs to IDs for CopperBear products
    // Updated category mapping for new navigation structure
    const categoryMap: Record<string, string> = {
      'wires-cables': categoryIds[0],
      'switch-sockets': categoryIds[1],
      'electric-accessories': categoryIds[2],
      'electrical-pipes-fittings': categoryIds[3],
      'distribution-box': categoryIds[4],
      'led-bulb-fittings': categoryIds[5]
    };

    // Process products in batches of 25 (well within Firestore's 500 limit)
    const batchSize = 25;
    const totalProducts = AUTHENTIC_PRODUCTS.length;
    
    for (let i = 0; i < totalProducts; i += batchSize) {
      const batch = writeBatch(db);
      const batchProducts = AUTHENTIC_PRODUCTS.slice(i, i + batchSize);
      
      batchProducts.forEach((product, index) => {
        const docRef = doc(collection(db, COLLECTIONS.PRODUCTS));
        
        // Map products to correct categories based on customer data
        let categoryId = '';
        if (product.sku?.includes('FIN') || product.sku?.includes('KUN')) {
          // Finolex and Kundan Cable products go to Wires & Cables
          categoryId = categoryMap['wires-cables'];
        } else if (product.sku?.includes('STU') && (product.name.includes('Inverter') || product.name.includes('LED') || product.name.includes('Flood') || product.name.includes('Street'))) {
          // All Sturlite LED products go to LED Bulb & Fittings
          categoryId = categoryMap['led-bulb-fittings'];
        } else {
          // Default to LED Bulb & Fittings for any other products
          categoryId = categoryMap['led-bulb-fittings'];
        }

        console.log(`🔧 Processing product ${i + index + 1}: ${product.name} (${product.sku}) -> Category: ${categoryId}`);

        batch.set(docRef, {
          ...product,
          categoryId,
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