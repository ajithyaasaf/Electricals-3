// Firebase Session Utils - Express session configuration for Firebase auth
// Provides minimal Express session support alongside Firebase authentication

import session from "express-session";

export function getSession() {
  const MemoryStore = require('memorystore')(session);
  
  return session({
    secret: process.env.SESSION_SECRET || "firebase-express-session",
    store: new MemoryStore({
      checkPeriod: 86400000 // Clean expired entries every 24h
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  });
}