# Environment Setup Guide

## 🔧 Required Environment Variables

To fix the Firebase configuration error, you need to set up the following environment variables:

### For Vercel Deployment:

1. **Go to your Vercel project dashboard**
2. **Navigate to Settings → Environment Variables**
3. **Add the following variables:**

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### For Local Development:

1. **Create a `.env.local` file in the frontend directory:**
```bash
cd frontend
touch .env.local
```

2. **Add your Firebase configuration to `.env.local`:**
```env
VITE_FIREBASE_API_KEY=your_actual_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_actual_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_actual_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_actual_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
VITE_FIREBASE_APP_ID=your_actual_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_actual_measurement_id
```

## 🔍 How to Get Firebase Configuration

1. **Go to Firebase Console** (https://console.firebase.google.com)
2. **Select your project**
3. **Go to Project Settings** (gear icon)
4. **Scroll down to "Your apps"**
5. **Click on the web app icon** (</>) or add a new web app
6. **Copy the configuration values**

## 🚨 Important Notes

- **Vite requires the `VITE_` prefix** for environment variables
- **Never commit `.env.local` to version control**
- **Make sure all values are properly quoted if they contain special characters**
- **Restart your development server after adding environment variables**

## ✅ Verification

After setting up the environment variables:

1. **Restart your development server:**
```bash
npm run dev
```

2. **Check the browser console** - you should no longer see Firebase configuration errors

3. **Test Firebase connection** by trying to use the app

## 🔧 Troubleshooting

If you're still getting errors:

1. **Check that all environment variables are set correctly**
2. **Verify the Firebase project is active**
3. **Make sure Firestore is enabled in your Firebase project**
4. **Check that your Firebase security rules allow read/write access**
