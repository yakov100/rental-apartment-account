// Firebase authentication helpers
function requireAuth() {
    const user = firebase.auth().currentUser;
    if (!user) {
        console.warn('requireAuth: אין משתמש מחובר');
        throw new Error('Not authenticated');
    }
    return user;
}

async function isAdmin() {
    const user = requireAuth();
    const token = await user.getIdTokenResult();
    
    // רשימת מנהלים מורשים - חייבת להיות זהה לזו ב-firebase-init.js
    const authorizedAdmins = [
        'yafried100@gmail.com',
        // הוסף כאן emails נוספים של מנהלים מורשים
        // 'manager2@example.com',
        // 'owner@company.com'
    ];
    
    const isAuthorizedAdmin = authorizedAdmins.includes(user.email);
    return (token.claims && token.claims.role === 'admin') || isAuthorizedAdmin;
}

function getUserRecordDocRef(userId, recordId) {
    return firebase.firestore().doc(`users/${userId}/records/${recordId}`);
}

function getUserCollectionRef(userId, collectionName) {
    return firebase.firestore().collection(`users/${userId}/${collectionName}`);
}

// Export functions
window.firebaseAuth = {
    requireAuth,
    isAdmin,
    getUserRecordDocRef,
    getUserCollectionRef
};
