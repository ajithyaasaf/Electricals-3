import type { Express } from "express";
import { FirestoreSeeder } from "../../data/firestoreSeeder";

export function registerAdminRoutes(app: Express) {
  // Manual seeding endpoint for development
  app.post("/api/admin/seed", async (req, res) => {
    try {
      const forceRefresh = req.query.force === 'true' || req.body.force === true;
      const clearUsers = req.query.clearUsers === 'true' || req.body.clearUsers === true;
      console.log('🌱 Manual seeding requested...');
      
      // Handle clearing users collection specifically
      if (clearUsers) {
        console.log('🗑️ Clearing users collection...');
        const { db } = await import("@shared/firestore");
        const { collection, getDocs, writeBatch } = await import("firebase/firestore");
        
        // Get all users from Firestore directly
        const usersSnapshot = await getDocs(collection(db, 'users'));
        console.log(`📊 Found ${usersSnapshot.size} users to delete`);
        
        if (usersSnapshot.size > 0) {
          // Use batch writes to delete users in batches of 500
          const batchSize = 500;
          let deletedCount = 0;
          const docs = usersSnapshot.docs;
          
          for (let i = 0; i < docs.length; i += batchSize) {
            const batch = writeBatch(db);
            const batchDocs = docs.slice(i, i + batchSize);
            
            batchDocs.forEach((doc) => {
              batch.delete(doc.ref);
            });
            
            await batch.commit();
            deletedCount += batchDocs.length;
            console.log(`🗑️ Deleted batch ${Math.ceil((i + 1) / batchSize)} - ${deletedCount} users deleted so far`);
          }
          
          console.log(`✅ Successfully deleted ${deletedCount} users`);
          
          return res.json({ 
            success: true, 
            message: `Successfully cleared ${deletedCount} users from the collection`,
            deletedCount
          });
        } else {
          return res.json({ 
            success: true, 
            message: "Users collection is already empty",
            deletedCount: 0
          });
        }
      }
      
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

  // Clear users collection
  app.post("/api/admin/clear-users", async (req, res) => {
    try {
      console.log('🗑️ Clearing users collection...');
      const { adminDb } = await import("../../firebaseAuth");
      
      // Get all users
      const usersSnapshot = await adminDb.collection('users').get();
      console.log(`📊 Found ${usersSnapshot.size} users to delete`);
      
      if (usersSnapshot.empty) {
        return res.json({ 
          success: true, 
          message: "Users collection is already empty",
          deletedCount: 0
        });
      }
      
      // Delete all users in batches (max 500 operations per batch)
      const batchSize = 500;
      let deletedCount = 0;
      
      for (let i = 0; i < usersSnapshot.docs.length; i += batchSize) {
        const batch = adminDb.batch();
        const batchDocs = usersSnapshot.docs.slice(i, i + batchSize);
        
        batchDocs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
        deletedCount += batchDocs.length;
        console.log(`🗑️ Deleted batch ${Math.ceil((i + 1) / batchSize)} - ${deletedCount} users deleted so far`);
      }
      
      console.log(`✅ Successfully deleted ${deletedCount} users`);
      
      res.json({ 
        success: true, 
        message: `Successfully cleared ${deletedCount} users from the collection`,
        deletedCount
      });
    } catch (error) {
      console.error("❌ Error clearing users collection:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to clear users collection", 
        error: (error as Error).message 
      });
    }
  });

  // Placeholder image endpoint
  app.get("/api/placeholder/:width/:height", (req, res) => {
    const { width, height } = req.params;
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#6b7280" text-anchor="middle" dy=".3em">
          ${width} × ${height}
        </text>
      </svg>
    `;
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.send(svg);
  });
}