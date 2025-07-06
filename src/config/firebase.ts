import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';

// Firebase 설정 객체
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyA1N96qWLYp84Wlqrby0zhLdp2vEOgsuS0",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "ishowyou-expo.firebaseapp.com",
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || "https://ishowyou-expo-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "ishowyou-expo",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "ishowyou-expo.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "998057758378",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:998057758378:web:2564494b3e619735c20ad3",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-X408561CRT"
};

// Firebase 앱 초기화 (중복 방지)
let app;
if (getApps().length === 0) {
  console.log('Firebase 앱 초기화 중...');
  app = initializeApp(firebaseConfig);
  console.log('Firebase 앱 초기화 완료');
} else {
  app = getApp();
  console.log('기존 Firebase 앱 사용');
}

// Firebase Auth 초기화
console.log('Firebase Auth 초기화 중...');
export const auth = getAuth(app);
console.log('Firebase Auth 초기화 완료');

export const database = getDatabase(app);

// Analytics는 웹에서만 사용
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics 초기화 오류:', error);
  }
}
export { analytics };

export default app;
