// CRUD operations for records
import { showToast } from './utils.js';
import { getRates } from './rates.js';

let records = [];

export function getRecords() {
    return records;
}

export function setRecords(newRecords) {
    records = newRecords;
}

export function addOrUpdateRecord() {
    const familyNameSelect = document.getElementById('familyName');
    const billType = document.getElementById('billType');
    const readingDate = document.getElementById('readingDate');
    const previousReading = document.getElementById('previousReading');
    const currentReading = document.getElementById('currentReading');
    const recordIdInput = document.getElementById('recordId');
    const noteInput = document.getElementById('note');

    if (!familyNameSelect.value || !billType.value || !readingDate.value || !previousReading.value || !currentReading.value) {
        showToast("אנא מלא את כל השדות.", 'warning');
        return;
    }
    
    const prev = parseFloat(previousReading.value);
    const curr = parseFloat(currentReading.value);
    const billTypeValue = billType.value;
    
    if (curr < prev) {
        showToast("הקריאה הנוכחית אינה יכולה להיות נמוכה מהקריאה הקודמת.", 'warning');
        return;
    }
    
    const rates = getRates();
    const recordId = recordIdInput.value;
    
    if (recordId) {
        const recordIndex = records.findIndex(rec => rec.id == recordId);
        if (recordIndex !== -1) {
            const existing = records[recordIndex];
            const r = (existing && existing.billType === billTypeValue && existing.rate != null && !isNaN(existing.rate))
                ? Number(existing.rate)
                : (rates[billTypeValue] || 0);
            const usage = curr - prev;
            const payment = usage * r;
            records[recordIndex] = {
                id: records[recordIndex].id,
                familyName: familyNameSelect.value,
                billType: billType.value,
                readingDate: readingDate.value,
                previousReading: prev,
                currentReading: curr,
                usage: usage,
                rate: r,
                payment: payment,
                paid: records[recordIndex].paid,
                note: noteInput.value
            };
        }
    } else {
        const r = rates[billTypeValue] || 0;
        const usage = curr - prev;
        const payment = usage * r;
        const newRecord = {
            id: Date.now(),
            familyName: familyNameSelect.value,
            billType: billType.value,
            readingDate: readingDate.value,
            previousReading: prev,
            currentReading: curr,
            usage: usage,
            rate: r,
            payment: payment,
            paid: false,
            note: noteInput.value
        };
        records.push(newRecord);
    }
    
    saveRecords();
    return true;
}

export function togglePaid(id) {
    const record = records.find(rec => rec.id === id);
    if (record) {
        record.paid = !record.paid;
        saveRecords();
        showToast(record.paid ? 'החשבון סומן כשולם!' : 'החשבון סומן כלא שולם.', 'success');
        return true;
    }
    return false;
}

export function deleteRecord(id) {
    const recordToDelete = records.find(rec => rec.id === id);
    if (recordToDelete) {
        if (confirm(`האם אתה בטוח שברצונך למחוק את הרשומה של ${recordToDelete.familyName} בתאריך ${formatDateForDisplay(recordToDelete.readingDate)}?`)) {
            records = records.filter(rec => rec.id !== id);
            saveRecords();
            showToast('הרשומה נמחקה בהצלחה!', 'success');
            return true;
        }
    }
    return false;
}

async function saveRecords() {
    if (window.firebaseData) {
        try {
            return true;
        } catch (error) {
            console.error('שגיאה בשמירה ב-Firebase:', error);
            localStorage.setItem('billingRecords', JSON.stringify(records));
        }
    } else {
        localStorage.setItem('billingRecords', JSON.stringify(records));
    }
}

// Import formatDateForDisplay from utils
function formatDateForDisplay(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('he-IL');
    } catch (e) {
        console.error('Error formatting date:', e);
        const parts = dateString.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateString;
    }
}
