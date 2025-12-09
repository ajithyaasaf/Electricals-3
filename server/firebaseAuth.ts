import { Express, Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import admin from 'firebase-admin';

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

// Initialize Firebase Admin SDK with service account
export async function setupFirebaseAuth(app: Express) {
  try {
    const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!rawKey) {
      console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_KEY is missing from environment variables');
      return;
    }

    let serviceAccountKey;
    try {
      serviceAccountKey = JSON.parse(rawKey);
    } catch (e) {
      console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON:', e);
      // Try to handle common Copy-Paste issues (like newlines not being escaped in .env)
      return;
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountKey),
        projectId: serviceAccountKey.project_id
      });
      console.log('🔐 Firebase Admin SDK initialized successfully');
    }

  } catch (error) {
    console.error('❌ Firebase Admin SDK initialization failed:', error);
    throw error;
  }
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
      // Firebase Admin SDK: Verify real ID token from client
      const decodedToken = await admin.auth().verifyIdToken(token);

      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified || false,
        displayName: decodedToken.name || 'User',
        photoURL: decodedToken.picture
      };

      // Auto-create user in Firestore if doesn't exist (using setDoc prevents duplicates)
      if (req.user.uid && req.user.email) {
        try {
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
            console.log(`✅ Created Firebase user: ${req.user.email}`);
          }
        } catch (userCreationError) {
          // Log error but don't fail authentication - user might already exist
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

// Optional authentication middleware for guest cart support
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authorization = req.headers.authorization;

    if (authorization && authorization.startsWith('Bearer ')) {
      const token = authorization.split('Bearer ')[1];

      try {
        // Try to verify the token, but don't fail if it's invalid
        const decodedToken = await admin.auth().verifyIdToken(token);

        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          emailVerified: decodedToken.email_verified || false,
          displayName: decodedToken.name || 'User',
          photoURL: decodedToken.picture
        };

        // Auto-create user in Firestore if doesn't exist (optional auth doesn't log creation)
        if (req.user.uid && req.user.email) {
          try {
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
            }
          } catch (userCreationError) {
            // Silently handle - this is optional auth
          }
        }
      } catch (tokenError) {
        // Token is invalid, but we continue without authentication for guest support
        console.log('Optional auth: Invalid token, continuing as guest');
      }
    }

    // Always continue, regardless of authentication status
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    // Still continue for guest support
    next();
  }
}

// Helper function to get current user from request
export function getCurrentUser(req: AuthenticatedRequest) {
  return req.user;
}