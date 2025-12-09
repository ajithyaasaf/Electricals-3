# Firebase Setup Instructions - URGENT

## 🚨 Fix the "auth/unauthorized-domain" Error

When you click the Sign In button and get this error, follow these steps:

### Quick Fix Steps:

1. **Open Firebase Console**: Go to https://console.firebase.google.com/
2. **Select Your Project**: Choose the project that matches your `VITE_FIREBASE_PROJECT_ID`
3. **Navigate to Authentication**:
   - Click "Authentication" in the left sidebar
   - Click "Settings" tab
   - Scroll to "Authorized domains" section
4. **Add Your Domain**: 
   - Click "Add domain"
   - Add your current Replit domain (copy from browser URL)
   - Example: `abc123-xyz.replit.app` or similar
   - Also add `localhost` for local testing
5. **Save**: Click "Save" or "Add"

### Complete Setup (if not done):

#### 1. Enable Google Sign-In
- In Authentication, go to "Sign-in method" tab
- Click "Google" provider
- Enable it and click "Save"

#### 2. Get Your Config Values
- Go to Project Settings (gear icon)
- Scroll to "Your apps" section
- Copy these values (already configured as secrets):
  - `apiKey` → `VITE_FIREBASE_API_KEY`
  - `projectId` → `VITE_FIREBASE_PROJECT_ID` 
  - `appId` → `VITE_FIREBASE_APP_ID`

### Why This Happens
Firebase blocks authentication from unauthorized domains for security. Your Replit domain must be explicitly allowed in the Firebase console.

### After Adding Domain
- Refresh your application
- Click "Sign In" again
- Google authentication should work properly