// Firebase records operations (refactored)
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

async function saveRecord(record) {
    const user = requireAuth();
    const userId = user.uid;
    const toSave = { ...record };
    
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
    
    const docRef = getUserDocRef('records', toSave.id);
    await docRef.set(toSave);
    return toSave;
}

async function deleteRecord(recordId) {
    const docRef = getUserDocRef('records', recordId);
    await docRef.delete();
}

async function getRecords() {
    const recordsRef = getUserCollectionRef('records');
    const snapshot = await recordsRef.orderBy('readingDate', 'desc').get();
    
    const records = [];
    snapshot.forEach((doc) => {
        records.push({ id: doc.id, ...doc.data() });
    });
    
    return records;
}

function subscribeToRecords(callback) {
    const recordsRef = getUserCollectionRef('records');
    
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
window.firebaseRecordsRefactored = {
    saveRecord,
    deleteRecord,
    getRecords,
    subscribeToRecords
};
