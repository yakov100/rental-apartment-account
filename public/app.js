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

// פונקציות placeholder עד שנטען הקוד המלא
window.showAddFamilyModal = function() {
    console.log('showAddFamilyModal called');
};

window.closeAddFamilyModal = function() {
    console.log('closeAddFamilyModal called');
};

window.showEditFamilyModal = function() {
    console.log('showEditFamilyModal called');
};

window.closeEditFamilyModal = function() {
    console.log('closeEditFamilyModal called');
};

window.showReportModal = function() {
    console.log('showReportModal called');
};

window.closeReportModal = function() {
    console.log('closeReportModal called');
};

window.showDebtsModal = function() {
    console.log('showDebtsModal called');
};

window.closeDebtsModal = function() {
    console.log('closeDebtsModal called');
};

window.showRatesModal = function() {
    console.log('showRatesModal called');
};

window.closeRatesModal = function() {
    console.log('closeRatesModal called');
};

window.openAddRecordModal = function() {
    console.log('openAddRecordModal called');
};

window.closeAddRecordModal = function() {
    console.log('closeAddRecordModal called');
};

window.addOrUpdateRecord = function() {
    console.log('addOrUpdateRecord called');
};

window.clearForm = function() {
    console.log('clearForm called');
};

window.copyPreviousRecord = function() {
    console.log('copyPreviousRecord called');
};

window.exportToCSV = function() {
    console.log('exportToCSV called');
};

window.addFamily = function() {
    console.log('addFamily called');
};

window.handleEmailLogin = function() {
    console.log('handleEmailLogin called');
};

window.handleEmailRegister = function() {
    console.log('handleEmailRegister called');
};

window.handleGoogleLogin = function() {
    console.log('handleGoogleLogin called');
};

window.handleLogout = function() {
    console.log('handleLogout called');
};

window.showRegisterForm = function() {
    console.log('showRegisterForm called');
};

window.showLoginForm = function() {
    console.log('showLoginForm called');
};

// Import the main app
import './app-main.js';