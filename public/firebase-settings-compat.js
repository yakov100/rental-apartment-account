// Firebase settings operations (Compat SDK)
const db = () => firebase.firestore();

async function saveFamilies(families) {
    const user = window.firebaseAuth.requireAuth();
    const userId = user.uid;
    const familiesArray = Array.from(families);
    const docRef = db().doc(`users/${userId}/settings/families`);
    
    await docRef.set({
        families: familiesArray,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
}

async function getFamilies() {
    const user = window.firebaseAuth.requireAuth();
    const userId = user.uid;
    const docRef = db().doc(`users/${userId}/settings/families`);
    const doc = await docRef.get();
    
    if (doc.exists()) {
        return new Set(doc.data().families || []);
    }
    return new Set();
}

async function saveRates(rates) {
    const user = window.firebaseAuth.requireAuth();
    const userId = user.uid;
    const docRef = db().doc(`users/${userId}/settings/rates`);
    
    await docRef.set({
        rates,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
}

async function getRates() {
    const user = window.firebaseAuth.requireAuth();
    const userId = user.uid;
    const docRef = db().doc(`users/${userId}/settings/rates`);
    const doc = await docRef.get();
    
    if (doc.exists()) {
        return doc.data().rates || { חשמל: 0.6, מים: 7, ארנונה: 50 };
    }
    return { חשמל: 0.6, מים: 7, ארנונה: 50 };
}

async function saveFamilyColors(familyColors) {
    const user = window.firebaseAuth.requireAuth();
    const userId = user.uid;
    const docRef = db().doc(`users/${userId}/settings/familyColors`);
    
    await docRef.set({
        familyColors,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
}

async function getFamilyColors() {
    const user = window.firebaseAuth.requireAuth();
    const userId = user.uid;
    const docRef = db().doc(`users/${userId}/settings/familyColors`);
    const doc = await docRef.get();
    
    if (doc.exists()) {
        return doc.data().familyColors || {};
    }
    return {};
}

// Export functions
window.firebaseSettings = {
    saveFamilies,
    getFamilies,
    saveRates,
    getRates,
    saveFamilyColors,
    getFamilyColors
};
