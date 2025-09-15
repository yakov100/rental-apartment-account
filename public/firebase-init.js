// אתחול Firebase לאפליקציה
document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('Starting Firebase app initialization...');
        
        // וודא שFirebase מאותחל
        if (!firebase.apps.length) {
            console.error('Firebase not initialized!');
            throw new Error('Firebase not initialized');
        }
        
        // יצירת auth module פשוט
        window.authModule = {
            signInWithGoogle: async () => {
                try {
                    const provider = new firebase.auth.GoogleAuthProvider();
                    const result = await firebase.auth().signInWithPopup(provider);
                    if (typeof showToast === 'function') {
                        showToast('התחברת בהצלחה!', 'success');
                    }
                    return result.user;
                } catch (error) {
                    console.error('Google login error:', error);
                    if (typeof showToast === 'function') {
                        showToast('שגיאה בהתחברות עם Google', 'error');
                    }
                    throw error;
                }
            },
            signInWithEmail: async (email, password) => {
                try {
                    const result = await firebase.auth().signInWithEmailAndPassword(email, password);
                    if (typeof showToast === 'function') {
                        showToast('התחברת בהצלחה!', 'success');
                    }
                    return result.user;
                } catch (error) {
                    console.error('Email login error:', error);
                    if (typeof showToast === 'function') {
                        showToast('שגיאה בהתחברות', 'error');
                    }
                    throw error;
                }
            },
            registerWithEmail: async (email, password) => {
                try {
                    const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
                    if (typeof showToast === 'function') {
                        showToast('נרשמת בהצלחה!', 'success');
                    }
                    return result.user;
                } catch (error) {
                    console.error('Register error:', error);
                    if (typeof showToast === 'function') {
                        showToast('שגיאה בהרשמה', 'error');
                    }
                    throw error;
                }
            },
            logout: async () => {
                try {
                    await firebase.auth().signOut();
                    if (typeof showToast === 'function') {
                        showToast('התנתקת בהצלחה', 'success');
                    }
                } catch (error) {
                    console.error('Logout error:', error);
                    if (typeof showToast === 'function') {
                        showToast('שגיאה בהתנתקות', 'error');
                    }
                }
            }
        };
        
        // משתנה למניעת טעינה כפולה
        let isDataLoaded = false;
        
        // התחל מעקב אחר מצב האימות
        firebase.auth().onAuthStateChanged((user) => {
            console.log('Auth state changed:', user ? `User logged in: ${user.uid}` : 'User logged out');
            
            // עדכן UI
            updateUserUI(user);
            
            // טען נתונים רק פעם אחת לכל שינוי מצב
            if (!isDataLoaded) {
                isDataLoaded = true;
                
                if (user) {
                    // משתמש מחובר - טען רק מ-Firestore
                    console.log('Loading data from Firestore for user:', user.uid);
                    loadFromFirestore();
                } else {
                    // משתמש לא מחובר - טען רק מאחסון מקומי
                    console.log('Loading data from local storage');
                    loadFromLocalStorage();
                }
            }
        });
        
        // אל תבדוק מצב נוכחי - onAuthStateChanged יטפל בזה
        
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
        
        console.log('Firebase modules loaded successfully:', { authModule, firebaseData });
        return { authModule, firebaseData };
    } catch (error) {
        console.warn('לא ניתן לטעון מודולי Firebase:', error);
        
        // יצירת auth module פשוט במקום
        window.authModule = {
            signInWithGoogle: async () => {
                try {
                    const provider = new firebase.auth.GoogleAuthProvider();
                    const result = await firebase.auth().signInWithPopup(provider);
                    if (typeof showToast === 'function') {
                        showToast('התחברת בהצלחה!', 'success');
                    }
                    return result.user;
                } catch (error) {
                    console.error('Google login error:', error);
                    if (typeof showToast === 'function') {
                        showToast('שגיאה בהתחברות עם Google', 'error');
                    }
                    throw error;
                }
            },
            signInWithEmail: async (email, password) => {
                try {
                    const result = await firebase.auth().signInWithEmailAndPassword(email, password);
                    if (typeof showToast === 'function') {
                        showToast('התחברת בהצלחה!', 'success');
                    }
                    return result.user;
                } catch (error) {
                    console.error('Email login error:', error);
                    if (typeof showToast === 'function') {
                        showToast('שגיאה בהתחברות', 'error');
                    }
                    throw error;
                }
            },
            registerWithEmail: async (email, password) => {
                try {
                    const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
                    if (typeof showToast === 'function') {
                        showToast('נרשמת בהצלחה!', 'success');
                    }
                    return result.user;
                } catch (error) {
                    console.error('Register error:', error);
                    if (typeof showToast === 'function') {
                        showToast('שגיאה בהרשמה', 'error');
                    }
                    throw error;
                }
            },
            logout: async () => {
                try {
                    await firebase.auth().signOut();
                    if (typeof showToast === 'function') {
                        showToast('התנתקת בהצלחה', 'success');
                    }
                } catch (error) {
                    console.error('Logout error:', error);
                    if (typeof showToast === 'function') {
                        showToast('שגיאה בהתנתקות', 'error');
                    }
                }
            }
        };
        
        // התחל מעקב אחר מצב האימות
        firebase.auth().onAuthStateChanged((user) => {
            if (typeof updateUserUI === 'function') {
                updateUserUI(user);
            }
        });
        
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

// פונקציה לטיפול בכפתור התחברות/התנתקות
window.handleLoginButtonClick = function() {
    const user = firebase.auth().currentUser;
    if (user) {
        // משתמש מחובר - התנתק
        window.handleLogout();
    } else {
        // משתמש לא מחובר - הראה מודל התחברות
        window.showAuthModal();
    }
};

// פונקציה להחזרת צבע משפחה
window.getFamilyColor = function(familyName) {
    const colors = [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
        '#8B5CF6', '#06B6D4', '#84CC16', '#F97316',
        '#EC4899', '#6366F1', '#14B8A6', '#F59E0B'
    ];
    
    if (!familyName) return colors[0];
    
    // יצירת hash פשוט של שם המשפחה
    let hash = 0;
    for (let i = 0; i < familyName.length; i++) {
        const char = familyName.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    
    return colors[Math.abs(hash) % colors.length];
};

// פונקציה מרכזית לעדכון UI של המשתמש
window.updateUserUI = function(user) {
    console.log('updateUserUI called with user:', user ? user.uid : 'null');
    
    try {
        const loginButton = document.getElementById('loginButton');
        const userInfoBar = document.getElementById('userInfoBar');
        const userDisplayName = document.getElementById('userDisplayName');
        const userAvatar = document.getElementById('userAvatar');
        
        if (user && user.uid) {
            // משתמש מחובר - עדכן UI למצב מחובר
            updateLoginButton(loginButton, true);
            updateUserInfo(userInfoBar, userDisplayName, userAvatar, user);
            hideAuthModal();
            
            console.log('UI updated for logged in user:', user.uid);
            
        } else {
            // משתמש לא מחובר - עדכן UI למצב לא מחובר
            updateLoginButton(loginButton, false);
            hideUserInfo(userInfoBar);
            
            console.log('UI updated for logged out user');
        }
    } catch (error) {
        console.error('Error in updateUserUI:', error);
    }
};

// פונקציות עזר לעדכון UI
function updateLoginButton(loginButton, isLoggedIn) {
    if (!loginButton) return;
    
    if (isLoggedIn) {
        loginButton.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg> התנתק';
        loginButton.className = 'btn flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full font-semibold shadow hover:bg-red-600 transition';
    } else {
        loginButton.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg> התחבר';
        loginButton.className = 'btn flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full font-semibold shadow hover:bg-green-600 transition';
    }
    
    loginButton.setAttribute('onclick', 'handleLoginButtonClick()');
}

function updateUserInfo(userInfoBar, userDisplayName, userAvatar, user) {
    if (userInfoBar) {
        userInfoBar.classList.remove('hidden');
        userInfoBar.style.display = 'block';
    }
    
    if (userDisplayName) {
        userDisplayName.textContent = user.displayName || user.email || 'משתמש';
    }
    
    if (userAvatar) {
        const avatarUrl = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'User')}&background=3B82F6&color=fff`;
        userAvatar.src = avatarUrl;
    }
}

function hideUserInfo(userInfoBar) {
    if (userInfoBar) {
        userInfoBar.classList.add('hidden');
        userInfoBar.style.display = 'none';
    }
}

function hideAuthModal() {
    const authModal = document.getElementById('authModal');
    if (authModal && authModal.classList.contains('flex')) {
        authModal.classList.remove('flex');
        authModal.classList.add('hidden');
    }
}

window.loadFromLocalStorage = function() {
    console.log('Loading from local storage...');
    const storedRecords = localStorage.getItem('billingRecords');
    if (storedRecords) {
        try {
            window.records = JSON.parse(storedRecords);
            console.log('נתונים נטענו מהאחסון המקומי');
        } catch (error) {
            console.error('Error parsing stored records:', error);
            window.records = [];
        }
    } else {
        window.records = [];
        console.log('אין נתונים שמורים - מתחיל עם מערכת חדשה');
    }
};

window.loadRecords = function() {
    // אל תטען כאן - onAuthStateChanged כבר טוען את הנתונים
    console.log('loadRecords called - data loading handled by auth state change');
};

// טעינת נתונים מ-Firestore
window.loadFromFirestore = async function() {
    console.log('Loading from Firestore...');
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            console.log('No user logged in, loading from local storage');
            loadFromLocalStorage();
            return;
        }
        
        const db = firebase.firestore();
        
        // טען רשומות
        const recordsRef = db.collection('users').doc(user.uid).collection('records');
        const recordsSnapshot = await recordsRef.orderBy('readingDate', 'desc').get();
        
        window.records = [];
        recordsSnapshot.forEach((doc) => {
            window.records.push({ id: doc.id, ...doc.data() });
        });
        
        console.log(`נטענו ${window.records.length} רשומות מ-Firestore`);
        
        // טען משפחות
        const familiesRef = db.collection('users').doc(user.uid).collection('families');
        const familiesSnapshot = await familiesRef.get();
        
        window.familyNames = new Set();
        familiesSnapshot.forEach((doc) => {
            window.familyNames.add(doc.data().name);
        });
        
        console.log(`נטענו ${window.familyNames.size} משפחות מ-Firestore`);
        
        // עדכן UI
        if (typeof renderTable === 'function') {
            renderTable();
        }
        if (typeof updateCharts === 'function') {
            updateCharts();
        }
        
        if (typeof showToast === 'function') {
            showToast('נתונים נטענו מהשרת', 'success');
        }
        
    } catch (error) {
        console.error('שגיאה בטעינה מ-Firestore:', error);
        if (typeof showToast === 'function') {
            showToast('שגיאה בטעינת נתונים - מעבר למצב מקומי', 'warning');
        }
        loadFromLocalStorage();
    }
};
