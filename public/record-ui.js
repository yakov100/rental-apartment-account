// UI operations for records
import { showToast } from './utils.js';
import { getRecords } from './record-crud.js';

export function editRecord(id, ev) {
    const records = getRecords();
    const recordToEdit = records.find(rec => rec.id === id);
    if (recordToEdit) {
        openAddRecordModal();
        const recordIdInput = document.getElementById('recordId');
        const familyNameSelect = document.getElementById('familyName');
        const billType = document.getElementById('billType');
        const readingDate = document.getElementById('readingDate');
        const previousReading = document.getElementById('previousReading');
        const currentReading = document.getElementById('currentReading');
        const noteInput = document.getElementById('note');
        
        recordIdInput.value = recordToEdit.id;
        familyNameSelect.value = recordToEdit.familyName;
        billType.value = recordToEdit.billType;
        readingDate.value = recordToEdit.readingDate;
        previousReading.value = recordToEdit.previousReading;
        currentReading.value = recordToEdit.currentReading;
        noteInput.value = recordToEdit.note || '';
        
        const formEl = document.getElementById('recordForm');
        if (formEl) formEl.scrollIntoView({behavior:'smooth', block:'center'});
        setTimeout(()=>familyNameSelect && familyNameSelect.focus(), 400);
        
        if (ev) {
            const thisBtn = ev.target && ev.target.closest && ev.target.closest('button');
            if (thisBtn) {
                thisBtn.classList.add('ring-2','ring-yellow-400');
                setTimeout(()=>thisBtn.classList.remove('ring-2','ring-yellow-400'), 800);
            }
        }
    }
}

export function copyPreviousRecord() {
    const records = getRecords();
    const familyNameSelect = document.getElementById('familyName');
    const billType = document.getElementById('billType');
    const previousReading = document.getElementById('previousReading');
    const noteInput = document.getElementById('note');
    
    if (!familyNameSelect.value || !billType.value) {
        showToast('יש לבחור משפחה וסוג חשבון לפני העתקה.', 'warning');
        return;
    }
    
    const filteredRecords = records.filter(rec => rec.familyName === familyNameSelect.value && rec.billType === billType.value);
    if (filteredRecords.length === 0) {
        showToast('לא נמצאה רשומה קודמת למשפחה וסוג חשבון אלה.', 'warning');
        return;
    }
    
    filteredRecords.sort((a, b) => new Date(b.readingDate) - new Date(a.readingDate));
    const lastRecord = filteredRecords[0];
    previousReading.value = lastRecord.currentReading;
    noteInput.value = lastRecord.note || '';
}

export function clearForm() {
    const recordIdInput = document.getElementById('recordId');
    const familyNameSelect = document.getElementById('familyName');
    const billType = document.getElementById('billType');
    const readingDate = document.getElementById('readingDate');
    const previousReading = document.getElementById('previousReading');
    const currentReading = document.getElementById('currentReading');
    const noteInput = document.getElementById('note');
    
    recordIdInput.value = '';
    familyNameSelect.value = '';
    billType.value = 'חשמל';
    readingDate.value = '';
    previousReading.value = '';
    currentReading.value = '';
    noteInput.value = '';
}

export function openAddRecordModal() {
    const addRecordModal = document.getElementById('addRecordModal');
    addRecordModal.classList.remove('hidden');
    addRecordModal.classList.add('flex');
    setTimeout(()=>{
        const familyNameSelect = document.getElementById('familyName');
        if(familyNameSelect) familyNameSelect.focus();
    }, 300);
}

export function closeAddRecordModal() {
    const addRecordModal = document.getElementById('addRecordModal');
    addRecordModal.classList.remove('flex');
    addRecordModal.classList.add('hidden');
    clearForm();
}
