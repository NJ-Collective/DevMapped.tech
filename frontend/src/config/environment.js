/**
 * Environment Configuration
 * Centralized environment variable management for Vite
 */

// Vite environment variables (must be prefixed with VITE_)
export const config = {
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  },
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080'
  }
};

// Validate required configuration
export function validateConfig() {
  const required = ['projectId', 'apiKey', 'authDomain'];
  const missing = required.filter(key => !config.firebase[key]);
  
  if (missing.length > 0) {
    console.error('Missing Firebase configuration:', missing);
    console.error('Please set the following environment variables:');
    missing.forEach(key => {
      console.error(`  VITE_FIREBASE_${key.toUpperCase()}`);
    });
    return false;
  }
  
  return true;
}

// Development mode check
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
