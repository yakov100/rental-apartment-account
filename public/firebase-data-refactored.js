// ניהול נתונים ב-Firestore - גרסה מפוצלת
export { 
  localRecords, 
  localFamilies, 
  localRates, 
  unsubscribers,
  getUserId,
  getUserCollectionRef,
  getUserDocRef,
  unsubscribeAll,
  getLocalRecords,
  getLocalFamilies,
  getLocalRates
} from './firebase-helpers.js';

export {
  saveRecord,
  deleteRecord,
  getRecords,
  subscribeToRecords
} from './firebase-records.js';

export {
  saveFamilies,
  getFamilies,
  saveRates,
  getRates,
  saveFamilyColors,
  getFamilyColors
} from './firebase-settings.js';

export {
  exportUserData,
  importUserData
} from './firebase-import-export.js';
