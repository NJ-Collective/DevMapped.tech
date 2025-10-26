// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { config, validateConfig } from './environment.js';

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

// For development, provide a warning but don't crash
if (isDevelopment && !validateConfig()) {
  console.warn('⚠️ Firebase configuration is missing. The app will run in demo mode.');
  console.warn('To fix this, create a .env.local file with your Firebase configuration.');
}

// Initialize Firebase with the configuration
let app;
let analytics;
let database;
let firestore;

try {
  app = initializeApp(config.firebase);
  analytics = getAnalytics(app);
  database = getDatabase(app);
  firestore = getFirestore(app);
  
  if (isDevelopment) {
    console.log('✅ Firebase initialized successfully');
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  
  // In development, create mock objects to prevent crashes
  if (isDevelopment) {
    console.warn('Creating mock Firebase objects for development...');
    // Create mock objects that won't crash the app
    database = null;
    firestore = null;
    analytics = null;
  } else {
    // In production, throw the error
    throw error;
  }
}

export { database, firestore, analytics };