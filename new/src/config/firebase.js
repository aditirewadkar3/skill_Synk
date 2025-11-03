// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase config - Get from Firebase Console > Project Settings > Your apps > Web app
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "skill-sync-37fcf.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "skill-sync-37fcf",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "skill-sync-37fcf.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Debug: Log config (without sensitive data)
console.log('🔧 Firebase Config Loaded:', {
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'MISSING',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
  hasAppId: !!firebaseConfig.appId
});

// Check if required config is missing
if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('your-') || firebaseConfig.apiKey.length < 20) {
  console.error('❌ Firebase API key not found or invalid!');
  console.error('Current value:', firebaseConfig.apiKey || 'undefined');
  console.error('Please add VITE_FIREBASE_API_KEY to .env file');
  console.error('Get it from: Firebase Console > Project Settings > Your apps > Web app');
  console.error('⚠️  Make sure to restart the dev server after updating .env file!');
  throw new Error('Firebase API key is required. Please configure .env file and restart the server.');
}

if (!firebaseConfig.projectId) {
  console.error('❌ Firebase Project ID not found!');
  throw new Error('Firebase Project ID is required. Please configure .env file.');
}

console.log('✅ Firebase initialized with project:', firebaseConfig.projectId);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;

