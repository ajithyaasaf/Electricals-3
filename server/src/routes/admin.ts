import type { Express } from "express";
import { FirestoreSeeder } from "../../data/firestoreSeeder";

export function registerAdminRoutes(app: Express) {
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



  // Placeholder image endpoint - using teal theme colors
  app.get("/api/placeholder/:width/:height", (req, res) => {
    const { width, height } = req.params;
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="hsl(187, 94%, 97%)"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="hsl(187, 94%, 25%)" text-anchor="middle" dy=".3em">
          ${width} × ${height}
        </text>
      </svg>
    `;
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.send(svg);
  });
}