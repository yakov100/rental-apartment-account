// אתחול Firebase לאפליקציה
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
    
    // אתחול Firebase מיידי
    try {
        // תצורת Firebase
        const firebaseConfig = {
            apiKey: "AIzaSyAY9ylN2pFKGBbY0uJ7rfPBbr_K66Ecq4o",
            authDomain: "rental-apartment-account.firebaseapp.com",
            projectId: "rental-apartment-account",
            storageBucket: "rental-apartment-account.firebasestorage.app",
            messagingSenderId: "225410926493",
            appId: "1:225410926493:web:7b3849711daf698a4ed174"
        };

        // אתחול Firebase
        firebase.initializeApp(firebaseConfig);
        console.log('Firebase אותחל בהצלחה');
        
        // שמירה גלובלית
        window.firebaseAuth = firebase.auth();
        window.firebaseDb = firebase.firestore();
        
        // התחל מעקב אחר מצב ההתחברות + תפקיד
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const token = await user.getIdTokenResult(true);
                    window.isAdmin = token.claims && token.claims.role === 'admin';
                    // עדכן UI רכיבים לפי תפקיד
                    try {
                        const ratesBtn = document.getElementById('btnRates');
                        if (ratesBtn) {
                            if (!window.isAdmin) ratesBtn.classList.add('hidden'); else ratesBtn.classList.remove('hidden');
                        }
                    } catch {}
                } catch (e) { console.warn('שגיאה בשליפת claims:', e); }
            } else {
                window.isAdmin = false;
                try {
                    const ratesBtn = document.getElementById('btnRates');
                    if (ratesBtn) ratesBtn.classList.add('hidden');
                } catch {}
            }
            updateUserUI(user);
        });
        
        console.log('מעקב אימות הוגדר');
        
    } catch (error) {
        console.error('שגיאה באתחול Firebase:', error);
        showToast('שגיאה בחיבור למערכת - מעבר למצב אופליין', 'warning');
        updateUserUI(null);
    }
});

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