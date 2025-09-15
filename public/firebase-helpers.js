// פונקציות עזר ל-Firebase - Firebase v8 Compat
// נשתמש ב-Firebase v8 שכבר נטען בדף

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
  const userId = getCurrentUser()?.uid;
  if (!userId) throw new Error('User not authenticated');
  return firebase.firestore().collection('users').doc(userId).collection(collectionName);
};

export const getUserDocRef = (collectionName, docId) => {
  const userId = getCurrentUser()?.uid;
  if (!userId) throw new Error('User not authenticated');
  return firebase.firestore().collection('users').doc(userId).collection(collectionName).doc(docId);
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
