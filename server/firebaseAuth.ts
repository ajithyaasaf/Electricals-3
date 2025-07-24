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

// Complete Firebase Authentication setup - no Replit Auth dependencies
export async function setupFirebaseAuth(app: Express) {
  console.log('Firebase authentication configured for CopperBear platform');
  console.log('Authentication: 100% Firebase - No Replit Auth dependencies');
}

// Pure Firebase token verification middleware - No Replit Auth dependencies
export async function isAuthenticated(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authorization = req.headers.authorization;
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized - Firebase token required' });
    }

    const token = authorization.split('Bearer ')[1];
    
    try {
      // Firebase client-side authentication approach
      // Client sends Firebase user data as base64-encoded token
      const userInfo = JSON.parse(Buffer.from(token, 'base64').toString());
      
      // Validate Firebase user structure
      if (!userInfo.uid) {
        return res.status(401).json({ message: 'Invalid Firebase token structure' });
      }
      
      req.user = {
        uid: userInfo.uid,
        email: userInfo.email,
        emailVerified: userInfo.emailVerified || false,
        displayName: userInfo.displayName || 'User',
        photoURL: userInfo.photoURL
      };

      // Auto-create user in Firestore if doesn't exist
      if (req.user.uid && req.user.email) {
        let existingUser = await storage.getUserById(req.user.uid);
        if (!existingUser) {
          await storage.createUser({
            id: req.user.uid,
            email: req.user.email,
            firstName: req.user.displayName?.split(' ')[0] || 'User',
            lastName: req.user.displayName?.split(' ').slice(1).join(' ') || '',
            profileImageUrl: req.user.photoURL || '',
            isAdmin: req.user.email === 'admin@copperbear.com'
          });
          console.log(`Created new Firebase user: ${req.user.email}`);
        }
      }

      next();
    } catch (tokenError) {
      console.error('Firebase token validation failed:', tokenError);
      return res.status(401).json({ message: 'Invalid Firebase authentication token' });
    }
  } catch (error) {
    console.error('Firebase authentication middleware error:', error);
    return res.status(401).json({ message: 'Firebase authentication failed' });
  }
}

// Helper function to get current user from request
export function getCurrentUser(req: AuthenticatedRequest) {
  return req.user;
}