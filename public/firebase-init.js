// אתחול Firebase לאפליקציה
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // המתן לטעינת מודולי Firebase
        await loadFirebaseModules();
        
        // התחל מעקב אחר מצב ההתחברות
        window.authModule.onAuthChange(updateUserUI);
        
        console.log('Firebase אותחל בהצלחה');
    } catch (error) {
        console.error('שגיאה באתחול Firebase:', error);
        showToast('שגיאה בחיבור למערכת - מעבר למצב אופליין', 'warning');
        
        // אתחול בלי Firebase
        updateUserUI(null);
        loadFromLocalStorage();
    }
});

async function loadFirebaseModules() {
    // טען מודולי Firebase בסדר הנכון
    const authModule = await import('./auth.js');
    const firebaseData = await import('./firebase-data.js');
    
    // הפוך אותם זמינים גלובלית
    window.authModule = authModule;
    window.firebaseData = firebaseData;
    
    return { authModule, firebaseData };
}

// פונקציות עבור מצב חיבור
function updateConnectionStatus(isOnline) {
    const statusElement = document.getElementById('connectionStatus');
    if (statusElement) {
        statusElement.textContent = isOnline ? 'מקוון' : 'אופליין';
        statusElement.className = `px-2 py-1 text-xs rounded-full ${
            isOnline 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
        }`;
    }
}

// מעקב אחר מצב החיבור
window.addEventListener('online', () => updateConnectionStatus(true));
window.addEventListener('offline', () => updateConnectionStatus(false));

// עדכון ראשוני
updateConnectionStatus(navigator.onLine);
