// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { config, validateConfig } from './environment.js';

// Validate configuration before initializing Firebase
if (!validateConfig()) {
  throw new Error('Firebase configuration is invalid. Please check your environment variables.');
}

// Initialize Firebase
const app = initializeApp(config.firebase);
const analytics = getAnalytics(app);
export const database = getDatabase(app);
export const firestore = getFirestore(app);