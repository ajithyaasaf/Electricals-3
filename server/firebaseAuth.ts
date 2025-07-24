import { Express, Request, Response, NextFunction } from 'express';
import { storage } from './storage';

// Firebase Admin interface for middleware
interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    emailVerified?: boolean;
    displayName?: string;
    photoURL?: string;
  };
}

// Setup Firebase Auth middleware (client-side approach)
export async function setupFirebaseAuth(app: Express) {
  console.log('Firebase client-side authentication configured');
}

// Middleware to verify Firebase tokens
export async function isAuthenticated(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authorization = req.headers.authorization;
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authorization.split('Bearer ')[1];
    
    // Simplified client-side token approach for development
    // In production, use Firebase Admin SDK for server-side token verification
    try {
      // For development, we expect the client to send user data in the Authorization header
      // Format: Bearer {base64-encoded-user-data}
      const userInfo = JSON.parse(Buffer.from(token, 'base64').toString());
      
      req.user = {
        uid: userInfo.uid || userInfo.sub || userInfo.user_id,
        email: userInfo.email,
        emailVerified: userInfo.emailVerified || userInfo.email_verified,
        displayName: userInfo.displayName || userInfo.name,
        photoURL: userInfo.photoURL || userInfo.picture
      };

      // Ensure user exists in our database
      if (req.user.uid) {
        let user = await storage.getUserById(req.user.uid);
        if (!user && req.user.email) {
          // Create user if doesn't exist
          await storage.createUser({
            id: req.user.uid,
            email: req.user.email,
            firstName: req.user.displayName?.split(' ')[0] || '',
            lastName: req.user.displayName?.split(' ').slice(1).join(' ') || '',
            profileImageUrl: req.user.photoURL,
            isAdmin: req.user.email === 'admin@copperbear.com'
          });
        }
      }

      next();
    } catch (error) {
      console.error('Token validation error:', error);
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
}

// Helper function to get current user from request
export function getCurrentUser(req: AuthenticatedRequest) {
  return req.user;
}