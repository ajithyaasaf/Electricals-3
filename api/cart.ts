import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './_storage';
import { admin } from './_firebase-setup';

// Simple auth middleware for Vercel
async function verifyFirebaseToken(authHeader: string): Promise<string | null> {
  try {
    const token = authHeader.replace('Bearer ', '');
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization required' });
    }

    const userId = await verifyFirebaseToken(authHeader);
    if (!userId) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    if (req.method === 'GET') {
      const cart = await storage.getUserCart(userId);
      return res.json(cart || { id: userId, userId, items: [], totals: {} });
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const cartData = req.body;
      await storage.updateUserCart(userId, cartData);
      const updatedCart = await storage.getUserCart(userId);
      return res.json(updatedCart);
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in cart API:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}