/**
 * FIX PRODUCT PRICES - Admin API Endpoint
 * 
 * Call this endpoint to fix all corrupted products
 * Uses Firebase Admin SDK (bypasses security rules)
 */

import type { Request, Response } from 'express';
import admin from 'firebase-admin';
import { ELECTRICAL_PRODUCTS } from '@shared/data/products';

export async function fixProductPrices(req: Request, res: Response) {
    try {
        // Get Firestore instance (initialized by server startup)
        const db = admin.firestore();

        console.log('🚀 Starting product price migration...');

        const productsSnapshot = await db.collection('products').get();

        const corrupted: any[] = [];
        const correct: string[] = [];

        for (const doc of productsSnapshot.docs) {
            const firestoreData = doc.data();
            const productId = doc.id;

            // Find in source data
            const sourceProduct = ELECTRICAL_PRODUCTS.find(p => p.id === productId);

            if (!sourceProduct) continue;

            // Check if corrupted
            const priceMatches = firestoreData.price === sourceProduct.price;
            const originalPriceMatches = !sourceProduct.originalPrice ||
                firestoreData.originalPrice === sourceProduct.originalPrice;

            if (priceMatches && originalPriceMatches) {
                correct.push(productId);
            } else {
                corrupted.push({
                    id: productId,
                    name: sourceProduct.name,
                    currentPrice: firestoreData.price,
                    correctPrice: sourceProduct.price,
                    correctOriginalPrice: sourceProduct.originalPrice,
                });
            }
        }

        console.log(`Found ${corrupted.length} corrupted products`);

        // Fix them
        const batch = db.batch();

        for (const product of corrupted) {
            const productRef = db.collection('products').doc(product.id);

            const updateData: any = {
                price: product.correctPrice,
                updatedAt: new Date(),
            };

            if (product.correctOriginalPrice) {
                updateData.originalPrice = product.correctOriginalPrice;
            }

            batch.update(productRef, updateData);
        }

        await batch.commit();

        console.log(`✅ Fixed ${corrupted.length} products`);

        res.json({
            success: true,
            fixed: corrupted.length,
            correct: correct.length,
            products: corrupted.map(p => ({
                name: p.name,
                oldPrice: p.currentPrice,
                newPrice: p.correctPrice,
            })),
        });

    } catch (error: any) {
        console.error('Migration failed:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}
