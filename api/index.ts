import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Health check endpoint
  if (req.url === '/api/health') {
    return res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      service: 'CopperBear Electrical API'
    });
  }

  // Default response for root API
  res.json({ message: 'CopperBear Electrical API - Please use specific endpoints' });
}