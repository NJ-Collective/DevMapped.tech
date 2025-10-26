/**
 * Firebase Admin SDK Configuration
 * Handles Firebase initialization and database connection
 */

import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Check for required environment variables
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_CLIENT_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required Firebase environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease set these in your Render Environment Variables');
  process.exit(1);
}

let db;

try {
  // Build service account from environment variables
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
    token_uri: process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
  };

  // Validate service account
  if (!serviceAccount.project_id || typeof serviceAccount.project_id !== 'string') {
    throw new Error(`Invalid project_id: "${serviceAccount.project_id}"`);
  }
  if (!serviceAccount.private_key || typeof serviceAccount.private_key !== 'string') {
    throw new Error(`Invalid private_key: key not found or not a string`);
  }

  console.log(`Initializing Firebase with project: ${serviceAccount.project_id}`);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });

  db = admin.firestore();
  
  console.log('✅ Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
  console.error('\nFull error:', error);
  throw error;
}

export { db, admin };
export default db;