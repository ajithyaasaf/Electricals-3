import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './_storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const services = await storage.getAllServices();
      return res.json(services);
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in services API:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}