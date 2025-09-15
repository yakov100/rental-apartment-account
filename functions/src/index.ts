import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Example function - you can modify or remove this
export const helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase Functions!");
});

// Example function for your units management system
export const getUnitsData = functions.https.onCall(async (data, context) => {
  try {
    // Add your logic here for retrieving units data
    const db = admin.firestore();
    const unitsRef = db.collection('units');
    const snapshot = await unitsRef.get();
    
    const units = [];
    snapshot.forEach(doc => {
      units.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: units };
  } catch (error) {
    console.error('Error getting units data:', error);
    throw new functions.https.HttpsError('internal', 'Unable to retrieve units data');
  }
});
