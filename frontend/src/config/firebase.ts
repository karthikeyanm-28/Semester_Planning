import { initializeApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBnf_sdN-CZbosAhQrcFnWEsW9hiZfBbF4",
  authDomain: "semester-planning-system.firebaseapp.com",
  projectId: "semester-planning-system",
  storageBucket: "semester-planning-system.firebasestorage.app",
  messagingSenderId: "921331698317",
  appId: "1:921331698317:web:f8e828cc512fe0eb3470c4",
  measurementId: "G-K9HMMBFWND"
};

// Initialize Firebase
let app: any;
let auth: Auth | null = null;
let analytics: Analytics | null = null;
let db: any = null;

try {
  app = initializeApp(firebaseConfig);
  console.log("✓ Firebase app initialized");
  
  auth = getAuth(app);
  console.log("✓ Firebase Auth initialized");
  
  try {
    analytics = getAnalytics(app);
    console.log("✓ Firebase Analytics initialized");
  } catch (analyticsError: any) {
    console.warn("⚠ Analytics not available");
    analytics = null;
  }
  
  db = getFirestore(app);
  console.log("✓ Firestore initialized");
  
  console.log("✓ Firebase fully initialized");
} catch (error: any) {
  const errorMsg = error?.message || String(error);
  console.error("✗ Firebase initialization failed:", errorMsg);
}

if (!auth && app) {
  try {
    auth = getAuth(app);
  } catch (e) {
    console.error("Failed to get auth instance:", e);
  }
}

export { app, auth, analytics, db };


