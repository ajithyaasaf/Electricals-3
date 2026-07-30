import type { Express, Request, Response } from 'express';
import admin from 'firebase-admin';
import { storage } from '../../storage';

export function registerAdminSetupRoutes(app: Express) {
  // Setup or Create Admin User API
  app.post("/api/admin/setup", async (req: Request, res: Response) => {
    try {
      const { email = 'admin@godiva.com', password } = req.body;
      
      if (!password) {
        return res.status(400).json({ message: "Password is required to create admin account" });
      }

      if (email !== 'admin@godiva.com' && email !== 'admin@copperbear.com') {
        return res.status(403).json({ message: "Admin email must be admin@godiva.com or admin@copperbear.com" });
      }

      let uid: string;
      try {
        const existingUser = await admin.auth().getUserByEmail(email);
        uid = existingUser.uid;
        // Update password if provided
        await admin.auth().updateUser(uid, { password });
        console.log(`🔐 Admin password updated for ${email}`);
      } catch (notFound) {
        // User does not exist, create in Firebase Auth
        const newUser = await admin.auth().createUser({
          email,
          password,
          displayName: "System Admin",
          emailVerified: true,
        });
        uid = newUser.uid;
        console.log(`✨ New Admin account created in Firebase: ${email}`);
      }

      // Ensure user document exists in Firestore with isAdmin: true
      const existingDbUser = await storage.getUserById(uid);
      if (!existingDbUser) {
        await storage.createUser({
          id: uid,
          email,
          firstName: "System",
          lastName: "Admin",
          isAdmin: true,
        });
      } else {
        await storage.updateUser(uid, { isAdmin: true });
      }

      res.json({
        success: true,
        message: `Admin user ${email} configured successfully! You can now log in at /admin.`,
        email,
      });
    } catch (error: any) {
      console.error("Admin setup error:", error);
      res.status(500).json({ message: "Failed to setup admin account", error: error.message });
    }
  });
}