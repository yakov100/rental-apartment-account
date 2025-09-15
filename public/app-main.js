// אפליקציית ניהול חשבונות - קובץ ראשי
import { initDarkMode } from './utils.js';
import { initFamilyColors } from './family-colors.js';
import { 
    handleEmailLogin,
    handleEmailRegister,
    handleGoogleLogin,
    handleLogout,
    showRegisterForm,
    showLoginForm
} from './auth-handlers.js';
import { 
    updateUserUI,
    loadRecords
} from './user-management.js';
import { 
    addFamily,
    showAddFamilyModal,
    closeAddFamilyModal
} from './family-management.js';
import { 
    addOrUpdateRecord,
    editRecord,
    copyPreviousRecord,
    togglePaid,
    deleteRecord,
    openAddRecordModal,
    closeAddRecordModal
} from './record-management.js';
import { 
    showReportModal,
    closeReportModal
} from './reports.js';
import { 
    exportToCSV,
    backupData,
    restoreDataFromFile,
    checkUnpaidReminders
} from './data-export.js';

// אתחול משתנים גלובליים
window.records = [];
window.familyNames = new Set();

// פונקציות גלובליות לחיבור עם HTML
window.handleEmailLogin = handleEmailLogin;
window.handleEmailRegister = handleEmailRegister;
window.handleGoogleLogin = handleGoogleLogin;
window.handleLogout = handleLogout;
window.showRegisterForm = showRegisterForm;
window.showLoginForm = showLoginForm;
window.addFamily = addFamily;
window.showAddFamilyModal = showAddFamilyModal;
window.closeAddFamilyModal = closeAddFamilyModal;
window.addOrUpdateRecord = addOrUpdateRecord;
window.editRecord = editRecord;
window.copyPreviousRecord = copyPreviousRecord;
window.togglePaid = togglePaid;
window.deleteRecord = deleteRecord;
window.openAddRecordModal = openAddRecordModal;
window.closeAddRecordModal = closeAddRecordModal;
window.showReportModal = showReportModal;
window.closeReportModal = closeReportModal;
window.exportToCSV = exportToCSV;
window.backupData = backupData;
window.restoreDataFromFile = restoreDataFromFile;
window.updateUserUI = updateUserUI;

// אתחול
document.addEventListener('DOMContentLoaded', function() {
    initDarkMode();
    initFamilyColors();
    loadRecords();
    
    // Event listeners
    const familyFilterSelect = document.getElementById('familyFilter');
    if (familyFilterSelect) {
        familyFilterSelect.addEventListener('change', async () => {
            try {
                const tableModule = await import('./table-rendering.js');
                const chartsModule = await import('./charts.js');
                if (tableModule.renderTable) tableModule.renderTable();
                if (chartsModule.updateCharts) chartsModule.updateCharts();
            } catch (error) {
                console.warn('לא ניתן לטעון מודולי UI:', error);
            }
        });
    }
    
    setTimeout(checkUnpaidReminders, 1000);
    
    // פוקוס אוטומטי לשדה הראשון בטופס
    setTimeout(()=>{
        const familyNameSelect = document.getElementById('familyName');
        if(familyNameSelect) familyNameSelect.focus();
    }, 500);
});
