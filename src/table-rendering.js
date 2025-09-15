// רינדור טבלת רשומות
import { formatDateForDisplay } from './utils.js';

export function renderTable() {
    const recordsTableBody = document.getElementById('recordsTableBody');
    const familyFilterSelect = document.getElementById('familyFilter');
    
    if (!recordsTableBody) return;
    
    const selectedFamily = familyFilterSelect.value;
    recordsTableBody.innerHTML = '';
    let filteredRecords = selectedFamily ? window.records.filter(rec => rec.familyName === selectedFamily) : window.records;
    
    // מיון לפי תאריך קריאה - מהחדש לישן
    filteredRecords.sort((a, b) => new Date(b.readingDate) - new Date(a.readingDate));
    
    filteredRecords.forEach(record => {
        let rowClass = `border-b border-gray-200 hover:bg-gray-100 ${record.paid ? 'bg-green-50' : ''}`;
        const row = document.createElement('tr');
        row.className = rowClass;
        row.innerHTML = `
            <td class="py-3 px-6 text-sm whitespace-nowrap flex items-center gap-2" data-label="שם משפחה">
                <span class="inline-block w-3 h-3 rounded-full" style="background:${window.getFamilyColor(record.familyName)}"></span>
                ${record.familyName}
            </td>
            <td class="py-3 px-6 text-sm whitespace-nowrap" data-label="סוג חשבון">${record.billType}</td>
            <td class="py-3 px-6 text-sm whitespace-nowrap" data-label="תאריך קריאה">${formatDateForDisplay(record.readingDate)}</td>
            <td class="py-3 px-6 text-sm whitespace-nowrap" data-label="קריאה קודמת">${record.previousReading}</td>
            <td class="py-3 px-6 text-sm whitespace-nowrap" data-label="קריאה נוכחית">${record.currentReading}</td>
            <td class="py-3 px-6 text-sm whitespace-nowrap" data-label="הפרש שימוש">${Number(record.usage.toFixed(2))}</td>
            <td class="py-3 px-6 text-sm whitespace-nowrap" data-label="תעריף">${Number(record.rate.toFixed(2))} ₪</td>
            <td class="py-3 px-6 text-sm whitespace-nowrap" data-label="לתשלום">${Number(record.payment.toFixed(2))} ₪</td>
            <td class="py-3 px-6 text-sm whitespace-nowrap" data-label="שולם">
                <span class="inline-block px-3 py-1 text-xs font-semibold rounded-full ${record.paid ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}">
                    ${record.paid ? 'כן' : 'לא'}
                </span>
            </td>
            <td class="py-3 px-6 text-sm whitespace-nowrap" data-label="הערה">${record.note ? record.note : ''}</td>
            <td class="py-3 px-6 text-sm" data-label="פעולות">
                <div class="flex item-center justify-start space-x-2 rtl:space-x-reverse">
                    <button onclick="window.editRecord(${record.id}, event)" class="w-4 mr-2 transform hover:scale-110">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5 text-yellow-500">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                    <button onclick="window.togglePaid(${record.id})" class="w-4 mr-2 transform hover:scale-110">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5 text-blue-500">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                    <button onclick="window.deleteRecord(${record.id})" class="w-4 mr-2 transform hover:scale-110">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5 text-red-500">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </td>
        `;
        recordsTableBody.appendChild(row);
    });
    
    updateStatsCards();
}

export function updateStatsCards() {
    const total = window.records.length;
    const paid = window.records.filter(r => r.paid).length;
    const unpaid = total - paid;
    
    const statTotalRecords = document.getElementById('statTotalRecords');
    const statPaid = document.getElementById('statPaid');
    const statUnpaid = document.getElementById('statUnpaid');
    
    if (statTotalRecords) statTotalRecords.textContent = total;
    if (statPaid) statPaid.textContent = paid;
    if (statUnpaid) statUnpaid.textContent = unpaid;
}
