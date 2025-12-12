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
import { registerSiteContentRoutes } from "./site-content";
import { registerAddressRoutes } from "./addresses";
import { registerUploadRoutes } from "./upload";
import { setupFirebaseAuth } from "../../firebaseAuth";

export async function registerAllRoutes(app: Express) {
  // Firebase Auth middleware setup
  await setupFirebaseAuth(app);

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
  registerCartRoutes(app);
  registerReviewRoutes(app);
  registerWishlistRoutes(app);
  registerAnalyticsRoutes(app);
  registerSiteContentRoutes(app);  // CMS content management
  registerAddressRoutes(app);
  registerUploadRoutes(app);  // Image upload routes
  registerAdminRoutes(app);
}