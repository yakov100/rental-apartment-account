// ניהול נתונים ב-Firestore
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  writeBatch 
} from 'firebase/firestore';
import { db } from './firebase-config.js';
import { getCurrentUser, requireAuth } from './auth.js';

// משתנים גלובליים לנתונים
let localRecords = [];
let localFamilies = new Set();
let localRates = { חשמל: 0.6, מים: 7, ארנונה: 50 };
let unsubscribers = [];

// פונקציות עזר
const getUserId = () => {
  const user = getCurrentUser();
  return user ? user.uid : null;
};

const getUserCollectionRef = (collectionName) => {
  const userId = requireAuth().uid;
  return collection(db, 'users', userId, collectionName);
};

const getUserDocRef = (collectionName, docId) => {
  const userId = requireAuth().uid;
  return doc(db, 'users', userId, collectionName, docId);
};

// רשומות צריכה
export const saveRecord = async (record) => {
  try {
    const userId = requireAuth().uid;
    const recordsRef = getUserCollectionRef('records');
    
    if (record.id && typeof record.id !== 'string') {
      record.id = record.id.toString();
    }
    
    const recordData = {
      ...record,
      userId,
      updatedAt: new Date(),
      createdAt: record.createdAt || new Date()
    };
    
    if (record.id) {
      // עדכון רשומה קיימת
      const docRef = getUserDocRef('records', record.id);
      await updateDoc(docRef, recordData);
    } else {
      // רשומה חדשה
      record.id = Date.now().toString();
      recordData.id = record.id;
      const docRef = getUserDocRef('records', record.id);
      await setDoc(docRef, recordData);
    }
    
    return record;
  } catch (error) {
    console.error('שגיאה בשמירת רשומה:', error);
    throw error;
  }
};

export const deleteRecord = async (recordId) => {
  try {
    const docRef = getUserDocRef('records', recordId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('שגיאה במחיקת רשומה:', error);
    throw error;
  }
};

export const getRecords = async () => {
  try {
    const recordsRef = getUserCollectionRef('records');
    const q = query(recordsRef, orderBy('readingDate', 'desc'));
    const snapshot = await getDocs(q);
    
    const records = [];
    snapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() });
    });
    
    return records;
  } catch (error) {
    console.error('שגיאה בטעינת רשומות:', error);
    return [];
  }
};

// מעקב בזמן אמת אחר רשומות
export const subscribeToRecords = (callback) => {
  try {
    const recordsRef = getUserCollectionRef('records');
    const q = query(recordsRef, orderBy('readingDate', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = [];
      snapshot.forEach((doc) => {
        records.push({ id: doc.id, ...doc.data() });
      });
      
      localRecords = records;
      callback(records);
    }, (error) => {
      console.error('שגיאה במעקב אחר רשומות:', error);
      // במקרה של שגיאה, השתמש בנתונים המקומיים
      callback(localRecords);
    });
    
    unsubscribers.push(unsubscribe);
    return unsubscribe;
  } catch (error) {
    console.error('שגיאה ביצירת מעקב:', error);
    callback(localRecords);
  }
};

// משפחות
export const saveFamilies = async (families) => {
  try {
    const familiesArray = Array.from(families);
    const docRef = getUserDocRef('settings', 'families');
    await updateDoc(docRef, { 
      families: familiesArray,
      updatedAt: new Date()
    }).catch(async () => {
      // אם המסמך לא קיים, צור אותו
      await setDoc(docRef, { 
        families: familiesArray,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
  } catch (error) {
    console.error('שגיאה בשמירת משפחות:', error);
    throw error;
  }
};

export const getFamilies = async () => {
  try {
    const docRef = getUserDocRef('settings', 'families');
    const doc = await getDoc(docRef);
    
    if (doc.exists()) {
      return new Set(doc.data().families || []);
    }
    return new Set();
  } catch (error) {
    console.error('שגיאה בטעינת משפחות:', error);
    return new Set();
  }
};

// תעריפים
export const saveRates = async (rates) => {
  try {
    const docRef = getUserDocRef('settings', 'rates');
    await updateDoc(docRef, { 
      rates,
      updatedAt: new Date()
    }).catch(async () => {
      // אם המסמך לא קיים, צור אותו
      await setDoc(docRef, { 
        rates,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
    
    localRates = rates;
  } catch (error) {
    console.error('שגיאה בשמירת תעריפים:', error);
    throw error;
  }
};

export const getRates = async () => {
  try {
    const docRef = getUserDocRef('settings', 'rates');
    const doc = await getDoc(docRef);
    
    if (doc.exists()) {
      const rates = doc.data().rates;
      localRates = rates;
      return rates;
    }
    return localRates;
  } catch (error) {
    console.error('שגיאה בטעינת תעריפים:', error);
    return localRates;
  }
};

// צבעי משפחות
export const saveFamilyColors = async (familyColors) => {
  try {
    const docRef = getUserDocRef('settings', 'familyColors');
    await updateDoc(docRef, { 
      familyColors,
      updatedAt: new Date()
    }).catch(async () => {
      await setDoc(docRef, { 
        familyColors,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
  } catch (error) {
    console.error('שגיאה בשמירת צבעי משפחות:', error);
    throw error;
  }
};

export const getFamilyColors = async () => {
  try {
    const docRef = getUserDocRef('settings', 'familyColors');
    const doc = await getDoc(docRef);
    
    if (doc.exists()) {
      return doc.data().familyColors || {};
    }
    return {};
  } catch (error) {
    console.error('שגיאה בטעינת צבעי משפחות:', error);
    return {};
  }
};

// גיבוי ושחזור
export const exportUserData = async () => {
  try {
    const [records, families, rates, familyColors] = await Promise.all([
      getRecords(),
      getFamilies(),
      getRates(),
      getFamilyColors()
    ]);
    
    return {
      records,
      families: Array.from(families),
      rates,
      familyColors,
      exportDate: new Date().toISOString(),
      version: '2.0'
    };
  } catch (error) {
    console.error('שגיאה בייצוא נתונים:', error);
    throw error;
  }
};

export const importUserData = async (data) => {
  try {
    const batch = writeBatch(db);
    const userId = requireAuth().uid;
    
    // מחק כל הנתונים הקיימים
    const recordsRef = getUserCollectionRef('records');
    const existingRecords = await getDocs(recordsRef);
    existingRecords.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    // ייבא רשומות חדשות
    if (data.records) {
      data.records.forEach((record) => {
        const docRef = getUserDocRef('records', record.id.toString());
        batch.set(docRef, {
          ...record,
          userId,
          importedAt: new Date()
        });
      });
    }
    
    // שמור הגדרות
    if (data.families) {
      const familiesRef = getUserDocRef('settings', 'families');
      batch.set(familiesRef, { 
        families: data.families,
        updatedAt: new Date()
      });
    }
    
    if (data.rates) {
      const ratesRef = getUserDocRef('settings', 'rates');
      batch.set(ratesRef, { 
        rates: data.rates,
        updatedAt: new Date()
      });
    }
    
    if (data.familyColors) {
      const colorsRef = getUserDocRef('settings', 'familyColors');
      batch.set(colorsRef, { 
        familyColors: data.familyColors,
        updatedAt: new Date()
      });
    }
    
    await batch.commit();
  } catch (error) {
    console.error('שגיאה בייבוא נתונים:', error);
    throw error;
  }
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
