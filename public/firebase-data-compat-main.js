// Firestore data layer (Compat SDK) - Main file
// Exposes window.firebaseData for use by public/app.js

(function initFirebaseDataCompat() {
    if (typeof firebase === 'undefined') {
        console.warn('firebase not found; firebase-data-compat disabled');
        return;
    }

    // Load all modules
    const auth = window.firebaseAuth || {};
    const records = window.firebaseRecords || {};
    const settings = window.firebaseSettings || {};
    const admin = window.firebaseAdmin || {};

    // Main firebaseData object
    window.firebaseData = {
        // Records
        saveRecord: records.saveRecord || (() => Promise.reject('Records module not loaded')),
        deleteRecord: records.deleteRecord || (() => Promise.reject('Records module not loaded')),
        getRecords: records.getRecords || (() => Promise.reject('Records module not loaded')),
        subscribeToRecords: records.subscribeToRecords || (() => Promise.reject('Records module not loaded')),
        
        // Settings
        saveFamilies: settings.saveFamilies || (() => Promise.reject('Settings module not loaded')),
        getFamilies: settings.getFamilies || (() => Promise.reject('Settings module not loaded')),
        saveRates: settings.saveRates || (() => Promise.reject('Settings module not loaded')),
        getRates: settings.getRates || (() => Promise.reject('Settings module not loaded')),
        saveFamilyColors: settings.saveFamilyColors || (() => Promise.reject('Settings module not loaded')),
        getFamilyColors: settings.getFamilyColors || (() => Promise.reject('Settings module not loaded')),
        
        // Admin
        getAllUsers: admin.getAllUsers || (() => Promise.reject('Admin module not loaded')),
        getUserRecords: admin.getUserRecords || (() => Promise.reject('Admin module not loaded')),
        getUserFamilies: admin.getUserFamilies || (() => Promise.reject('Admin module not loaded')),
        exportAllData: admin.exportAllData || (() => Promise.reject('Admin module not loaded')),
        
        // Auth helpers
        requireAuth: auth.requireAuth || (() => { throw new Error('Auth module not loaded'); }),
        isAdmin: auth.isAdmin || (() => Promise.resolve(false))
    };

    console.log('Firebase data layer initialized');
})();
