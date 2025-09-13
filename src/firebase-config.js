// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore';

// תצורת Firebase - נתונים אמיתיים של הפרויקט
const firebaseConfig = {
  apiKey: "AIzaSyAY9ylN2pFKGBbY0uJ7rfPBbr_K66Ecq4o",
  authDomain: "rental-apartment-account.firebaseapp.com",
  projectId: "rental-apartment-account",
  storageBucket: "rental-apartment-account.firebasestorage.app",
  messagingSenderId: "225410926493",
  appId: "1:225410926493:web:7b3849711daf698a4ed174"
};

// אתחול Firebase
const app = initializeApp(firebaseConfig);

// שירותי Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);

// ניהול מצב חיבור
let isOnline = navigator.onLine;

// פונקציות עבור מצב אופליין/אונליין
export const goOffline = () => {
  return disableNetwork(db);
};

export const goOnline = () => {
  return enableNetwork(db);
};

// מעקב אחר מצב החיבור
window.addEventListener('online', () => {
  isOnline = true;
  goOnline().then(() => {
    console.log('חזרנו למצב אונליין');
    showToast('חזרת למצב מקוון - הנתונים מסתנכרנים', 'success');
  });
});

window.addEventListener('offline', () => {
  isOnline = false;
  console.log('עברנו למצב אופליין');
  showToast('מצב אופליין - הנתונים יסתנכרנו כשתחזור למקוון', 'warning');
});

export const getConnectionStatus = () => isOnline;

export default app;
