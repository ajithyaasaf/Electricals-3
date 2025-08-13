import { Express } from 'express';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../shared/firestore';

export function registerAdminSetupRoutes(app: Express) {
  // One-time admin setup endpoint
  app.post("/api/admin/setup", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // For security, only allow setting up admin@copperbear.com
      if (email !== 'admin@copperbear.com') {
        return res.status(403).json({ message: "Admin setup only allowed for admin@copperbear.com" });
      }

      console.log('🔧 Setting up admin account...');
      
      // This would typically be done through Firebase Admin SDK
      // For now, provide instructions to set up manually
      res.json({
        message: "Admin account setup instructions provided",
        instructions: [
          "1. Go to Firebase Console > Authentication > Users",
          "2. Click 'Add user'", 
          "3. Enter email: admin@copperbear.com",
          "4. Enter password: (your chosen password)",
          "5. Click 'Add user'",
          "Alternative: Use the admin login form at /admin - it will create the account on first login"
        ]
      });

    } catch (error) {
      console.error("Admin setup error:", error);
      res.status(500).json({ message: "Failed to setup admin account" });
    }
  });
}