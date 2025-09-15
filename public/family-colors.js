// ניהול צבעי משפחות
const familyColors = {};
const colorPalette = [
    '#3b82f6', '#22c55e', '#f59e42', '#e11d48', '#a21caf', '#fbbf24', '#0ea5e9', '#14b8a6', '#6366f1', '#f43f5e', '#84cc16', '#f472b6', '#facc15', '#7c3aed', '#06b6d4', '#eab308', '#d97706', '#be185d', '#059669', '#b91c1c'
];

export function getFamilyColor(name) {
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
    return color;
}

export function initFamilyColors() {
    try {
        const stored = JSON.parse(localStorage.getItem('familyColors')||'{}');
        Object.assign(familyColors, stored);
    } catch {}
}

export function getFamilyColors() {
    return familyColors;
}

export function setFamilyColors(colors) {
    Object.assign(familyColors, colors);
    localStorage.setItem('familyColors', JSON.stringify(familyColors));
}
