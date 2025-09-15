// פונקציות אימות
// נשתמש ב-showToast הגלובלי

export async function handleEmailLogin() {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    
    if (!email || !password) {
        if (typeof showToast === 'function') {
            showToast('אנא מלא את כל השדות', 'warning');
        }
        return;
    }
    
    try {
        if (window.authModule && window.authModule.signInWithEmail) {
            await window.authModule.signInWithEmail(email, password);
        } else {
            console.error('Auth module not loaded');
        }
    } catch (error) {
        console.error('Login error:', error);
    }
}

export async function handleEmailRegister() {
    const email = document.getElementById('registerEmail')?.value;
    const password = document.getElementById('registerPassword')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;
    
    if (!email || !password || !confirmPassword) {
        if (typeof showToast === 'function') {
            showToast('אנא מלא את כל השדות', 'warning');
        }
        return;
    }
    
    if (password !== confirmPassword) {
        if (typeof showToast === 'function') {
            showToast('הסיסמאות אינן תואמות', 'warning');
        }
        return;
    }
    
    if (password.length < 6) {
        if (typeof showToast === 'function') {
            showToast('הסיסמה חייבת להכיל לפחות 6 תווים', 'warning');
        }
        return;
    }
    
    try {
        if (window.authModule && window.authModule.registerWithEmail) {
            await window.authModule.registerWithEmail(email, password);
        } else {
            console.error('Auth module not loaded');
        }
    } catch (error) {
        console.error('Register error:', error);
    }
}

export async function handleGoogleLogin() {
    try {
        if (window.authModule && window.authModule.signInWithGoogle) {
            await window.authModule.signInWithGoogle();
        } else {
            console.error('Auth module not loaded');
        }
    } catch (error) {
        console.error('Google login error:', error);
    }
}

export async function handleLogout() {
    try {
        if (window.authModule && window.authModule.logout) {
            await window.authModule.logout();
        } else {
            console.error('Auth module not loaded');
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}

export function showRegisterForm() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('authModalTitle').textContent = 'הרשמה למערכת';
}

export function showLoginForm() {
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('authModalTitle').textContent = 'התחברות למערכת';
}
