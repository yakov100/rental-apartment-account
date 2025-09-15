// אתחול Firebase לאפליקציה
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // המתן לטעינת מודולי Firebase
        await loadFirebaseModules();
        
        // התחל מעקב אחר מצב ההתחברות
        if (window.authModule && window.authModule.onAuthChange) {
            window.authModule.onAuthChange(updateUserUI);
        }
        
        console.log('Firebase אותחל בהצלחה');
    } catch (error) {
        console.error('שגיאה באתחול Firebase:', error);
        if (typeof showToast === 'function') {
            showToast('שגיאה בחיבור למערכת - מעבר למצב אופליין', 'warning');
        }
        
        // אתחול בלי Firebase
        if (typeof updateUserUI === 'function') {
            updateUserUI(null);
        }
        if (typeof loadFromLocalStorage === 'function') {
            loadFromLocalStorage();
        }
    }
});

async function loadFirebaseModules() {
    try {
        // טען מודולי Firebase בסדר הנכון
        const authModule = await import('./auth.js');
        const firebaseData = await import('./firebase-data.js');
        
        // הפוך אותם זמינים גלובלית
        window.authModule = authModule;
        window.firebaseData = firebaseData;
        
        return { authModule, firebaseData };
    } catch (error) {
        console.warn('לא ניתן לטעון מודולי Firebase:', error);
        return null;
    }
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

// פונקציה להצגת הודעות
function showToast(message, type = 'info') {
    // יצירת אלמנט ההודעה
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-full`;
    
    // צבעים לפי סוג ההודעה
    switch(type) {
        case 'success':
            toast.className += ' bg-green-500';
            break;
        case 'error':
            toast.className += ' bg-red-500';
            break;
        case 'warning':
            toast.className += ' bg-yellow-500';
            break;
        default:
            toast.className += ' bg-blue-500';
    }
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // אנימציה כניסה
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 100);
    
    // הסרה אוטומטית אחרי 3 שניות
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// הפוך את הפונקציה זמינה גלובלית
window.showToast = showToast;
