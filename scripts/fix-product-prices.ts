/**
 * BULK MIGRATION: Auto-Fix All Corrupted Product Prices
 * 
 * Strategy: Compare Firestore with source data (products.ts)
 * If prices don't match, assume Firestore is in rupees and fix it
 * 
 * Run once, then delete this file.
 */

// Load environment variables FIRST
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ELECTRICAL_PRODUCTS } from '../shared/data/products';

// Firebase config from .env file
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface CorruptedProduct {
    id: string;
    name: string;
    currentPrice: number;
    correctPrice: number;
    currentOriginalPrice?: number;
    correctOriginalPrice?: number;
}

async function findAndFixCorruptedProducts() {
    console.log('🔍 Scanning all products in Firestore...\n');

    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);

    const corrupted: CorruptedProduct[] = [];
    const correct: string[] = [];
    const notInSource: string[] = [];

    console.log(`📦 Found ${snapshot.size} products in Firestore\n`);

    for (const docSnap of snapshot.docs) {
        const firestoreData = docSnap.data();
        const productId = docSnap.id;

        // Find matching product in source data
        const sourceProduct = ELECTRICAL_PRODUCTS.find(p => p.id === productId);

        if (!sourceProduct) {
            notInSource.push(productId);
            continue;
        }

        // Check if prices match
        const priceMatches = firestoreData.price === sourceProduct.price;
        const originalPriceMatches = !sourceProduct.originalPrice ||
            firestoreData.originalPrice === sourceProduct.originalPrice;

        if (priceMatches && originalPriceMatches) {
            correct.push(productId);
            console.log(`✅ ${sourceProduct.name} - Already correct`);
        } else {
            // Corrupted! Prices don't match source
            corrupted.push({
                id: productId,
                name: sourceProduct.name,
                currentPrice: firestoreData.price,
                correctPrice: sourceProduct.price,
                currentOriginalPrice: firestoreData.originalPrice,
                correctOriginalPrice: sourceProduct.originalPrice,
            });

            console.log(`❌ ${sourceProduct.name}:`);
            console.log(`   DB: ₹${firestoreData.price} | Should be: ${sourceProduct.price} paise`);
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log(`\n📊 Scan Results:`);
    console.log(`   ✅ Correct: ${correct.length} products`);
    console.log(`   ❌ Corrupted: ${corrupted.length} products`);
    console.log(`   ⚠️  Not in source: ${notInSource.length} products\n`);

    if (corrupted.length === 0) {
        console.log('🎉 All products are correct! No fix needed.');
        return;
    }

    console.log('🔧 Starting bulk fix...\n');

    let fixed = 0;
    let failed = 0;

    for (const product of corrupted) {
        try {
            const productRef = doc(db, 'products', product.id);

            const updateData: any = {
                price: product.correctPrice,
                updatedAt: new Date(),
            };

            if (product.correctOriginalPrice) {
                updateData.originalPrice = product.correctOriginalPrice;
            }

            await updateDoc(productRef, updateData);

            console.log(`   ✅ Fixed: ${product.name}`);
            console.log(`      ${product.currentPrice} → ${product.correctPrice} paise`);
            fixed++;
        } catch (error) {
            console.error(`   ❌ Failed: ${product.name}`, error);
            failed++;
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log(`\n🎯 Fix Summary:`);
    console.log(`   ✅ Successfully fixed: ${fixed} products`);
    console.log(`   ❌ Failed: ${failed} products`);
    console.log(`   📦 Total processed: ${corrupted.length} products\n`);
    

    if (failed === 0) {
        console.log('🎉 All corrupted products fixed successfully!');
        console.log('⚠️  IMPORTANT: Delete this migration script now!');
        console.log('💡 Clear localStorage in browser to refresh cart');
    } else {
        console.log('⚠️  Some products failed. Review errors above.');
    }
}

// Run migration
console.log('🚀 Bulk Product Price Migration');
console.log('='.repeat(70) + '\n');

findAndFixCorruptedProducts()
    .then(() => {
        console.log('\n✅ Migration complete\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Migration failed:', error);
        console.error('\nStack trace:', error.stack);
        process.exit(1);
    });
