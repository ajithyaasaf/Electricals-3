// Shared Firebase setup for Vercel serverless functions
import * as admin from 'firebase-admin';

let isFirebaseInitialized = false;

export function initializeFirebaseAdmin() {
  if (isFirebaseInitialized && admin.apps.length > 0) {
    return admin.app();
  }

  try {
    const serviceAccountKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountKey),
        projectId: serviceAccountKey.project_id
      });
    }

    isFirebaseInitialized = true;
    console.log('🔐 Firebase Admin SDK initialized');
    return admin.app();
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
    throw new Error('Failed to initialize Firebase Admin SDK');
  }
}

export { admin };