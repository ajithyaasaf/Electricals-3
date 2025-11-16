# Deployment Guide - CopperBear Electrical

This guide covers deploying the CopperBear Electrical e-commerce platform to Vercel with Firebase/Firestore backend.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables Setup](#environment-variables-setup)
3. [Vercel Deployment](#vercel-deployment)
4. [Firebase Configuration](#firebase-configuration)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Troubleshooting](#troubleshooting)
7. [Production Checklist](#production-checklist)

---

## Prerequisites

- Vercel account ([sign up here](https://vercel.com))
- Firebase project with Firestore enabled
- Git repository connected to Vercel
- Firebase service account with admin privileges

---

## Environment Variables Setup

### 1. Frontend Variables (Build-time)

These variables are embedded into the static frontend bundle during build. They MUST be set in Vercel before deployment.

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

**Where to find these:**
- Firebase Console → Project Settings → General → Your apps → Web app

### 2. Backend Variables (Runtime)

These variables are used by the Node.js serverless API.

```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

**Critical:** The service account key must be formatted as a **single-line JSON string**. 

**Where to get it:**
1. Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file
4. **Format it correctly** (see below)

#### Formatting the Service Account Key

The private key contains line breaks that need to be escaped. Here's how to format it:

**Option 1: Manual Formatting**
```json
{"type":"service_account","project_id":"your-project","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk@your-project.iam.gserviceaccount.com",...}
```

**Option 2: Using Node.js** (Recommended)
```javascript
// Create a file format-key.js
const fs = require('fs');
const key = JSON.parse(fs.readFileSync('./service-account.json', 'utf8'));
console.log(JSON.stringify(key));
```

Run: `node format-key.js`

Copy the output and paste it as the `FIREBASE_SERVICE_ACCOUNT_KEY` value in Vercel.

---

## Vercel Deployment

### Step 1: Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your Git repository
4. Select the repository containing this application

### Step 2: Configure Build Settings

Vercel should auto-detect the settings, but verify:

- **Framework Preset:** Other
- **Build Command:** `npm run build`
- **Output Directory:** `dist/public`
- **Install Command:** `npm install`
- **Development Command:** `npm run dev`

### Step 3: Add Environment Variables

1. In Project Settings → Environment Variables
2. Add ALL variables from the `.env.example` file
3. **Important:** Set them for **both Production and Preview** environments
4. Click "Save"

### Step 4: Deploy

1. Click "Deploy"
2. Wait for the build to complete (2-5 minutes)
3. Vercel will provide a URL: `https://your-app.vercel.app`

---

## Firebase Configuration

### 1. Add Authorized Domains

**Critical:** Firebase Auth will not work without this step.

1. Go to Firebase Console
2. Navigate to: **Authentication → Settings → Authorized domains**
3. Click "Add domain"
4. Add your Vercel domain: `your-app.vercel.app`
5. If using custom domain, add that too: `yourdomain.com`
6. Click "Save"

### 2. Firestore Security Rules

Ensure your Firestore security rules allow authenticated reads/writes:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products - public read, admin write
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Categories - public read, admin write
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Cart - user-specific read/write
    match /cartItems/{cartItemId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Wishlist - user-specific read/write
    match /wishlistItems/{wishlistItemId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Orders - user-specific read, restricted write
    match /orders/{orderId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

### 3. Firestore Indexes

For optimal performance, create these composite indexes:

1. Firebase Console → Firestore Database → Indexes
2. Add indexes for:
   - `products`: `categoryId` (Ascending) + `createdAt` (Descending)
   - `products`: `featured` (Ascending) + `createdAt` (Descending)
   - `cartItems`: `userId` (Ascending) + `createdAt` (Descending)
   - `wishlistItems`: `userId` (Ascending) + `createdAt` (Descending)

---

## Post-Deployment Verification

### 1. Health Check

Visit: `https://your-app.vercel.app/api/health`

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-XX-XXTXX:XX:XX.XXXZ",
  "service": "CopperBear Electrical API",
  "environment": "production",
  "version": "1.0.0"
}
```

### 2. System Verification

Visit: `https://your-app.vercel.app/api/verify`

Expected response:
```json
{
  "status": "healthy",
  "checks": {
    "server": { "status": "ok", ... },
    "environment": { "status": "ok", ... },
    "firebase": { "status": "ok", "details": "Admin SDK initialized" },
    "firestore": { "status": "ok", "details": "Connection successful" }
  }
}
```

**If any check shows "error":**
- Check Vercel function logs
- Verify environment variables
- Review Firebase service account permissions

### 3. Seed Database (First Time Only)

**Important:** This creates initial product data in Firestore.

```bash
curl -X POST https://your-app.vercel.app/api/admin/seed \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "message": "Database seeded successfully",
  "stats": {
    "products": 50,
    "categories": 8
  }
}
```

### 4. Test Frontend

1. Visit: `https://your-app.vercel.app`
2. Verify products load on homepage
3. Test user authentication (sign in/sign up)
4. Add items to cart
5. Add items to wishlist
6. Test search and filtering

---

## Troubleshooting

### Problem: Products Not Loading

**Symptoms:** Empty product grid, "No products found" message

**Solutions:**

1. **Check API Endpoint:**
   ```bash
   curl https://your-app.vercel.app/api/products
   ```
   - If returns `[]`: Database needs seeding (run seed endpoint)
   - If returns HTML: API routing issue (check vercel.json)
   - If returns error: Check Firebase connection

2. **Verify Environment Variables:**
   - Vercel Dashboard → Settings → Environment Variables
   - Ensure ALL `VITE_*` variables are set
   - Redeploy after adding variables

3. **Check Firebase Admin SDK:**
   - Visit `/api/verify`
   - Look for `firebase.status: "ok"`
   - If error, check `FIREBASE_SERVICE_ACCOUNT_KEY` formatting

4. **Check Vercel Function Logs:**
   - Vercel Dashboard → Deployments → [Latest] → Functions
   - Look for Firebase initialization errors
   - Common: "Cannot parse JSON" = malformed service account key

### Problem: Authentication Not Working

**Symptoms:** Can't sign in, "Firebase: Error (auth/unauthorized-domain)"

**Solutions:**

1. **Add Domain to Firebase:**
   - Firebase Console → Authentication → Settings → Authorized domains
   - Add: `your-app.vercel.app`
   - Add any custom domains

2. **Verify Frontend Config:**
   - Check browser console for errors
   - Verify `VITE_FIREBASE_*` variables in build
   - Look at built JS file: `view-source:https://your-app.vercel.app/assets/index-*.js`
   - Search for `firebaseConfig` - should show your values, not `undefined`

3. **Check Auth Domain:**
   - `VITE_FIREBASE_AUTH_DOMAIN` must match Firebase project
   - Usually: `your-project-id.firebaseapp.com`

### Problem: CORS Errors

**Symptoms:** Browser console shows "CORS policy" errors

**Solutions:**

1. **Verify Origin:**
   - The security middleware automatically allows Vercel domains
   - Check server logs for "CORS blocked" warnings

2. **Custom Domain:**
   - If using custom domain, add `PRODUCTION_URL` environment variable
   - Value: `https://yourdomain.com`
   - Redeploy

3. **Check Headers:**
   - Use browser DevTools → Network tab
   - Look at response headers for `Access-Control-Allow-Origin`

### Problem: Cart/Wishlist Data Not Persisting

**Symptoms:** Cart empties after refresh, wishlist items disappear

**Solutions:**

1. **Check Authentication:**
   - User must be signed in for data persistence
   - Guest cart uses localStorage (temporary)
   - After sign-in, guest cart should migrate

2. **Verify Firestore Rules:**
   - Ensure cart/wishlist rules allow user access
   - Check Firebase Console → Firestore → Rules

3. **Check API Responses:**
   - Browser DevTools → Network → `/api/cart`
   - Look for 403/401 errors = permission issue
   - Look for 404 errors = routing issue

### Problem: "Too Many Requests" Errors

**Symptoms:** 429 status code, rate limit messages

**Solutions:**

1. **Production Rate Limits:**
   - API endpoints: 100 requests per 15 minutes per IP
   - Auth endpoints: 5 attempts per 15 minutes per IP
   - Admin endpoints: 10 requests per hour per IP

2. **If Legitimate Traffic:**
   - Contact support to discuss dedicated infrastructure
   - Consider caching strategies
   - Optimize frontend to reduce API calls

---

## Production Checklist

Before going live, verify:

### Security
- [ ] All environment variables set in Vercel
- [ ] Firebase service account key is private (not committed to git)
- [ ] Firestore security rules are restrictive
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] Rate limiting configured
- [ ] Admin endpoints protected

### Performance
- [ ] Static assets cached (CDN automatic on Vercel)
- [ ] Firestore indexes created
- [ ] Images optimized
- [ ] Frontend bundle size checked
- [ ] API response times acceptable

### Functionality
- [ ] Products load correctly
- [ ] Search works
- [ ] Categories filter properly
- [ ] User authentication works
- [ ] Cart operations succeed
- [ ] Wishlist operations succeed
- [ ] Order placement works
- [ ] Email notifications sent (if configured)

### Monitoring
- [ ] Vercel Analytics enabled
- [ ] Error tracking configured
- [ ] Firebase usage quotas checked
- [ ] Backup strategy in place

### Documentation
- [ ] README updated
- [ ] API documentation available
- [ ] Support contact information added
- [ ] Privacy policy and terms of service published

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Next Steps After Deployment](./README.md#production-deployment)

---

## Support

For deployment issues:
1. Check Vercel function logs
2. Visit `/api/verify` to diagnose
3. Review this troubleshooting guide
4. Check Firebase Console for errors

**Need Help?** Create an issue in the repository with:
- Error messages from Vercel logs
- Response from `/api/verify`
- Browser console errors
- Steps to reproduce the problem
