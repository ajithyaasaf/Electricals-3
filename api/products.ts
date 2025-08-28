import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './_storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const { featured, category, search } = req.query;
      
      let products;
      if (featured === 'true') {
        products = await storage.getFeaturedProducts();
      } else if (category) {
        // For category-based filtering, you'll need to extend storage
        products = await storage.getAllProducts();
      } else if (search) {
        // For search, you'll need to extend storage
        products = await storage.getAllProducts();
      } else {
        products = await storage.getAllProducts();
      }
      
      return res.json({ products });
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in products API:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}