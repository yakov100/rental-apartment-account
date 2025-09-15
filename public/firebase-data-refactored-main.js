// Firebase data layer - Main file (refactored)
// Exposes window.firebaseData for use by public/app.js

(function initFirebaseData() {
    if (typeof firebase === 'undefined') {
        console.warn('firebase not found; firebase-data disabled');
        return;
    }

    // Wait for modules to load
    setTimeout(() => {
        const records = window.firebaseRecordsRefactored || {};
        const settings = window.firebaseSettingsRefactored || {};
        const exportModule = window.firebaseExportRefactored || {};

        // Main firebaseData object
        window.firebaseData = {
            saveRecord: records.saveRecord || (() => Promise.reject('Records module not loaded')),
            deleteRecord: records.deleteRecord || (() => Promise.reject('Records module not loaded')),
            getRecords: records.getRecords || (() => Promise.reject('Records module not loaded')),
            subscribeToRecords: records.subscribeToRecords || (() => Promise.reject('Records module not loaded')),
            
            saveFamilies: settings.saveFamilies || (() => Promise.reject('Settings module not loaded')),
            getFamilies: settings.getFamilies || (() => Promise.reject('Settings module not loaded')),
            saveRates: settings.saveRates || (() => Promise.reject('Settings module not loaded')),
            getRates: settings.getRates || (() => Promise.reject('Settings module not loaded')),
            saveFamilyColors: settings.saveFamilyColors || (() => Promise.reject('Settings module not loaded')),
            getFamilyColors: settings.getFamilyColors || (() => Promise.reject('Settings module not loaded')),
            
            exportUserData: exportModule.exportUserData || (() => Promise.reject('Export module not loaded')),
            importUserData: exportModule.importUserData || (() => Promise.reject('Export module not loaded'))
        };

        console.log('Firebase data layer initialized');
    }, 100);
})();