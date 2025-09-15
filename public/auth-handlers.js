// פונקציות אימות
import { showToast } from './utils.js';

export async function handleEmailLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showToast('אנא מלא את כל השדות', 'warning');
        return;
    }
    
    try {
        await window.authModule.signInWithEmail(email, password);
    } catch (error) {
        console.error('Login error:', error);
    }
}

export async function handleEmailRegister() {
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
        await window.authModule.registerWithEmail(email, password);
    } catch (error) {
        console.error('Register error:', error);
    }
}

export async function handleGoogleLogin() {
    try {
        await window.authModule.signInWithGoogle();
    } catch (error) {
        console.error('Google login error:', error);
    }
}

export async function handleLogout() {
    try {
        await window.authModule.logout();
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
