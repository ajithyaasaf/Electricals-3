# Firebase Setup Instructions

## Required Configuration Steps

To make Firebase authentication work with your CopperBear application, you need to authorize the domain in the Firebase console:

### 1. Access Firebase Console
- Go to [Firebase Console](https://console.firebase.google.com/)
- Select your project (or create one if you haven't)

### 2. Enable Authentication
- Navigate to "Authentication" in the left sidebar
- Go to "Sign-in method" tab
- Enable "Google" as a sign-in provider
- Click "Save"

### 3. Add Authorized Domains
- In the Authentication section, go to "Settings" tab
- Scroll down to "Authorized domains"
- Add the following domains:
  - `localhost` (for local development)
  - Your current Replit domain (the one showing in the error)
  - Any custom domains you plan to use

### 4. Get Configuration Values
- Go to "Project settings" (gear icon)
- Scroll down to "Your apps" section
- Copy the config values for:
  - `apiKey`
  - `projectId` 
  - `appId`

### Current Error Resolution
The error "auth/unauthorized-domain" means the current domain needs to be added to Firebase authorized domains. Add your Replit preview domain to the authorized domains list in Firebase console.

## Environment Variables Required
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`