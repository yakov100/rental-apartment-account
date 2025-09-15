// ייבוא וייצוא נתונים ב-Firestore
import { 
  getDocs, 
  writeBatch,
  setDoc
} from 'firebase/firestore';
import { getUserCollectionRef, getUserDocRef, requireAuth } from './firebase-helpers.js';

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

// Import the required functions
import { getRecords } from './firebase-records.js';
import { getFamilies, getRates, getFamilyColors } from './firebase-settings.js';
