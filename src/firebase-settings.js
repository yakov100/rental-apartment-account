// ניהול הגדרות ב-Firestore
import { 
  updateDoc, 
  getDoc,
  setDoc
} from 'firebase/firestore';
import { getUserDocRef, localFamilies, localRates } from './firebase-helpers.js';

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
