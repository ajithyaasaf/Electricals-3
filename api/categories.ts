import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './_storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const categories = await storage.getAllCategories();
      return res.json(categories);
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in categories API:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}