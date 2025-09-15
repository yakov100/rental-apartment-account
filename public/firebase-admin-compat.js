// Firebase admin operations (Compat SDK)
const db = () => firebase.firestore();

async function getAllUsers() {
    const isAdminUser = await window.firebaseAuth.isAdmin();
    if (!isAdminUser) {
        throw new Error('Unauthorized: Admin access required');
    }
    
    const usersSnapshot = await db().collection('users').get();
    const users = [];
    usersSnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
    });
    return users;
}

async function getUserRecords(userId) {
    const isAdminUser = await window.firebaseAuth.isAdmin();
    if (!isAdminUser) {
        throw new Error('Unauthorized: Admin access required');
    }
    
    const recordsRef = window.firebaseAuth.getUserCollectionRef(userId, 'records');
    const snapshot = await recordsRef.orderBy('readingDate', 'desc').get();
    
    const records = [];
    snapshot.forEach((doc) => {
        records.push({ id: doc.id, ...doc.data() });
    });
    
    return records;
}

async function getUserFamilies(userId) {
    const isAdminUser = await window.firebaseAuth.isAdmin();
    if (!isAdminUser) {
        throw new Error('Unauthorized: Admin access required');
    }
    
    const docRef = db().doc(`users/${userId}/settings/families`);
    const doc = await docRef.get();
    
    if (doc.exists()) {
        return new Set(doc.data().families || []);
    }
    return new Set();
}

async function exportAllData() {
    const isAdminUser = await window.firebaseAuth.isAdmin();
    if (!isAdminUser) {
        throw new Error('Unauthorized: Admin access required');
    }
    
    const users = await getAllUsers();
    const allData = {};
    
    for (const user of users) {
        const [records, families] = await Promise.all([
            getUserRecords(user.id),
            getUserFamilies(user.id)
        ]);
        
        allData[user.id] = {
            user: user,
            records: records,
            families: Array.from(families)
        };
    }
    
    return allData;
}

// Export functions
window.firebaseAdmin = {
    getAllUsers,
    getUserRecords,
    getUserFamilies,
    exportAllData
};
