import { createApp } from '../dist/index.js';

let appPromise;

async function getApp() {
  if (!appPromise) {
    console.log('🔧 Initializing serverless function...');
    appPromise = createApp();
    const app = await appPromise;
    console.log('✅ Express app initialized successfully');
    return app;
  }
  return appPromise;
}

export default async function handler(req, res) {
  try {
    const app = await getApp();
    
    return new Promise((resolve, reject) => {
      app(req, res, (err) => {
        if (err) {
          console.error('❌ Handler error:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  } catch (error) {
    console.error('❌ Fatal error initializing app:', error);
    res.status(500).json({ 
      message: 'Server initialization error',
      error: error.message 
    });
  }
}
