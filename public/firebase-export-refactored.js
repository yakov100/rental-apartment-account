// Firebase export/import operations (refactored)
const db = () => firebase.firestore();

function requireAuth() {
    const user = firebase.auth().currentUser;
    if (!user) {
        console.warn('requireAuth: אין משתמש מחובר');
        throw new Error('Not authenticated');
    }
    return user;
}

function getUserCollectionRef(collectionName) {
    const userId = requireAuth().uid;
    return db().collection(`users/${userId}/${collectionName}`);
}

function getUserDocRef(collectionName, docId) {
    const userId = requireAuth().uid;
    return db().doc(`users/${userId}/${collectionName}/${docId}`);
}

async function exportUserData() {
    const records = window.firebaseRecordsRefactored.getRecords();
    const families = window.firebaseSettingsRefactored.getFamilies();
    const rates = window.firebaseSettingsRefactored.getRates();
    const familyColors = window.firebaseSettingsRefactored.getFamilyColors();
    
    const [recordsData, familiesData, ratesData, familyColorsData] = await Promise.all([
        records,
        families,
        rates,
        familyColors
    ]);
    
    return {
        records: recordsData,
        families: Array.from(familiesData),
        rates: ratesData,
        familyColors: familyColorsData,
        exportDate: new Date().toISOString(),
        version: '2.0'
    };
}

async function importUserData(data) {
    const batch = db().batch();
    const userId = requireAuth().uid;
    
    // Delete existing records
    const recordsRef = getUserCollectionRef('records');
    const existingRecords = await recordsRef.get();
    existingRecords.forEach((doc) => {
        batch.delete(doc.ref);
    });
    
    // Import new records
    if (data.records) {
        data.records.forEach((record) => {
            const docRef = getUserDocRef('records', record.id.toString());
            batch.set(docRef, {
                ...record,
                userId,
                importedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });
    }
    
    // Save settings
    if (data.families) {
        const familiesRef = getUserDocRef('settings', 'families');
        batch.set(familiesRef, { 
            families: data.families,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
    
    if (data.rates) {
        const ratesRef = getUserDocRef('settings', 'rates');
        batch.set(ratesRef, { 
            rates: data.rates,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
    
    if (data.familyColors) {
        const colorsRef = getUserDocRef('settings', 'familyColors');
        batch.set(colorsRef, { 
            familyColors: data.familyColors,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
    
    await batch.commit();
}

// Export functions
window.firebaseExportRefactored = {
    exportUserData,
    importUserData
};
