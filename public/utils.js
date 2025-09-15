// פונקציות עזר כלליות
export const months = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

// Function to format date from YYYY-MM-DD to DD/MM/YYYY
export function formatDateForDisplay(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('he-IL');
    } catch (e) {
        console.error('Error formatting date:', e);
        // Fallback to manual formatting
        const parts = dateString.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateString;
    }
}

export function showToast(message, type = 'info') {
    let toast = document.createElement('div');
    toast.className = `fixed top-6 right-6 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-semibold text-lg animate-fade-in-up transition-all duration-300 ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-yellow-500 text-gray-900' : 'bg-blue-500'}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-4');
        setTimeout(() => toast.remove(), 600);
    }, 2600);
}

export function closeModal() {
    document.getElementById('messageModal').classList.remove('flex');
    document.getElementById('messageModal').classList.add('hidden');
}

export function toggleSidebar() {
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

export function setDarkModeUI(isDark) {
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

// אתחול מצב כהה
export function initDarkMode() {
    const isDark = localStorage.getItem('darkMode') === '1';
    if (isDark) document.body.classList.add('dark');
    setTimeout(() => setDarkModeUI(isDark), 0);
}
