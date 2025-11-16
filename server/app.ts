import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { registerAllRoutes } from "./src/routes/index";
import { setupSecurityMiddleware } from "./middleware/security";

export async function createApp(): Promise<Express> {
  const app = express();
  
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: false, limit: '10mb' }));

  setupSecurityMiddleware(app);

  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        console.log(logLine);
      }
    });

    next();
  });

  console.log('🔍 Firebase configuration ready');
  console.log('📡 Use POST /api/admin/seed to create products in database');

  await registerAllRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    console.error('❌ Error:', {
      status,
      message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    res.status(status).json({ 
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  });

  return app;
}
