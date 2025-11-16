import { type Express, type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

export function setupSecurityMiddleware(app: Express) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  const allowedOrigins = [
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    process.env.VERCEL_BRANCH_URL ? `https://${process.env.VERCEL_BRANCH_URL}` : null,
    process.env.PRODUCTION_URL || null,
    isDevelopment ? 'http://localhost:5000' : null,
    isDevelopment ? 'http://localhost:3000' : null,
    isDevelopment ? 'http://127.0.0.1:5000' : null,
  ].filter(Boolean) as string[];

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const isAllowed = allowedOrigins.some(allowed => 
        origin.startsWith(allowed)
      );

      if (isAllowed || isDevelopment) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400
  }));

  app.use(helmet({
    contentSecurityPolicy: isDevelopment ? false : {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        connectSrc: ["'self'", 'https://firestore.googleapis.com', 'https://*.googleapis.com'],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: isProduction ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }));

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDevelopment ? 1000 : 100,
    message: { 
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      return req.path === '/api/health' || req.path === '/api/verify';
    },
    handler: (req: Request, res: Response) => {
      console.warn(`⚠️ Rate limit exceeded for IP: ${req.ip} on ${req.path}`);
      res.status(429).json({
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
      });
    }
  });

  app.use('/api/', apiLimiter);

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDevelopment ? 100 : 5,
    message: {
      message: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: (req: Request, res: Response) => {
      console.warn(`⚠️ Auth rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        message: 'Too many authentication attempts, please try again later.',
        retryAfter: '15 minutes'
      });
    }
  });

  app.use('/api/auth/', authLimiter);

  const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: isDevelopment ? 50 : 10,
    message: {
      message: 'Too many requests to this sensitive endpoint.',
      retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      console.warn(`⚠️ Strict rate limit exceeded for IP: ${req.ip} on ${req.path}`);
      res.status(429).json({
        message: 'Too many requests to this sensitive endpoint.',
        retryAfter: '1 hour'
      });
    }
  });

  app.use('/api/admin/', strictLimiter);

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    if (isProduction) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    
    next();
  });

  console.log('🔒 Security middleware initialized');
  console.log(`📍 Allowed origins: ${allowedOrigins.join(', ')}`);
  console.log(`🛡️ Rate limiting: ${isDevelopment ? 'Development mode (relaxed)' : 'Production mode (strict)'}`);
}
