// ניהול דוחות
import { months } from './utils.js';

export function showReportModal() {
    const reportModal = document.getElementById('reportModal');
    populateReportFilters();
    renderReportTable();
    reportModal.classList.remove('hidden');
    reportModal.classList.add('flex');
}

export function closeReportModal() {
    const reportModal = document.getElementById('reportModal');
    reportModal.classList.remove('flex');
    reportModal.classList.add('hidden');
}

export function populateReportFilters() {
    const reportFamily = document.getElementById('reportFamily');
    const reportYear = document.getElementById('reportYear');
    
    if (!reportFamily || !reportYear) return;
    
    // משפחות
    reportFamily.innerHTML = '<option value="">כל המשפחות</option>';
    window.familyNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        reportFamily.appendChild(option);
    });
    
    // שנים
    const years = Array.from(new Set(window.records.map(r => new Date(r.readingDate).getFullYear()))).filter(Boolean).sort();
    reportYear.innerHTML = '';
    years.forEach(y => {
        const option = document.createElement('option');
        option.value = y;
        option.textContent = y;
        reportYear.appendChild(option);
    });
    
    // ברירת מחדל: שנה אחרונה
    if (years.length) reportYear.value = years[years.length-1];
}

export function renderReportTable() {
    const reportTableContainer = document.getElementById('reportTableContainer');
    const reportFamily = document.getElementById('reportFamily');
    const reportBillType = document.getElementById('reportBillType');
    const reportYear = document.getElementById('reportYear');
    
    if (!reportTableContainer) return;
    
    const family = reportFamily.value;
    const billType = reportBillType.value;
    const year = reportYear.value;
    
    // סנן נתונים
    let filtered = window.records.filter(r => {
        const rYear = new Date(r.readingDate).getFullYear();
        return (!family || r.familyName === family) && (!billType || r.billType === billType) && (!year || String(rYear) === year);
    });
    
    // קיבוץ לפי חודש
    const grouped = {};
    filtered.forEach(r => {
        const d = new Date(r.readingDate);
        const m = d.getMonth();
        if (!grouped[m]) grouped[m] = [];
        grouped[m].push(r);
    });
    
    // טבלה
    let html = '<table class="w-full text-right border-collapse"><thead><tr>';
    html += '<th class="py-2 px-4">חודש</th>';
    html += '<th class="py-2 px-4">סה"כ צריכה</th>';
    html += '<th class="py-2 px-4">סה"כ לתשלום</th>';
    html += '<th class="py-2 px-4">סה"כ ששולם</th>';
    html += '<th class="py-2 px-4">מספר רשומות</th>';
    html += '</tr></thead><tbody>';
    
    for (let i=0; i<12; i++) {
        const arr = grouped[i] || [];
        const usage = arr.reduce((sum, r) => sum + (r.usage||0), 0);
        const payment = arr.reduce((sum, r) => sum + (r.payment||0), 0);
        const paid = arr.filter(r=>r.paid).reduce((sum, r) => sum + (r.payment||0), 0);
        html += `<tr><td class="py-2 px-4">${months[i]}</td><td class="py-2 px-4">${usage.toFixed(2)}</td><td class="py-2 px-4">${payment.toFixed(2)}</td><td class="py-2 px-4">${paid.toFixed(2)}</td><td class="py-2 px-4">${arr.length}</td></tr>`;
    }
    
    html += '</tbody></table>';
    reportTableContainer.innerHTML = html;
}

export function setupReportEventListeners() {
    const reportFamily = document.getElementById('reportFamily');
    const reportBillType = document.getElementById('reportBillType');
    const reportYear = document.getElementById('reportYear');
    
    if (reportFamily && reportBillType && reportYear) {
        reportFamily.addEventListener('change', renderReportTable);
        reportBillType.addEventListener('change', renderReportTable);
        reportYear.addEventListener('change', renderReportTable);
    }
}
