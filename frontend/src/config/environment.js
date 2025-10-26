/**
 * Environment Configuration
 * Centralized environment variable management for Vite
 */

// Vite environment variables (must be prefixed with VITE_)
export const config = {
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-XXXXXXXXXX'
  },
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080'
  }
};

// Debug environment variables
console.log('Environment variables loaded:', {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
  VITE_FIREBASE_MEASUREMENT_ID: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
});

// Validate required configuration
export function validateConfig() {
  const required = ['projectId', 'apiKey', 'authDomain'];
  const missing = required.filter(key => !config.firebase[key] || config.firebase[key] === 'demo-api-key');
  
  if (missing.length > 0) {
    console.error('Missing Firebase configuration:', missing);
    console.error('Please set the following environment variables:');
    missing.forEach(key => {
      console.error(`  VITE_FIREBASE_${key.toUpperCase()}`);
    });
    console.error('Current config:', config.firebase);
    return false;
  }
  
  return true;
}

// Development mode check
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;