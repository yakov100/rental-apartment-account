// ניהול רשומות צריכה - קובץ ראשי
export { 
    getRecords, 
    setRecords, 
    addOrUpdateRecord, 
    togglePaid, 
    deleteRecord 
} from './record-crud.js';

export { 
    editRecord, 
    copyPreviousRecord, 
    clearForm, 
    openAddRecordModal, 
    closeAddRecordModal 
} from './record-ui.js';