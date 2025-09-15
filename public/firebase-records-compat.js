// Firebase records operations (Compat SDK)
const db = () => firebase.firestore();

async function saveRecord(record) {
    const user = window.firebaseAuth.requireAuth();
    const userId = user.uid;
    const toSave = { ...record };
    
    // Normalize id to string
    if (toSave.id == null || toSave.id === '') {
        toSave.id = Date.now().toString();
    } else {
        toSave.id = toSave.id.toString();
    }
    
    toSave.userId = userId;
    toSave.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    if (!toSave.createdAt) {
        toSave.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    }
    
    const docRef = window.firebaseAuth.getUserRecordDocRef(userId, toSave.id);
    await docRef.set(toSave);
    return toSave;
}

async function deleteRecord(recordId) {
    const user = window.firebaseAuth.requireAuth();
    const userId = user.uid;
    const docRef = window.firebaseAuth.getUserRecordDocRef(userId, recordId);
    await docRef.delete();
}

async function getRecords() {
    const user = window.firebaseAuth.requireAuth();
    const userId = user.uid;
    const recordsRef = window.firebaseAuth.getUserCollectionRef(userId, 'records');
    const snapshot = await recordsRef.orderBy('readingDate', 'desc').get();
    
    const records = [];
    snapshot.forEach((doc) => {
        records.push({ id: doc.id, ...doc.data() });
    });
    
    return records;
}

function subscribeToRecords(callback) {
    const user = window.firebaseAuth.requireAuth();
    const userId = user.uid;
    const recordsRef = window.firebaseAuth.getUserCollectionRef(userId, 'records');
    
    return recordsRef.orderBy('readingDate', 'desc').onSnapshot((snapshot) => {
        const records = [];
        snapshot.forEach((doc) => {
            records.push({ id: doc.id, ...doc.data() });
        });
        callback(records);
    }, (error) => {
        console.error('שגיאה במעקב אחר רשומות:', error);
        callback([]);
    });
}

// Export functions
window.firebaseRecords = {
    saveRecord,
    deleteRecord,
    getRecords,
    subscribeToRecords
};
