// ניהול משפחות
import { showToast } from './utils.js';

let familyNames = new Set();

export function getFamilyNames() {
    return familyNames;
}

export function setFamilyNames(names) {
    familyNames = new Set(names);
}

export function addFamily(name) {
    if (name && !familyNames.has(name)) {
        familyNames.add(name);
        saveFamilyNames();
        populateFamilyNames();
        populateFamilyFilter();
        closeAddFamilyModal();
        showToast('משפחה חדשה נוספה בהצלחה!', 'success');
        return true;
    } else if (familyNames.has(name)) {
        showToast("שם המשפחה כבר קיים.", 'warning');
        return false;
    }
    return false;
}

export function populateFamilyNames() {
    const familyNameSelect = document.getElementById('familyName');
    if (!familyNameSelect) return;
    
    familyNameSelect.innerHTML = '<option value="">בחר שם משפחה</option>';
    familyNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.innerHTML = `<span style='display:inline-block;width:1em;height:1em;border-radius:50%;background:${getFamilyColor(name)};margin-left:0.5em;vertical-align:middle'></span>${name}`;
        familyNameSelect.appendChild(option);
    });
}

export function populateFamilyFilter() {
    const familyFilterSelect = document.getElementById('familyFilter');
    if (!familyFilterSelect) return;
    
    familyFilterSelect.innerHTML = '<option value="">הכל</option>';
    familyNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        familyFilterSelect.appendChild(option);
    });
}

export function showAddFamilyModal() {
    document.getElementById('addFamilyModal').classList.remove('hidden');
    document.getElementById('addFamilyModal').classList.add('flex');
}

export function closeAddFamilyModal() {
    document.getElementById('addFamilyModal').classList.remove('flex');
    document.getElementById('addFamilyModal').classList.add('hidden');
    const newFamilyNameInput = document.getElementById('newFamilyNameInput');
    if (newFamilyNameInput) newFamilyNameInput.value = '';
}

async function saveFamilyNames() {
    if (window.firebaseData) {
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

// Import getFamilyColor from family-colors module
function getFamilyColor(name) {
    // This will be imported from family-colors.js in the main app
    return window.getFamilyColor ? window.getFamilyColor(name) : '#d1d5db';
}
