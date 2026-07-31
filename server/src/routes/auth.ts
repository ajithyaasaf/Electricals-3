import type { Express } from "express";
import { storage } from "../../storage";
import { isAuthenticated } from "../../firebaseAuth";
import { cache } from "../lib/cache";

export function registerAuthRoutes(app: Express) {
  // Get current user (cached 30s)
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const cacheKey = `users:id:${userId}`;
      const cached = cache.get<any>(cacheKey);
      if (cached) return res.json(cached);

      const user = await storage.getUserById(userId);
      if (user) {
        cache.set(cacheKey, user, 30_000);
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.put('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const userData = req.body;

      // Don't allow users to modify admin status through this endpoint
      delete userData.isAdmin;

      await storage.updateUser(userId, userData);
      cache.invalidateByPrefix(`users:id:${userId}`);

      const updatedUser = await storage.getUserById(userId);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Logout (clear session)
  app.post('/api/auth/logout', (req, res) => {
    // Clear session if using session-based auth
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to logout" });
        }
        res.json({ message: "Logged out successfully" });
      });
    } else {
      res.json({ message: "Logged out successfully" });
    }
  });
}