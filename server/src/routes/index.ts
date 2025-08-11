import type { Express } from "express";
import { registerAuthRoutes } from "./auth";
import { registerProductRoutes } from "./products";
import { registerCategoryRoutes } from "./categories";
import { registerOrderRoutes } from "./orders";
import { registerServiceRoutes } from "./services";
import { registerAdminRoutes } from "./admin";

export function registerAllRoutes(app: Express) {
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      service: 'CopperBear Electrical API'
    });
  });

  // Register domain-specific routes
  registerAuthRoutes(app);
  registerCategoryRoutes(app);
  registerProductRoutes(app);
  registerOrderRoutes(app);
  registerServiceRoutes(app);
  registerAdminRoutes(app);
}