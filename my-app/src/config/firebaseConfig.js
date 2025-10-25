// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyASPpeA6s2aBi2j8BPcxGZR8YNwA8OLx3k",
  authDomain: "cal-hacks-12-1b6cc.firebaseapp.com",
  projectId: "cal-hacks-12-1b6cc",
  storageBucket: "cal-hacks-12-1b6cc.firebasestorage.app",
  messagingSenderId: "747724168405",
  appId: "1:747724168405:web:c402f2dffef9043ebf165c",
  measurementId: "G-MTLDFNQEHF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const database = getDatabase(app);
export const firestore = getFirestore(app);