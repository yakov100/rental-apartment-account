// אתחול Firebase לאפליקציה - גרסה מפוצלת
// fallback ל-showToast אם עדיין לא נטען מ-app.js
if (typeof window.showToast !== 'function') {
    window.showToast = function(message, type) {
        try {
            const level = type === 'error' ? 'error' : (type === 'warning' ? 'warn' : 'log');
            console[level](message);
        } catch (_) {
            // אין קונסול? התעלם בשקט
        }
    };
}

// תצורת Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAY9ylN2pFKGBbY0uJ7rfPBbr_K66Ecq4o",
    authDomain: "rental-apartment-account.firebaseapp.com",
    projectId: "rental-apartment-account",
    storageBucket: "rental-apartment-account.firebasestorage.app",
    messagingSenderId: "225410926493",
    appId: "1:225410926493:web:7b3849711daf698a4ed174"
};

// רשימת מנהלים מורשים
const authorizedAdmins = [
    'yafried100@gmail.com',
    // הוסף כאן emails נוספים של מנהלים מורשים
    // 'manager2@example.com',
    // 'owner@company.com'
];

// פונקציות עזר
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

function updateAdminUI(isAdmin) {
    try {
        const ratesBtn = document.getElementById('btnRates');
        if (ratesBtn) {
            if (!isAdmin) {
                ratesBtn.classList.add('hidden');
            } else {
                ratesBtn.classList.remove('hidden');
            }
        }
    } catch (e) {
        console.warn('שגיאה בעדכון UI מנהל:', e);
    }
}

async function handleAuthStateChange(user) {
    if (user) {
        try {
            const token = await user.getIdTokenResult(true);
            const isAuthorizedAdmin = authorizedAdmins.includes(user.email);
            window.isAdmin = (token.claims && token.claims.role === 'admin') || isAuthorizedAdmin;
            
            console.log('👤 משתמש מחובר:', user.email, 'isAdmin:', window.isAdmin);
            
            if (isAuthorizedAdmin && (!token.claims || token.claims.role !== 'admin')) {
                console.log('🔄 מנהל מורשה מזוהה אוטומטית');
            }
            
            updateAdminUI(window.isAdmin);
        } catch (e) {
            console.warn('שגיאה בשליפת claims:', e);
        }
    } else {
        window.isAdmin = false;
        updateAdminUI(false);
    }
    updateUserUI(user);
}

function initializeFirebase() {
    try {
        // אתחול Firebase
        firebase.initializeApp(firebaseConfig);
        console.log('Firebase אותחל בהצלחה');
        
        // שמירה גלובלית
        window.firebaseAuth = firebase.auth();
        window.firebaseDb = firebase.firestore();
        
        // הגדרת ברירת מחדל ל-isAdmin
        window.isAdmin = false;
        
        // התחל מעקב אחר מצב ההתחברות + תפקיד
        firebase.auth().onAuthStateChanged(handleAuthStateChange);
        
        console.log('מעקב אימות הוגדר');
        
    } catch (error) {
        console.error('שגיאה באתחול Firebase:', error);
        showToast('שגיאה בחיבור למערכת - מעבר למצב אופליין', 'warning');
        updateUserUI(null);
    }
}

// אתחול
document.addEventListener('DOMContentLoaded', function() {
    console.log('טוען Firebase...');
    
    // וודא שFirebase נטען
    if (typeof firebase === 'undefined') {
        console.error('Firebase לא נטען מ-CDN');
        showToast('שגיאה בטעינת Firebase - מעבר למצב אופליין', 'error');
        updateUserUI(null);
        return;
    }

    console.log('Firebase זמין, מאתחל...');
    initializeFirebase();
});

// מעקב אחר מצב החיבור
window.addEventListener('online', () => updateConnectionStatus(true));
window.addEventListener('offline', () => updateConnectionStatus(false));

// עדכון ראשוני
updateConnectionStatus(navigator.onLine);
