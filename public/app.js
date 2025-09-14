const recordsTableBody = document.getElementById('recordsTableBody');
const familyNameSelect = document.getElementById('familyName');
const billType = document.getElementById('billType');
const readingDate = document.getElementById('readingDate');
const previousReading = document.getElementById('previousReading');
const currentReading = document.getElementById('currentReading');
// const rate = document.getElementById('rate'); // הוסר - חישוב אוטומטי
const recordIdInput = document.getElementById('recordId');
const newFamilyNameInput = document.getElementById('newFamilyNameInput');
const newFamilyEntryDateInput = document.getElementById('newFamilyEntryDateInput');
const newFamilyPhonesInput = document.getElementById('newFamilyPhonesInput');
const newFamilyEmailInput = document.getElementById('newFamilyEmailInput');
const familyFilterSelect = document.getElementById('familyFilter');
const noteInput = document.getElementById('note');
// const searchInput = document.getElementById('searchInput'); // הוסר חיפוש חופשי
const reportModal = document.getElementById('reportModal');
const reportFamily = document.getElementById('reportFamily');
const reportBillType = document.getElementById('reportBillType');
const reportYear = document.getElementById('reportYear');
const reportTableContainer = document.getElementById('reportTableContainer');
const addRecordModal = document.getElementById('addRecordModal');
const fabAddRecord = document.getElementById('fabAddRecord');

let records = [];
let familyNames = new Set();
let familyProfiles = {};
let electricChart, waterChart;
let paymentChart;
let currentUser = null;
let isOfflineMode = false;
let isAdmin = false;

const months = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

// הגדרות תעריפים
let rates = {
    חשמל: 0.6,
    מים: 7,
    ארנונה: 50
};

// צבעים למשפחות
const familyColors = {};
const colorPalette = [
    '#3b82f6', '#22c55e', '#f59e42', '#e11d48', '#a21caf', '#fbbf24', '#0ea5e9', '#14b8a6', '#6366f1', '#f43f5e', '#84cc16', '#f472b6', '#facc15', '#7c3aed', '#06b6d4', '#eab308', '#d97706', '#be185d', '#059669', '#b91c1c'
];
function getFamilyColor(name) {
    if (!name) return '#d1d5db';
    if (familyColors[name]) return familyColors[name];
    // טען מה-localStorage אם קיים
    const stored = JSON.parse(localStorage.getItem('familyColors')||'{}');
    if (stored[name]) {
        familyColors[name] = stored[name];
        return familyColors[name];
    }
    // בחר צבע חדש
    const used = Object.values(familyColors);
    const available = colorPalette.filter(c=>!used.includes(c));
    const color = available.length ? available[0] : colorPalette[Math.floor(Math.random()*colorPalette.length)];
    familyColors[name] = color;
    // שמור ב-localStorage
    localStorage.setItem('familyColors', JSON.stringify(familyColors));
    // שמור גם ב-Firebase אם אפשר
    if (currentUser && window.firebaseData && window.firebaseData.saveFamilyColors) {
        try { window.firebaseData.saveFamilyColors(familyColors); } catch(e) { console.warn('שמירת צבעי משפחות ל-Firebase נכשלה:', e); }
    }
    return color;
}

function showToast(message, type = 'info') {
    let toast = document.createElement('div');
    toast.className = `fixed top-6 right-6 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-semibold text-lg animate-fade-in-up transition-all duration-300 ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-yellow-500 text-gray-900' : 'bg-blue-500'}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-4');
        setTimeout(() => toast.remove(), 600);
    }, 2600);
}

function closeModal() {
    document.getElementById('messageModal').classList.remove('flex');
    document.getElementById('messageModal').classList.add('hidden');
}

function showAddFamilyModal() {
    document.getElementById('addFamilyModal').classList.remove('hidden');
    document.getElementById('addFamilyModal').classList.add('flex');
}

function closeAddFamilyModal() {
    document.getElementById('addFamilyModal').classList.remove('flex');
    document.getElementById('addFamilyModal').classList.add('hidden');
    newFamilyNameInput.value = '';
    if (newFamilyEntryDateInput) newFamilyEntryDateInput.value = '';
    if (newFamilyPhonesInput) newFamilyPhonesInput.value = '';
    if (newFamilyEmailInput) newFamilyEmailInput.value = '';
}

function addFamily() {
    const name = newFamilyNameInput.value.trim();
    const entryDate = newFamilyEntryDateInput ? (newFamilyEntryDateInput.value || '') : '';
    const phones = newFamilyPhonesInput ? (newFamilyPhonesInput.value || '') : '';
    const email = newFamilyEmailInput ? (newFamilyEmailInput.value || '') : '';
    const phoneList = phones.split(/[;,]+/).map(s => s.trim()).filter(Boolean);
    if (name && !familyNames.has(name)) {
        familyNames.add(name);
        saveFamilyNames();
        // שמירת פרטי משפחה
        familyProfiles[name] = { entryDate, phones: phoneList, email };
        saveFamilyProfiles();
        populateFamilyNames();
        populateFamilyFilter();
        closeAddFamilyModal();
        showToast('משפחה חדשה נוספה בהצלחה!', 'success');
    } else if (familyNames.has(name)) {
        showToast("שם המשפחה כבר קיים.", 'warning');
    }
}

function populateFamilyNames() {
    familyNameSelect.innerHTML = '<option value="">בחר שם משפחה</option>';
    familyNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.innerHTML = `<span style='display:inline-block;width:1em;height:1em;border-radius:50%;background:${getFamilyColor(name)};margin-left:0.5em;vertical-align:middle'></span>${name}`;
        familyNameSelect.appendChild(option);
    });
}

function populateFamilyFilter() {
    familyFilterSelect.innerHTML = '<option value="">הכל</option>';
    familyNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        familyFilterSelect.appendChild(option);
    });
}

function openAddRecordModal() {
    addRecordModal.classList.remove('hidden');
    addRecordModal.classList.add('flex');
    setTimeout(()=>{
        if(familyNameSelect) familyNameSelect.focus();
    }, 300);
}
function closeAddRecordModal() {
    addRecordModal.classList.remove('flex');
    addRecordModal.classList.add('hidden');
    clearForm();
}

function addOrUpdateRecord() {
    if (!familyNameSelect.value || !billType.value || !readingDate.value || !previousReading.value || !currentReading.value) {
        showToast("אנא מלא את כל השדות.", 'warning');
        return;
    }
    const prev = parseFloat(previousReading.value);
    const curr = parseFloat(currentReading.value);
    const billTypeValue = billType.value;
    const r = rates[billTypeValue] || 0;
    if (curr < prev) {
        showToast("הקריאה הנוכחית אינה יכולה להיות נמוכה מהקריאה הקודמת.", 'warning');
        return;
    }
    const usage = curr - prev;
    const payment = usage * r;
    const recordId = recordIdInput.value;
    let savedRecord = null;
    if (recordId) {
        const recordIndex = records.findIndex(rec => rec.id == recordId);
        if (recordIndex !== -1) {
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
            savedRecord = records[recordIndex];
        }
    } else {
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
        savedRecord = newRecord;
    }
    // שמירה ל-Firebase (לפי רשומה) אם אפשר
    if (savedRecord && currentUser && window.firebaseData && window.firebaseData.saveRecord) {
        try { window.firebaseData.saveRecord(savedRecord); } catch(e) { console.error('שגיאה בשמירת רשומה ל-Firebase:', e); }
    }
    saveRecords();
    renderTable();
    updateCharts();
    closeAddRecordModal();
    showToast('הרשומה נשמרה בהצלחה!', 'success');
}

function editRecord(id, ev) {
    const recordToEdit = records.find(rec => rec.id === id);
    if (recordToEdit) {
        openAddRecordModal();
        recordIdInput.value = recordToEdit.id;
        familyNameSelect.value = recordToEdit.familyName;
        billType.value = recordToEdit.billType;
        readingDate.value = recordToEdit.readingDate;
        previousReading.value = recordToEdit.previousReading;
        currentReading.value = recordToEdit.currentReading;
        // rate.value = recordToEdit.rate; // הוסר - חישוב אוטומטי
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

function copyPreviousRecord() {
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
    // rate.value = lastRecord.rate; // הוסר - חישוב אוטומטי
    noteInput.value = lastRecord.note || '';
    // לא נעתיק תאריך וקריאה נוכחית
}

function clearForm() {
    recordIdInput.value = '';
    familyNameSelect.value = '';
    billType.value = 'חשמל';
    readingDate.value = '';
    previousReading.value = '';
    currentReading.value = '';
    noteInput.value = '';
}

function togglePaid(id) {
    if (!isAdmin) { showToast('פעולה למנהל בלבד', 'warning'); return; }
    const record = records.find(rec => rec.id === id);
    if (record) {
        record.paid = !record.paid;
        if (currentUser && window.firebaseData && window.firebaseData.saveRecord) {
            try { window.firebaseData.saveRecord(record); } catch(e) { console.error('שגיאה בעדכון סטטוס תשלום ב-Firebase:', e); }
        }
        saveRecords();
        renderTable();
        updateCharts();
        showToast(record.paid ? 'החשבון סומן כשולם!' : 'החשבון סומן כלא שולם.', 'success');
    }
}

function deleteRecord(id) {
    if (!isAdmin) { showToast('פעולה למנהל בלבד', 'warning'); return; }
    const recordToDelete = records.find(rec => rec.id === id);
    if (recordToDelete) {
        if (confirm(`האם אתה בטוח שברצונך למחוק את הרשומה של ${recordToDelete.familyName} בתאריך ${recordToDelete.readingDate}?`)) {
            if (currentUser && window.firebaseData && window.firebaseData.deleteRecord) {
                try { window.firebaseData.deleteRecord(id); } catch(e) { console.error('שגיאה במחיקת רשומה מ-Firebase:', e); }
            }
            records = records.filter(rec => rec.id !== id);
            saveRecords();
            renderTable();
            updateCharts();
            showToast('הרשומה נמחקה בהצלחה!', 'success');
        }
    }
}

function renderTable() {
    const selectedFamily = familyFilterSelect.value;
    recordsTableBody.innerHTML = '';
    let filteredRecords = selectedFamily ? records.filter(rec => rec.familyName === selectedFamily) : records;
    
    // מיון לפי תאריך קריאה - מהחדש ליישן
    filteredRecords.sort((a, b) => new Date(b.readingDate) - new Date(a.readingDate));
    filteredRecords.forEach(record => {
        let rowClass = `border-b border-gray-200 hover:bg-gray-100 ${record.paid ? 'bg-green-50' : ''}`;
        const row = document.createElement('tr');
        row.className = rowClass;
        row.innerHTML = `
            <td class="py-3 px-6 text-sm whitespace-nowrap flex items-center gap-2" data-label="שם משפחה">
                <span class="inline-block w-3 h-3 rounded-full" style="background:${getFamilyColor(record.familyName)}"></span>
                ${record.familyName}
            </td>
            <td class="py-3 px-6 text-sm whitespace-nowrap" data-label="סוג חשבון">${record.billType}</td>
            <td class="py-3 px-6 text-sm whitespace-nowrap" data-label="תאריך קריאה">${record.readingDate}</td>
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
                    <button onclick="editRecord(${record.id}, event)" class="w-4 mr-2 transform hover:scale-110">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5 text-yellow-500">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                    ${isAdmin ? `
                    <button onclick="togglePaid(${record.id})" class="w-4 mr-2 transform hover:scale-110">
                        <svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" class=\"w-5 h-5 text-blue-500\">
                            <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z\" />
                        </svg>
                    </button>
                    <button onclick="deleteRecord(${record.id})" class="w-4 mr-2 transform hover:scale-110">
                        <svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" class=\"w-5 h-5 text-red-500\">
                            <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16\" />
                        </svg>
                    </button>
                    ` : ''}
                </div>
            </td>
        `;
        recordsTableBody.appendChild(row);
    });
    updateStatsCards();
}

function updateCharts() {
    const electricData = {};
    const waterData = {};
    const paymentData = {};
    const filteredRecords = familyFilterSelect.value ? records.filter(rec => rec.familyName === familyFilterSelect.value) : records;
    filteredRecords.forEach(record => {
        const date = new Date(record.readingDate);
        const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
        if (record.billType === 'חשמל') {
            electricData[monthYear] = (electricData[monthYear] || 0) + record.usage;
        } else if (record.billType === 'מים') {
            waterData[monthYear] = (waterData[monthYear] || 0) + record.usage;
        }
        if (record.paid) {
            paymentData[monthYear] = (paymentData[monthYear] || 0) + record.payment;
        }
    });
    // Electric Chart
    if (electricChart) electricChart.destroy();
    electricChart = new Chart(document.getElementById('electricChart'), {
        type: 'bar',
        data: {
            labels: Object.keys(electricData).sort().map(key => {
                const [year, month] = key.split('-');
                return `${months[parseInt(month)]} ${year}`;
            }),
            datasets: [{
                label: 'צריכה בקוט"ש',
                data: Object.keys(electricData).sort().map(key => electricData[key].toFixed(2)),
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
    // Water Chart
    if (waterChart) waterChart.destroy();
    waterChart = new Chart(document.getElementById('waterChart'), {
        type: 'bar',
        data: {
            labels: Object.keys(waterData).sort().map(key => {
                const [year, month] = key.split('-');
                return `${months[parseInt(month)]} ${year}`;
            }),
            datasets: [{
                label: 'צריכה במ"ק',
                data: Object.keys(waterData).sort().map(key => waterData[key].toFixed(2)),
                backgroundColor: 'rgba(34, 197, 94, 0.6)',
                borderColor: 'rgba(34, 197, 94, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
    // Payment Chart
    if (paymentChart) paymentChart.destroy();
    paymentChart = new Chart(document.getElementById('paymentChart'), {
        type: 'bar',
        data: {
            labels: Object.keys(paymentData).sort().map(key => {
                const [year, month] = key.split('-');
                return `${months[parseInt(month)]} ${year}`;
            }),
            datasets: [{
                label: 'סך תשלומים ששולמו',
                data: Object.keys(paymentData).sort().map(key => paymentData[key].toFixed(2)),
                backgroundColor: 'rgba(251, 191, 36, 0.6)',
                borderColor: 'rgba(251, 191, 36, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}

async function saveRecords() {
    if (currentUser && window.firebaseData) {
        // שמור ב-Firebase
        try {
            // לא צריך לשמור את כל הרשומות פעם אחת - כל רשומה נשמרת בנפרד
            return true;
        } catch (error) {
            console.error('שגיאה בשמירה ב-Firebase:', error);
            // fallback ל-localStorage
            localStorage.setItem('billingRecords', JSON.stringify(records));
        }
    } else {
        // שמור ב-localStorage (מצב אופליין)
        localStorage.setItem('billingRecords', JSON.stringify(records));
    }
}

async function saveFamilyNames() {
    if (currentUser && window.firebaseData) {
        try {
            await window.firebaseData.saveFamilies(familyNames);
        } catch (error) {
            console.error('שגיאה בשמירת משפחות ב-Firebase:', error);
            localStorage.setItem('familyNames', JSON.stringify(Array.from(familyNames)));
        }
    } else {
        localStorage.setItem('familyNames', JSON.stringify(Array.from(familyNames)));
    }
}

function saveFamilyProfiles() {
    try {
        localStorage.setItem('familyProfiles', JSON.stringify(familyProfiles));
    } catch (e) {
        console.error('שגיאה בשמירת פרטי משפחות באחסון המקומי:', e);
    }
    if (currentUser && window.firebaseData && window.firebaseData.saveFamilyProfiles) {
        window.firebaseData.saveFamilyProfiles(familyProfiles).catch(err => console.error('שגיאה בשמירת פרטי משפחות ל-Firebase:', err));
    }
}

// פונקציות Firebase Authentication
async function handleEmailLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showToast('אנא מלא את כל השדות', 'warning');
        return;
    }
    
    try {
        if (!window.firebaseAuth) {
            showToast('שירות ההתחברות אינו זמין כרגע. אנא ודא שFirebase מוגדר נכון.', 'error');
            return;
        }
        await window.firebaseAuth.signInWithEmailAndPassword(email, password);
        showToast('התחברת בהצלחה!', 'success');
        hideAuthModal();
        // טען פרופילי משפחות מהענן
        try {
            if (window.firebaseData && window.firebaseData.getFamilyProfiles) {
                const profiles = await window.firebaseData.getFamilyProfiles();
                if (profiles && typeof profiles === 'object') {
                    familyProfiles = profiles;
                    saveFamilyProfiles();
                }
            }
        } catch (e) { console.warn('טעינת פרופילי משפחות נכשלה:', e); }
    } catch (error) {
        console.error('Login error:', error);
        showToast('שגיאה בהתחברות: ' + (error.message || error), 'error');
    }
}

async function handleEmailRegister() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!email || !password || !confirmPassword) {
        showToast('אנא מלא את כל השדות', 'warning');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('הסיסמאות אינן תואמות', 'warning');
        return;
    }
    
    if (password.length < 6) {
        showToast('הסיסמה חייבת להכיל לפחות 6 תווים', 'warning');
        return;
    }
    
    try {
        if (!window.firebaseAuth) {
            showToast('שירות ההרשמה אינו זמין כרגע. אנא ודא שFirebase מוגדר נכון.', 'error');
            return;
        }
        await window.firebaseAuth.createUserWithEmailAndPassword(email, password);
        showToast('נרשמת בהצלחה!', 'success');
        hideAuthModal();
    } catch (error) {
        console.error('Register error:', error);
        showToast('שגיאה בהרשמה: ' + (error.message || error), 'error');
    }
}

async function handleGoogleLogin() {
    try {
        if (!window.firebaseAuth) {
            showToast('שירות Google Sign-in אינו זמין כרגע. אנא ודא שFirebase מוגדר נכון.', 'error');
            return;
        }
        const provider = new firebase.auth.GoogleAuthProvider();
        await window.firebaseAuth.signInWithPopup(provider);
        showToast('התחברת עם Google בהצלחה!', 'success');
        hideAuthModal();
        try {
            if (window.firebaseData && window.firebaseData.getFamilyProfiles) {
                const profiles = await window.firebaseData.getFamilyProfiles();
                if (profiles && typeof profiles === 'object') {
                    familyProfiles = profiles;
                    saveFamilyProfiles();
                }
            }
        } catch (e) { console.warn('טעינת פרופילי משפחות נכשלה:', e); }
    } catch (error) {
        console.error('Google login error:', error);
        showToast('שגיאה בהתחברות Google: ' + (error.message || error), 'error');
    }
}

async function handleLogout() {
    try {
        if (window.firebaseAuth) {
            await window.firebaseAuth.signOut();
            showToast('התנתקת בהצלחה', 'success');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showToast('שגיאה בהתנתקות: ' + error.message, 'error');
    }
}

function showRegisterForm() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('authModalTitle').textContent = 'הרשמה למערכת';
}

function showLoginForm() {
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('authModalTitle').textContent = 'התחברות למערכת';
}

function showAuthModal() {
    const authModal = document.getElementById('authModal');
    authModal.classList.remove('hidden');
    authModal.classList.add('flex');
    showLoginForm(); // מתחיל במסך התחברות
}

function hideAuthModal() {
    const authModal = document.getElementById('authModal');
    authModal.classList.add('hidden');
    authModal.classList.remove('flex');
}

// עדכון UI עבור משתמש מחובר
function updateUserUI(user) {
    const userInfoBar = document.getElementById('userInfoBar');
    const authModal = document.getElementById('authModal');
    const loginButton = document.getElementById('loginButton');
    
    if (user) {
        currentUser = user;
        
        // הצג פרטי משתמש
        document.getElementById('userDisplayName').textContent = 
            user.displayName || user.email || 'משתמש';
        document.getElementById('userAvatar').src = 
            user.photoURL || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Im0zIDlsOS03IDkgN3YxMWwtOS05di0yeiIvPjwvc3ZnPg==';
        
        // הסתר כפתור התחברות
        if (loginButton) {
            loginButton.classList.add('hidden');
        }
        
        userInfoBar.classList.remove('hidden');
        authModal.classList.add('hidden');
        authModal.classList.remove('flex');
        
        // טען נתונים
        loadUserData();
        // טען גם פרופילי משפחות מהענן
        (async ()=>{
            try {
                if (window.firebaseData && window.firebaseData.getFamilyProfiles) {
                    const profiles = await window.firebaseData.getFamilyProfiles();
                    if (profiles && typeof profiles === 'object') {
                        familyProfiles = profiles;
                        saveFamilyProfiles();
                    }
                }
            } catch (e) { console.warn('טעינת פרופילי משפחות נכשלה:', e); }
        })();
    } else {
        currentUser = null;
        
        // הצג כפתור התחברות
        if (loginButton) {
            loginButton.classList.remove('hidden');
        }
        
        userInfoBar.classList.add('hidden');
        authModal.classList.remove('hidden');
        authModal.classList.add('flex');
        
        // נקה נתונים
        records = [];
        familyNames = new Set();
        rates = { חשמל: 0.6, מים: 7, ארנונה: 50 };
        renderTable();
        updateCharts();
    }
}

// טעינת נתונים מ-Firebase
async function loadUserData() {
    if (!currentUser) return;
    try {
        showToast('טוען נתונים...', 'info');
        if (!window.firebaseData) {
            console.warn('firebaseData לא זמין - מעבר לטעינה מקומית');
            loadFromLocalStorage();
            return;
        }
        // טען נתונים מהענן
        const [firebaseRecords, firebaseFamilies, firebaseRates, firebaseColors] = await Promise.all([
            window.firebaseData.getRecords ? window.firebaseData.getRecords() : [],
            window.firebaseData.getFamilies ? window.firebaseData.getFamilies() : new Set(),
            window.firebaseData.getRates ? window.firebaseData.getRates() : { חשמל: 0.6, מים: 7, ארנונה: 50 },
            window.firebaseData.getFamilyColors ? window.firebaseData.getFamilyColors() : {}
        ]);
        const profiles = window.firebaseData.getFamilyProfiles ? await window.firebaseData.getFamilyProfiles() : {};
        
        records = firebaseRecords || [];
        familyNames = firebaseFamilies || new Set();
        rates = firebaseRates || { חשמל: 0.6, מים: 7, ארנונה: 50 };
        if (firebaseColors) Object.assign(familyColors, firebaseColors);
        if (profiles && typeof profiles === 'object') familyProfiles = profiles;
        
        // עדכן UI
        populateFamilyNames();
        populateFamilyFilter();
        renderTable();
        updateCharts();
        updateStatsCards();
        
        // עדכן מטמונים מקומיים
        localStorage.setItem('billingRecords', JSON.stringify(records));
        localStorage.setItem('familyNames', JSON.stringify(Array.from(familyNames)));
        localStorage.setItem('rates', JSON.stringify(rates));
        localStorage.setItem('familyColors', JSON.stringify(familyColors));
        localStorage.setItem('familyProfiles', JSON.stringify(familyProfiles));
        
        // מעקב בזמן אמת
        startRealtimeUpdates();
        
        showToast('נתונים נטענו בהצלחה!', 'success');
    } catch (error) {
        console.error('שגיאה בטעינת נתונים:', error);
        showToast('שגיאה בטעינת נתונים - מעבר למצב אופליין', 'warning');
        isOfflineMode = true;
        loadFromLocalStorage();
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
        records = updatedRecords;
        renderTable();
        updateCharts();
        updateStatsCards();
    });
}

function loadRecords() {
    if (currentUser) {
        loadUserData();
    } else {
        loadFromLocalStorage();
    }
}

function loadFromLocalStorage() {
    loadRates();
    const storedRecords = localStorage.getItem('billingRecords');
    if (storedRecords) records = JSON.parse(storedRecords);
    const storedFamilyNames = localStorage.getItem('familyNames');
    if (storedFamilyNames) familyNames = new Set(JSON.parse(storedFamilyNames));
    const storedFamilyProfiles = localStorage.getItem('familyProfiles');
    if (storedFamilyProfiles) {
        try { familyProfiles = JSON.parse(storedFamilyProfiles) || {}; } catch { familyProfiles = {}; }
    }
    populateFamilyNames();
    populateFamilyFilter();
    renderTable();
    updateCharts();
}

function showReportModal() {
    populateReportFilters();
    renderReportTable();
    reportModal.classList.remove('hidden');
    reportModal.classList.add('flex');
}
function closeReportModal() {
    reportModal.classList.remove('flex');
    reportModal.classList.add('hidden');
}
function populateReportFilters() {
    // משפחות
    reportFamily.innerHTML = '<option value="">כל המשפחות</option>';
    familyNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        reportFamily.appendChild(option);
    });
    // שנים
    const years = Array.from(new Set(records.map(r => new Date(r.readingDate).getFullYear()))).filter(Boolean).sort();
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
if (reportFamily && reportBillType && reportYear) {
    reportFamily.addEventListener('change', renderReportTable);
    reportBillType.addEventListener('change', renderReportTable);
    reportYear.addEventListener('change', renderReportTable);
}
function renderReportTable() {
    if (!reportTableContainer) return;
    const family = reportFamily.value;
    const billType = reportBillType.value;
    const year = reportYear.value;
    // סנן נתונים
    let filtered = records.filter(r => {
        const rYear = new Date(r.readingDate).getFullYear();
        return (!family || r.familyName === family) && (!billType || r.billType === billType) && (!year || String(rYear) === year);
    });
    // קיבוץ לפי חודש
    const monthsArr = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
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
        html += `<tr><td class="py-2 px-4">${monthsArr[i]}</td><td class="py-2 px-4">${usage.toFixed(2)}</td><td class="py-2 px-4">${payment.toFixed(2)}</td><td class="py-2 px-4">${paid.toFixed(2)}</td><td class="py-2 px-4">${arr.length}</td></tr>`;
    }
    html += '</tbody></table>';
    reportTableContainer.innerHTML = html;
}

function exportToCSV() {
    if (!records.length) {
        showToast('אין נתונים לייצוא.', 'warning');
        return;
    }
    const headers = ['שם משפחה','סוג חשבון','תאריך קריאה','קריאה קודמת','קריאה נוכחית','הפרש שימוש','תעריף','לתשלום','שולם','הערה'];
    const rows = records.map(r => [
        r.familyName,
        r.billType,
        r.readingDate,
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

function backupData() {
    const data = {
        records,
        familyNames: Array.from(familyNames),
        familyProfiles
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
function restoreDataFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (Array.isArray(data.records) && Array.isArray(data.familyNames)) {
                records = data.records;
                familyNames = new Set(data.familyNames);
                if (data.familyProfiles && typeof data.familyProfiles === 'object') {
                    familyProfiles = data.familyProfiles;
                    saveFamilyProfiles();
                }
                saveRecords();
                saveFamilyNames();
                populateFamilyNames();
                populateFamilyFilter();
                renderTable();
                updateCharts();
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

function checkUnpaidReminders() {
    const now = new Date();
    const overdue = records.filter(r => !r.paid && r.readingDate && ((now - new Date(r.readingDate)) > 1000*60*60*24*30));
    if (overdue.length > 0) {
        showToast(`לתשומת לבך: קיימים ${overdue.length} חשבונות שלא סומנו כשולמו, שמועד הקריאה שלהם עבר מעל 30 יום!`, 'warning');
    }
}

function updateStatsCards() {
    const total = records.length;
    const paid = records.filter(r => r.paid).length;
    const unpaid = total - paid;
    document.getElementById('statTotalRecords').textContent = total;
    document.getElementById('statPaid').textContent = paid;
    document.getElementById('statUnpaid').textContent = unpaid;
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const isOpen = !sidebar.classList.contains('translate-x-full');
    
    if (isOpen) {
        sidebar.classList.add('translate-x-full');
        overlay.classList.add('hidden');
    } else {
        sidebar.classList.remove('translate-x-full');
        overlay.classList.remove('hidden');
    }
}

function toggleDarkMode() {
    const isDark = !document.body.classList.contains('dark');
    if (isDark) {
        document.body.classList.add('dark');
        localStorage.setItem('darkMode', '1');
    } else {
        document.body.classList.remove('dark');
        localStorage.setItem('darkMode', '0');
    }
    setDarkModeUI(isDark);
    showToast(isDark ? 'מצב כהה הופעל' : 'מצב בהיר הופעל', 'info');
}

function setDarkModeUI(isDark) {
    const icon = document.getElementById('darkModeIcon');
    const iconPath = document.getElementById('darkModeIconPath');
    if (!icon || !iconPath) return;
    if (isDark) {
        icon.classList.remove('text-yellow-300');
        icon.classList.add('text-blue-200');
        iconPath.setAttribute('d', 'M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z');
    } else {
        icon.classList.remove('text-blue-200');
        icon.classList.add('text-yellow-300');
        iconPath.setAttribute('d', 'M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.05l-.71-.71M12 5a7 7 0 100 14 7 7 0 000-14z');
    }
}
(function initDarkMode(){
    const isDark = localStorage.getItem('darkMode') === '1';
    if (isDark) document.body.classList.add('dark');
    setTimeout(()=>setDarkModeUI(isDark), 0);
})();

familyFilterSelect.addEventListener('change', () => {
    renderTable();
    updateCharts();
});

// if (searchInput) {
//     searchInput.addEventListener('input', () => {
//         renderTable();
//     });
// }

// billType.addEventListener('change', () => {
//     if (billType.value && rates[billType.value]) {
//         rate.value = rates[billType.value];
//     }
// }); // הוסר - לא נדרש יותר

// פונקציות הגדרות תעריפים
function showRatesModal() {
    document.getElementById('electricRate').value = rates.חשמל;
    document.getElementById('waterRate').value = rates.מים;
    document.getElementById('municipalRate').value = rates.ארנונה;
    document.getElementById('ratesModal').classList.remove('hidden');
    document.getElementById('ratesModal').classList.add('flex');
}

function closeRatesModal() {
    document.getElementById('ratesModal').classList.remove('flex');
    document.getElementById('ratesModal').classList.add('hidden');
}

function saveRates() {
    const electricRate = parseFloat(document.getElementById('electricRate').value);
    const waterRate = parseFloat(document.getElementById('waterRate').value);
    const municipalRate = parseFloat(document.getElementById('municipalRate').value);
    
    if (electricRate >= 0) rates.חשמל = electricRate;
    if (waterRate >= 0) rates.מים = waterRate;
    if (municipalRate >= 0) rates.ארנונה = municipalRate;
    
    localStorage.setItem('rates', JSON.stringify(rates));
    if (currentUser && window.firebaseData && window.firebaseData.saveRates) {
        try { window.firebaseData.saveRates(rates); } catch(e) { console.warn('שגיאה בשמירת תעריפים ב-Firebase:', e); }
    }
    closeRatesModal();
    showToast('התעריפים נשמרו בהצלחה!', 'success');
}

function loadRates() {
    const storedRates = localStorage.getItem('rates');
    if (storedRates) {
        rates = JSON.parse(storedRates);
    }
    // אם משתמש מחובר ויש API, טען מהענן ודרוס את המקומי
    if (currentUser && window.firebaseData && window.firebaseData.getRates) {
        (async ()=>{
            try {
                const cloudRates = await window.firebaseData.getRates();
                if (cloudRates) {
                    rates = cloudRates;
                    localStorage.setItem('rates', JSON.stringify(rates));
                }
            } catch (e) { console.warn('שגיאה בטעינת תעריפים מהענן:', e); }
        })();
    }
}

// אתחול familyColors מתוך localStorage פעם אחת
(function initFamilyColors(){
    try {
        const stored = JSON.parse(localStorage.getItem('familyColors')||'{}');
        Object.assign(familyColors, stored);
    } catch {}
})();

// המרת ערכי דטה ל-Number עבור הגרפים
function toSortedKeys(obj){ return Object.keys(obj).sort(); }
(function patchChartNumbers(){
    const oldUpdate = updateCharts;
    updateCharts = function(){
        const electricData = {};
        const waterData = {};
        const paymentData = {};
        const filteredRecords = familyFilterSelect.value ? records.filter(rec => rec.familyName === familyFilterSelect.value) : records;
        filteredRecords.forEach(record => {
            const date = new Date(record.readingDate);
            const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
            if (record.billType === 'חשמל') {
                electricData[monthYear] = (electricData[monthYear] || 0) + record.usage;
            } else if (record.billType === 'מים') {
                waterData[monthYear] = (waterData[monthYear] || 0) + record.usage;
            }
            if (record.paid) paymentData[monthYear] = (paymentData[monthYear] || 0) + record.payment;
        });
        const eKeys = toSortedKeys(electricData);
        const wKeys = toSortedKeys(waterData);
        const pKeys = toSortedKeys(paymentData);
        if (electricChart) electricChart.destroy();
        electricChart = new Chart(document.getElementById('electricChart'), {
            type: 'bar',
            data: { labels: eKeys.map(k=>{ const [y,m]=k.split('-'); return `${months[parseInt(m)]} ${y}`; }), datasets: [{ label:'צריכה בקוט"ש', data: eKeys.map(k=>Number(electricData[k].toFixed(2))), backgroundColor:'rgba(59, 130, 246, 0.6)', borderColor:'rgba(59, 130, 246, 1)', borderWidth:1 }] },
            options: { responsive:true, scales:{ y:{ beginAtZero:true } } }
        });
        if (waterChart) waterChart.destroy();
        waterChart = new Chart(document.getElementById('waterChart'), {
            type: 'bar',
            data: { labels: wKeys.map(k=>{ const [y,m]=k.split('-'); return `${months[parseInt(m)]} ${y}`; }), datasets: [{ label:'צריכה במ"ק', data: wKeys.map(k=>Number(waterData[k].toFixed(2))), backgroundColor:'rgba(34, 197, 94, 0.6)', borderColor:'rgba(34, 197, 94, 1)', borderWidth:1 }] },
            options: { responsive:true, scales:{ y:{ beginAtZero:true } } }
        });
        if (paymentChart) paymentChart.destroy();
        paymentChart = new Chart(document.getElementById('paymentChart'), {
            type: 'bar',
            data: { labels: pKeys.map(k=>{ const [y,m]=k.split('-'); return `${months[parseInt(m)]} ${y}`; }), datasets: [{ label:'סך תשלומים ששולמו', data: pKeys.map(k=>Number(paymentData[k].toFixed(2))), backgroundColor:'rgba(251, 191, 36, 0.6)', borderColor:'rgba(251, 191, 36, 1)', borderWidth:1 }] },
            options: { responsive:true, scales:{ y:{ beginAtZero:true } } }
        });
    }
})();

document.addEventListener('DOMContentLoaded', function() {
    loadRecords();
    setTimeout(checkUnpaidReminders, 1000);
    // פוקוס אוטומטי לשדה הראשון בטופס
    setTimeout(()=>{
        if(familyNameSelect) familyNameSelect.focus();
    }, 500);
});
