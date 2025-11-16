import express from "express";
import path from "path";
import { registerAllRoutes } from "../server/src/routes/index";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from dist/public
app.use(express.static(path.join(process.cwd(), "dist/public")));

// Initialize routes once
let initialized = false;
const initApp = async () => {
  if (!initialized) {
    await registerAllRoutes(app);
    
    // Serve index.html for all non-API routes
    app.use("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist/public/index.html"));
    });
    
    initialized = true;
  }
};

// Vercel serverless handler
export default async (req: any, res: any) => {
  await initApp();
  return app(req, res);
};
