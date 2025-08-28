# CopperBear Electrical - Vercel Deployment Guide

## 🚀 Ready for Deployment

Your application has been carefully prepared for Vercel deployment with the following architecture:

### ✅ What's Been Prepared

1. **Vercel Configuration** (`vercel.json`)
   - Static build setup for React frontend
   - Serverless function routing for API endpoints
   - Proper path rewrites and redirects

2. **Serverless API Functions** (`/api` directory)
   - `index.ts` - Health check and root endpoint
   - `products.ts` - Product management API
   - `categories.ts` - Category management API  
   - `services.ts` - Service management API
   - `cart.ts` - Shopping cart API with authentication
   - `wishlist.ts` - Wishlist management API
   - `_firebase-setup.ts` - Firebase Admin SDK configuration
   - `_storage.ts` - Firestore database service

3. **Environment Variables** (Already configured)
   - ✅ VITE_FIREBASE_API_KEY
   - ✅ VITE_FIREBASE_AUTH_DOMAIN
   - ✅ VITE_FIREBASE_PROJECT_ID
   - ✅ VITE_FIREBASE_STORAGE_BUCKET
   - ✅ VITE_FIREBASE_MESSAGING_SENDER_ID
   - ✅ VITE_FIREBASE_APP_ID
   - ✅ FIREBASE_SERVICE_ACCOUNT_KEY

## 🔧 Pre-Deployment Steps

### 1. Install Vercel CLI (if not already installed)
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Build Test (Optional - Verify locally)
```bash
npm run build:client
```

## 🚀 Deployment Steps

### Step 1: Initialize Vercel Project
```bash
vercel
```
When prompted:
- **Set up and deploy?** → `Y`
- **Which scope?** → Choose your team/personal account
- **Link to existing project?** → `N` (for new deployment)
- **Project name?** → `copperbear-electrical`
- **Directory?** → `.` (current directory)
- **Want to override settings?** → `N`

### Step 2: Configure Environment Variables
In your Vercel dashboard or via CLI:

```bash
# Client-side Firebase config
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN  
vercel env add VITE_FIREBASE_PROJECT_ID
vercel env add VITE_FIREBASE_STORAGE_BUCKET
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
vercel env add VITE_FIREBASE_APP_ID

# Server-side Firebase config
vercel env add FIREBASE_SERVICE_ACCOUNT_KEY
```

### Step 3: Deploy to Production
```bash
vercel --prod
```

## 🔍 Post-Deployment Verification

After deployment, verify these endpoints:

1. **Frontend**: `https://your-app.vercel.app`
2. **Health Check**: `https://your-app.vercel.app/api/index`
3. **Products API**: `https://your-app.vercel.app/api/products`
4. **Categories API**: `https://your-app.vercel.app/api/categories`
5. **Services API**: `https://your-app.vercel.app/api/services`

## ⚠️ Important Notes

### Firebase Configuration
- Your production Firestore database is already connected
- All authentication will work seamlessly
- Cart and wishlist functionality preserved

### API Limitations
- Some complex routes from your original Express server may need additional setup
- Real-time features might need WebSocket configuration
- Admin routes with complex authentication may need refinement

### Performance
- Serverless functions have cold start times
- Consider upgrading to Vercel Pro for better performance
- Static assets are globally cached via CDN

## 🔧 Troubleshooting

### Common Issues:

1. **Build Errors**
   - Check that all dependencies are in `package.json`
   - Verify environment variables are set correctly

2. **API Errors**
   - Ensure Firebase Service Account Key is valid JSON
   - Check Firestore security rules allow server access

3. **Frontend Issues**
   - Verify client-side Firebase config variables
   - Check that build output directory is correct

### Getting Help:
- Check Vercel function logs in dashboard
- Use `vercel logs` command for debugging
- Monitor Firebase console for database errors

## 📊 Architecture Summary

**Before (Replit)**:
- Single Express server on port 5000
- Development with Vite middleware
- Unified backend/frontend

**After (Vercel)**:
- Static frontend deployed to global CDN
- Individual serverless functions for each API route
- Production-ready with automatic scaling

Your application architecture has been carefully preserved while optimizing for Vercel's serverless platform!