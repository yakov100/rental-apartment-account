// פונקציות בסיסיות שחסרות
window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar && overlay) {
        sidebar.classList.toggle('translate-x-full');
        overlay.classList.toggle('hidden');
    }
};

window.toggleDarkMode = function() {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
};

window.showAuthModal = function() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
};

window.hideAuthModal = function() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }
};

// פונקציות בסיסיות לכפתורים
window.showAddFamilyModal = function() {
    const modal = document.getElementById('addFamilyModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
};

window.closeAddFamilyModal = function() {
    const modal = document.getElementById('addFamilyModal');
    if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }
};

window.showEditFamilyModal = function() {
    const modal = document.getElementById('editFamilyModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
};

window.closeEditFamilyModal = function() {
    const modal = document.getElementById('editFamilyModal');
    if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }
};

window.showReportModal = function() {
    const modal = document.getElementById('reportModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
};

window.closeReportModal = function() {
    const modal = document.getElementById('reportModal');
    if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }
};

window.showDebtsModal = function() {
    const modal = document.getElementById('debtsModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
};

window.closeDebtsModal = function() {
    const modal = document.getElementById('debtsModal');
    if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }
};

window.showRatesModal = function() {
    const modal = document.getElementById('ratesModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
};

window.closeRatesModal = function() {
    const modal = document.getElementById('ratesModal');
    if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }
};

window.openAddRecordModal = function() {
    const modal = document.getElementById('addRecordModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
};

window.closeAddRecordModal = function() {
    const modal = document.getElementById('addRecordModal');
    if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }
};

window.addOrUpdateRecord = function() {
    console.log('addOrUpdateRecord called - פונקציה תטען בקרוב');
    if (typeof showToast === 'function') {
        showToast('פונקציה זו תטען בקרוב', 'info');
    }
};

window.clearForm = function() {
    const form = document.getElementById('recordForm');
    if (form) {
        form.reset();
    }
};

window.copyPreviousRecord = function() {
    console.log('copyPreviousRecord called - פונקציה תטען בקרוב');
    if (typeof showToast === 'function') {
        showToast('פונקציה זו תטען בקרוב', 'info');
    }
};

window.exportToCSV = function() {
    console.log('exportToCSV called - פונקציה תטען בקרוב');
    if (typeof showToast === 'function') {
        showToast('פונקציה זו תטען בקרוב', 'info');
    }
};

window.addFamily = async function() {
    const name = document.getElementById('newFamilyNameInput')?.value;
    const entryDate = document.getElementById('newFamilyEntryDateInput')?.value;
    const phones = document.getElementById('newFamilyPhonesInput')?.value;
    const email = document.getElementById('newFamilyEmailInput')?.value;
    
    if (!name) {
        if (typeof showToast === 'function') {
            showToast('אנא הכנס שם משפחה', 'warning');
        }
        return;
    }
    
    try {
        const user = firebase.auth().currentUser;
        if (user) {
            // שמור ב-Firestore
            const db = firebase.firestore();
            const familyData = {
                name: name,
                entryDate: entryDate || null,
                phones: phones || '',
                email: email || '',
                createdAt: new Date(),
                userId: user.uid
            };
            
            await db.collection('users').doc(user.uid).collection('families').add(familyData);
            console.log('Family saved to Firestore:', name);
        } else {
            // שמור מקומית
            const families = JSON.parse(localStorage.getItem('families') || '[]');
            families.push({ name, entryDate, phones, email });
            localStorage.setItem('families', JSON.stringify(families));
        }
        
        // הוסף למשתנה גלובלי
        if (!window.familyNames) window.familyNames = new Set();
        window.familyNames.add(name);
        
        if (typeof showToast === 'function') {
            showToast('משפחה נוספה בהצלחה!', 'success');
        }
        
        // נקה את הטופס
        document.getElementById('newFamilyNameInput').value = '';
        document.getElementById('newFamilyEntryDateInput').value = '';
        document.getElementById('newFamilyPhonesInput').value = '';
        document.getElementById('newFamilyEmailInput').value = '';
        
        closeAddFamilyModal();
        
        // עדכן רשימות משפחות בממשק
        updateFamilySelects();
        
    } catch (error) {
        console.error('Error adding family:', error);
        if (typeof showToast === 'function') {
            showToast('שגיאה בהוספת משפחה', 'error');
        }
    }
};

// פונקציות אימות
window.handleEmailLogin = async function() {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    
    if (!email || !password) {
        if (typeof showToast === 'function') {
            showToast('אנא מלא את כל השדות', 'warning');
        }
        return;
    }
    
    try {
        if (window.authModule && window.authModule.signInWithEmail) {
            await window.authModule.signInWithEmail(email, password);
        } else {
            console.error('Auth module not loaded');
            if (typeof showToast === 'function') {
                showToast('מערכת האימות לא נטענה', 'error');
            }
        }
    } catch (error) {
        console.error('Login error:', error);
    }
};

window.handleEmailRegister = async function() {
    const email = document.getElementById('registerEmail')?.value;
    const password = document.getElementById('registerPassword')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;
    
    if (!email || !password || !confirmPassword) {
        if (typeof showToast === 'function') {
            showToast('אנא מלא את כל השדות', 'warning');
        }
        return;
    }
    
    if (password !== confirmPassword) {
        if (typeof showToast === 'function') {
            showToast('הסיסמאות אינן תואמות', 'warning');
        }
        return;
    }
    
    if (password.length < 6) {
        if (typeof showToast === 'function') {
            showToast('הסיסמה חייבת להכיל לפחות 6 תווים', 'warning');
        }
        return;
    }
    
    try {
        if (window.authModule && window.authModule.registerWithEmail) {
            await window.authModule.registerWithEmail(email, password);
        } else {
            console.error('Auth module not loaded');
            if (typeof showToast === 'function') {
                showToast('מערכת האימות לא נטענה', 'error');
            }
        }
    } catch (error) {
        console.error('Register error:', error);
    }
};

window.handleGoogleLogin = async function() {
    try {
        if (window.authModule && window.authModule.signInWithGoogle) {
            await window.authModule.signInWithGoogle();
        } else {
            console.error('Auth module not loaded');
            if (typeof showToast === 'function') {
                showToast('מערכת האימות לא נטענה', 'error');
            }
        }
    } catch (error) {
        console.error('Google login error:', error);
    }
};

window.handleLogout = async function() {
    try {
        if (window.authModule && window.authModule.logout) {
            await window.authModule.logout();
        } else {
            console.error('Auth module not loaded');
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
};

window.showRegisterForm = function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const title = document.getElementById('authModalTitle');
    
    if (loginForm) loginForm.classList.add('hidden');
    if (registerForm) registerForm.classList.remove('hidden');
    if (title) title.textContent = 'הרשמה למערכת';
};

window.showLoginForm = function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const title = document.getElementById('authModalTitle');
    
    if (registerForm) registerForm.classList.add('hidden');
    if (loginForm) loginForm.classList.remove('hidden');
    if (title) title.textContent = 'התחברות למערכת';
};

// פונקציות נוספות
window.closeModal = function() {
    const modal = document.getElementById('messageModal');
    if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }
};

window.closeEditSpecificFamilyModal = function() {
    const modal = document.getElementById('editSpecificFamilyModal');
    if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }
};

window.deleteFamily = function() {
    console.log('deleteFamily called - פונקציה תטען בקרוב');
    if (typeof showToast === 'function') {
        showToast('פונקציה זו תטען בקרוב', 'info');
    }
};

window.saveFamilyChanges = function() {
    console.log('saveFamilyChanges called - פונקציה תטען בקרוב');
    if (typeof showToast === 'function') {
        showToast('פונקציה זו תטען בקרוב', 'info');
    }
};

window.saveRates = function() {
    console.log('saveRates called - פונקציה תטען בקרוב');
    if (typeof showToast === 'function') {
        showToast('פונקציה זו תטען בקרוב', 'info');
    }
};

window.exportDebtsToCSV = function() {
    console.log('exportDebtsToCSV called - פונקציה תטען בקרוב');
    if (typeof showToast === 'function') {
        showToast('פונקציה זו תטען בקרוב', 'info');
    }
};

window.showMonthlyDebtsReport = function() {
    console.log('showMonthlyDebtsReport called - פונקציה תטען בקרוב');
    if (typeof showToast === 'function') {
        showToast('פונקציה זו תטען בקרוב', 'info');
    }
};

window.markAllDebtsAsPaid = function() {
    console.log('markAllDebtsAsPaid called - פונקציה תטען בקרוב');
    if (typeof showToast === 'function') {
        showToast('פונקציה זו תטען בקרוב', 'info');
    }
};

// פונקציות עזר
window.updateFamilySelects = function() {
    const selects = ['familyName', 'familyFilter', 'reportFamily', 'debtFamilyFilter'];
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            // שמור את הערך הנוכחי
            const currentValue = select.value;
            
            // נקה אפשרויות קיימות (מלבד הראשונה)
            while (select.children.length > 1) {
                select.removeChild(select.lastChild);
            }
            
            // הוסף משפחות חדשות
            if (window.familyNames) {
                Array.from(window.familyNames).sort().forEach(familyName => {
                    const option = document.createElement('option');
                    option.value = familyName;
                    option.textContent = familyName;
                    select.appendChild(option);
                });
            }
            
            // החזר את הערך הנוכחי
            select.value = currentValue;
        }
    });
};

// Import the main app
import './app-main.js';