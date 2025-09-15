// ניהול משתמשים
import { showToast } from './utils.js';
import { 
    populateFamilyNames, 
    populateFamilyFilter 
} from './family-management.js';
import { renderTable, updateStatsCards } from './table-rendering.js';
import { updateCharts } from './charts.js';

let currentUser = null;
let isOfflineMode = false;

// עדכון UI עבור משתמש מחובר
export function updateUserUI(user) {
    const userInfoBar = document.getElementById('userInfoBar');
    const authModal = document.getElementById('authModal');
    
    if (user) {
        currentUser = user;
        
        // הצג פרטי משתמש
        document.getElementById('userDisplayName').textContent = 
            user.displayName || user.email || 'משתמש';
        document.getElementById('userAvatar').src = 
            user.photoURL || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Im0zIDlsOS03IDkgN3YxMWwtOS05di0yeiIvPjwvc3ZnPg==';
        
        userInfoBar.classList.remove('hidden');
        authModal.classList.add('hidden');
        authModal.classList.remove('flex');
        
        // טען נתונים
        loadUserData();
    } else {
        currentUser = null;
        userInfoBar.classList.add('hidden');
        authModal.classList.remove('hidden');
        authModal.classList.add('flex');
        
        // נקה נתונים
        window.records = [];
        window.familyNames = new Set();
        renderTable();
        updateCharts();
    }
}

// טעינת נתונים מ-Firebase
export async function loadUserData() {
    if (!currentUser) return;
    
    try {
        showToast('טוען נתונים...', 'info');
        
        // טען נתונים מ-Firebase
        const [firebaseRecords, firebaseFamilies, firebaseRates, firebaseColors] = await Promise.all([
            window.firebaseData.getRecords(),
            window.firebaseData.getFamilies(),
            window.firebaseData.getRates(),
            window.firebaseData.getFamilyColors()
        ]);
        
        window.records = firebaseRecords || [];
        window.familyNames = firebaseFamilies || new Set();
        const rates = firebaseRates || { חשמל: 0.6, מים: 7, ארנונה: 50 };
        
        // עדכן צבעי משפחות
        if (firebaseColors) {
            window.getFamilyColor = (name) => {
                if (firebaseColors[name]) return firebaseColors[name];
                return window.getFamilyColor(name);
            };
        }
        
        // עדכן UI
        populateFamilyNames();
        populateFamilyFilter();
        renderTable();
        updateCharts();
        updateStatsCards();
        
        // התחל מעקב בזמן אמת
        startRealtimeUpdates();
        
        showToast('נתונים נטענו בהצלחה!', 'success');
    } catch (error) {
        console.error('שגיאה בטעינת נתונים:', error);
        showToast('שגיאה בטעינת נתונים - מעבר למצב אופליין', 'warning');
        isOfflineMode = true;
        loadFromLocalStorage(); // fallback למצב אופליין
    }
}

// מעקב בזמן אמת
let recordsUnsubscriber = null;

function startRealtimeUpdates() {
    if (!window.firebaseData || !currentUser) return;
    
    // בטל מעקב קודם
    if (recordsUnsubscriber) {
        recordsUnsubscriber();
    }
    
    // התחל מעקב חדש
    recordsUnsubscriber = window.firebaseData.subscribeToRecords((updatedRecords) => {
        window.records = updatedRecords;
        renderTable();
        updateCharts();
        updateStatsCards();
    });
}

export function loadRecords() {
    if (currentUser) {
        loadUserData();
    } else {
        loadFromLocalStorage();
    }
}

function loadFromLocalStorage() {
    const { loadRates } = require('./rates.js');
    loadRates();
    const storedRecords = localStorage.getItem('billingRecords');
    if (storedRecords) {
        window.records = JSON.parse(storedRecords);
        console.log('נתונים נטענו מהאחסון המקומי');
    } else {
        console.log('אין נתונים שמורים - מתחיל עם מערכת חדשה');
    }
    const storedFamilyNames = localStorage.getItem('familyNames');
    if (storedFamilyNames) {
        window.familyNames = new Set(JSON.parse(storedFamilyNames));
    }
    populateFamilyNames();
    populateFamilyFilter();
    renderTable();
    updateCharts();
}

export function getCurrentUser() {
    return currentUser;
}

export function getIsOfflineMode() {
    return isOfflineMode;
}
