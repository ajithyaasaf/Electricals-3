# CopperBear Electrical - Vercel Git Deployment Guide

## 🚀 Simple Git-Based Deployment

Your application is ready for easy deployment through Vercel's Git integration - just connect and deploy!

### ✅ What's Been Prepared

1. **Vercel Configuration** (`vercel.json`)
   - Automatic build configuration
   - Serverless function routing for API endpoints
   - Proper path rewrites and redirects

2. **Serverless API Functions** (`/api` directory)
   - Ready for automatic deployment
   - All your Express routes converted to serverless functions

3. **Environment Variables** (Need to be set in Vercel dashboard)
   - VITE_FIREBASE_API_KEY
   - VITE_FIREBASE_AUTH_DOMAIN
   - VITE_FIREBASE_PROJECT_ID
   - VITE_FIREBASE_STORAGE_BUCKET
   - VITE_FIREBASE_MESSAGING_SENDER_ID
   - VITE_FIREBASE_APP_ID
   - FIREBASE_SERVICE_ACCOUNT_KEY

## 🚀 Easy Deployment Steps

### Step 1: Go to Vercel Dashboard
1. Visit [vercel.com](https://vercel.com)
2. Sign up/Login with your GitHub/GitLab/Bitbucket account

### Step 2: Import Your Project
1. Click **"New Project"**
2. **Import Git Repository** → Choose your CopperBear project
3. **Framework Preset**: Vite (should auto-detect)
4. **Root Directory**: `.` (leave as default)
5. **Build Command**: `npm run build` (should auto-fill)
6. **Output Directory**: `dist/public` (should auto-fill)

### Step 3: Set Environment Variables
In the deployment configuration:
1. Expand **"Environment Variables"**
2. Add each variable (get values from your current environment):

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