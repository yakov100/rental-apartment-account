// פונקציות עזר ל-Firebase
import { collection, doc } from 'firebase/firestore';
import { db } from './firebase-config.js';
import { getCurrentUser, requireAuth } from './auth.js';

// משתנים גלובליים לנתונים
export let localRecords = [];
export let localFamilies = new Set();
export let localRates = { חשמל: 0.6, מים: 7, ארנונה: 50 };
export let unsubscribers = [];

// פונקציות עזר
export const getUserId = () => {
  const user = getCurrentUser();
  return user ? user.uid : null;
};

export const getUserCollectionRef = (collectionName) => {
  const userId = requireAuth().uid;
  return collection(db, 'users', userId, collectionName);
};

export const getUserDocRef = (collectionName, docId) => {
  const userId = requireAuth().uid;
  return doc(db, 'users', userId, collectionName, docId);
};

// ניקוי מאזינים
export const unsubscribeAll = () => {
  unsubscribers.forEach(unsubscribe => unsubscribe());
  unsubscribers = [];
};

// נתונים מקומיים לשימוש אופליין
export const getLocalRecords = () => localRecords;
export const getLocalFamilies = () => localFamilies;
export const getLocalRates = () => localRates;
