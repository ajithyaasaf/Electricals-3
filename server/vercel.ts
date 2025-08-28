import express, { type Request, Response, NextFunction } from "express";
import { registerAllRoutes } from "./src/routes/index";
import { serveStatic, log } from "./vite";

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
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

      log(logLine);
    }
  });

  next();
});

// Initialize the app
let isInitialized = false;

async function initializeApp() {
  if (isInitialized) return app;
  
  try {
    console.log('🔍 Firebase configuration ready');
    console.log('📡 Use POST /api/admin/seed to create products in database');

    // Register all organized routes (includes Firebase Auth setup)  
    await registerAllRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
    });

    // Serve static files in production
    serveStatic(app);
    
    isInitialized = true;
    console.log('✅ Vercel app initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize app:', error);
    throw error;
  }
  
  return app;
}

// For Vercel serverless function
export default async function handler(req: Request, res: Response) {
  try {
    const app = await initializeApp();
    return app(req, res);
  } catch (error) {
    console.error('Vercel handler error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}