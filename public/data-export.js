// ייצוא ויבוא נתונים
import { formatDateForDisplay, showToast } from './utils.js';

export function exportToCSV() {
    if (!window.records.length) {
        showToast('אין נתונים לייצוא.', 'warning');
        return;
    }
    
    const headers = ['שם משפחה','סוג חשבון','תאריך קריאה','קריאה קודמת','קריאה נוכחית','הפרש שימוש','תעריף','לתשלום','שולם','הערה'];
    const rows = window.records.map(r => [
        r.familyName,
        r.billType,
        formatDateForDisplay(r.readingDate),
        r.previousReading,
        r.currentReading,
        r.usage,
        r.rate,
        r.payment,
        r.paid ? 'כן' : 'לא',
        r.note ? r.note.replace(/\n/g, ' ') : ''
    ]);
    
    let csvContent = '\uFEFF' + headers.join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.map(val => '"'+String(val).replace(/"/g,'""')+'"').join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'billing_records.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('נתונים נוספו לקובץ CSV בהצלחה!', 'success');
}

export function backupData() {
    const data = {
        records: window.records,
        familyNames: Array.from(window.familyNames)
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'billing_backup.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('נתונים נשמרו בהצלחה!', 'success');
}

export function restoreDataFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (Array.isArray(data.records) && Array.isArray(data.familyNames)) {
                window.records = data.records;
                window.familyNames = new Set(data.familyNames);
                
                // שמור נתונים
                if (window.firebaseData) {
                    window.firebaseData.saveRecords(window.records);
                    window.firebaseData.saveFamilies(window.familyNames);
                } else {
                    localStorage.setItem('billingRecords', JSON.stringify(window.records));
                    localStorage.setItem('familyNames', JSON.stringify(Array.from(window.familyNames)));
                }
                
                // עדכן UI
                if (window.populateFamilyNames) window.populateFamilyNames();
                if (window.populateFamilyFilter) window.populateFamilyFilter();
                if (window.renderTable) window.renderTable();
                if (window.updateCharts) window.updateCharts();
                
                showToast('הנתונים שוחזרו בהצלחה!');
            } else {
                showToast('קובץ לא תקין.', 'error');
            }
        } catch {
            showToast('שגיאה בקריאת הקובץ.', 'error');
        }
    };
    reader.readAsText(file);
}

export function checkUnpaidReminders() {
    const now = new Date();
    const overdue = window.records.filter(r => !r.paid && r.readingDate && ((now - new Date(r.readingDate)) > 1000*60*60*24*30));
    if (overdue.length > 0) {
        showToast(`לתשומת לבך: קיימים ${overdue.length} חשבונות שלא סומנו כשולמו, שמועד הקריאה שלהם עבר מעל 30 יום!`, 'warning');
    }
}
