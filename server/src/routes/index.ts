import type { Express } from "express";
import { registerAuthRoutes } from "./auth";
import { registerProductRoutes } from "./products";
import { registerCategoryRoutes } from "./categories";
import { registerOrderRoutes } from "./orders";
import { registerServiceRoutes } from "./services";
import { registerAdminRoutes } from "./admin";
import { registerCartRoutes } from "./cart";
import { registerReviewRoutes } from "./reviews";
import { registerWishlistRoutes } from "./wishlist";
import { registerAnalyticsRoutes } from "./analytics";
import { setupFirebaseAuth } from "../../firebaseAuth";

export async function registerAllRoutes(app: Express) {
  // Firebase Auth middleware setup
  await setupFirebaseAuth(app);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      service: 'CopperBear Electrical API',
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });
  });

  // Comprehensive verification endpoint
  app.get('/api/verify', async (req, res) => {
    const checks: {
      server: { status: string; timestamp: string };
      environment: { status: string; nodeEnv: string; platform: string; nodeVersion: string };
      firebase: { status: string; details: string | null };
      firestore: { status: string; details: string | null };
    } = {
      server: { status: 'ok', timestamp: new Date().toISOString() },
      environment: { 
        status: 'ok',
        nodeEnv: process.env.NODE_ENV || 'development',
        platform: process.platform,
        nodeVersion: process.version
      },
      firebase: { status: 'unknown', details: null },
      firestore: { status: 'unknown', details: null }
    };

    try {
      const admin = await import('firebase-admin');
      if (admin.apps.length > 0) {
        checks.firebase.status = 'ok';
        checks.firebase.details = 'Admin SDK initialized';
        
        try {
          const db = admin.firestore();
          const testDoc = await db.collection('_health_check').doc('test').get();
          checks.firestore.status = 'ok';
          checks.firestore.details = 'Connection successful';
        } catch (firestoreError: any) {
          checks.firestore.status = 'error';
          checks.firestore.details = firestoreError.message;
        }
      } else {
        checks.firebase.status = 'error';
        checks.firebase.details = 'Admin SDK not initialized';
      }
    } catch (error: any) {
      checks.firebase.status = 'error';
      checks.firebase.details = error.message;
    }

    const allOk = Object.values(checks).every(check => 
      typeof check === 'object' && check.status === 'ok'
    );

    res.status(allOk ? 200 : 503).json({
      status: allOk ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date().toISOString()
    });
  });

  // Register domain-specific routes
  registerAuthRoutes(app);
  registerCategoryRoutes(app);
  registerProductRoutes(app);
  registerOrderRoutes(app);
  registerServiceRoutes(app);
  registerCartRoutes(app);
  registerReviewRoutes(app);
  registerWishlistRoutes(app);
  registerAnalyticsRoutes(app);
  registerAdminRoutes(app);
}