# Vercel Deployment Guide (Simple)

## Key Difference: Render vs Vercel

**Render**: Runs your full Express server 24/7 (easy, already working ✅)

**Vercel**: Uses serverless functions (needs special setup)

## Quick Fix for Vercel

### 1. Commit and Push Your Changes
```bash
git add .
git commit -m "Fix: Product images + Vercel serverless setup"
git push
```

### 2. Set Environment Variables in Vercel Dashboard
Go to your Vercel project → Settings → Environment Variables and add:

**Firebase Config (Frontend)**
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

**Firebase Admin (Backend)**
- `FIREBASE_SERVICE_ACCOUNT_KEY` (the entire JSON as a string)

### 3. Redeploy
Vercel will auto-deploy when you push, or click "Redeploy" in the dashboard.

## What's Different?

### Render (Current, Working)
- Full Node.js server running 24/7
- Express serves both API and frontend
- Simple and reliable

### Vercel (Needs Setup)
- Serverless functions (API runs on-demand)
- Static files served from CDN
- Faster cold starts, more complex setup

## Files Created
- `vercel.json` - Tells Vercel how to build and route
- `api/index.ts` - Serverless function that runs your Express app

## Recommendation

Since **Render is working perfectly**, you have two options:

1. **Use Render only** - Simple, already works, no changes needed
2. **Use both** - Keep Render as primary, use Vercel for testing

The product images will work on BOTH platforms once you commit and push the changes (images are now in `client/public/products/`).
