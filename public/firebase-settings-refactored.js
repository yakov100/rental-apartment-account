// Firebase settings operations (refactored)
const db = () => firebase.firestore();

function requireAuth() {
    const user = firebase.auth().currentUser;
    if (!user) {
        console.warn('requireAuth: אין משתמש מחובר');
        throw new Error('Not authenticated');
    }
    return user;
}

function getUserDocRef(collectionName, docId) {
    const userId = requireAuth().uid;
    return db().doc(`users/${userId}/${collectionName}/${docId}`);
}

async function saveFamilies(families) {
    const familiesArray = Array.from(families);
    const docRef = getUserDocRef('settings', 'families');
    
    await docRef.set({
        families: familiesArray,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
}

async function getFamilies() {
    const docRef = getUserDocRef('settings', 'families');
    const doc = await docRef.get();
    
    if (doc.exists()) {
        return new Set(doc.data().families || []);
    }
    return new Set();
}

async function saveRates(rates) {
    const docRef = getUserDocRef('settings', 'rates');
    
    await docRef.set({
        rates,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
}

async function getRates() {
    const docRef = getUserDocRef('settings', 'rates');
    const doc = await docRef.get();
    
    if (doc.exists()) {
        return doc.data().rates || { חשמל: 0.6, מים: 7, ארנונה: 50 };
    }
    return { חשמל: 0.6, מים: 7, ארנונה: 50 };
}

async function saveFamilyColors(familyColors) {
    const docRef = getUserDocRef('settings', 'familyColors');
    
    await docRef.set({
        familyColors,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
}

async function getFamilyColors() {
    const docRef = getUserDocRef('settings', 'familyColors');
    const doc = await docRef.get();
    
    if (doc.exists()) {
        return doc.data().familyColors || {};
    }
    return {};
}

// Export functions
window.firebaseSettingsRefactored = {
    saveFamilies,
    getFamilies,
    saveRates,
    getRates,
    saveFamilyColors,
    getFamilyColors
};
