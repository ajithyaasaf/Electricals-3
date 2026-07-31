import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerAllRoutes } from "./src/routes/index";
import { setupVite, serveStatic, log } from "./vite";
import { FirestoreSeeder } from "./data/firestoreSeeder";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rate Limiter & Security Headers Middleware
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 400;
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();

// Periodic cleanup to prevent memory leaks from expired IP records
setInterval(() => {
  const now = Date.now();
  Array.from(ipRequestCounts.entries()).forEach(([ip, record]) => {
    if (now > record.resetTime) {
      ipRequestCounts.delete(ip);
    }
  });
}, 30 * 60 * 1000);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");

  if (req.path.startsWith("/api")) {
    const ip = ((req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown").split(",")[0].trim();
    const now = Date.now();
    const clientRecord = ipRequestCounts.get(ip);

    if (!clientRecord || now > clientRecord.resetTime) {
      ipRequestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    } else {
      clientRecord.count += 1;
      if (clientRecord.count > MAX_REQUESTS_PER_WINDOW) {
        return res.status(429).json({
          message: "Too many requests from this IP, please try again later."
        });
      }
    }
  }
  next();
});

// Serve attached assets as static files
app.use('/attached_assets', express.static('attached_assets'));

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

(async () => {
  // Firebase is configured - seeding will be done via API endpoint
  console.log('🔍 Firebase configuration ready');
  console.log('📡 Use POST /api/admin/seed to create products in database');

  // Register all organized routes (includes Firebase Auth setup)  
  await registerAllRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Create HTTP server and setup Vite
  const { createServer } = await import("http");
  const server = createServer(app);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });

  // Start Cron Jobs
  try {
    const { expireUnpaidOrders } = await import("./adminFirestoreService");

    // Run immediately on startup to check
    expireUnpaidOrders().then(count => {
      if (count > 0) log(`[CRON] Expired ${count} stale orders on startup.`);
    }).catch(err => console.error("[CRON] Startup check failed:", err));

    // Schedule hourly check (3600000 ms)
    setInterval(() => {
      expireUnpaidOrders().then(count => {
        if (count > 0) log(`[CRON] Expired ${count} stale orders.`);
      }).catch(err => console.error("[CRON] Scheduled check failed:", err));
    }, 3600000);

    log("⏰ Cron jobs scheduled (Hourly expiry check)");
  } catch (err) {
    console.error("Failed to start cron jobs:", err);
  }

})();
