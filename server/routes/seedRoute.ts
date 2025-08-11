// Manual seeding route for creating products in Firestore
import type { Express } from "express";
import { FirestoreSeeder } from "../data/firestoreSeeder";

export function registerSeedRoute(app: Express) {
  // Manual seeding endpoint for development
  app.post("/api/admin/seed", async (req, res) => {
    try {
      const forceRefresh = req.query.force === 'true' || req.body.force === true;
      console.log('🌱 Manual seeding requested...');
      
      if (forceRefresh) {
        console.log('🔄 Force refresh requested, clearing existing data...');
        await FirestoreSeeder.clearDatabase();
        await FirestoreSeeder.seedDatabase(true); // Skip data check since we just cleared
      } else {
        await FirestoreSeeder.seedDatabase();
      }
      res.json({ 
        success: true, 
        message: "Database seeded successfully with electrical products" 
      });
    } catch (error) {
      console.error("❌ Seeding error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to seed database", 
        error: (error as Error).message 
      });
    }
  });

  // Check seeding status
  app.get("/api/admin/seed-status", async (req, res) => {
    try {
      const hasData = await FirestoreSeeder.checkIfDataExists();
      res.json({ 
        hasData,
        message: hasData ? "Database already contains data" : "Database is empty, ready for seeding"
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: (error as Error).message 
      });
    }
  });
}