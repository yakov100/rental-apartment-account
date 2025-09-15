// ניהול רשומות ב-Firestore
import { 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot,
  setDoc
} from 'firebase/firestore';
import { getUserCollectionRef, getUserDocRef, localRecords, unsubscribers } from './firebase-helpers.js';

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
