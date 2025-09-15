// ניהול אימות משתמשים
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from './firebase-config.js';

const googleProvider = new GoogleAuthProvider();
let currentUser = null;

// פונקציות אימות
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    showToast('התחברת בהצלחה!', 'success');
    return result.user;
  } catch (error) {
    console.error('שגיאת התחברות Google:', error);
    showToast('שגיאה בהתחברות עם Google', 'error');
    throw error;
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    showToast('התחברת בהצלחה!', 'success');
    return result.user;
  } catch (error) {
    console.error('שגיאת התחברות:', error);
    let errorMessage = 'שגיאה בהתחברות';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'משתמש לא נמצא';
        break;
      case 'auth/wrong-password':
        errorMessage = 'סיסמה שגויה';
        break;
      case 'auth/invalid-email':
        errorMessage = 'כתובת מייל לא תקינה';
        break;
    }
    
    showToast(errorMessage, 'error');
    throw error;
  }
};

export const registerWithEmail = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    showToast('נרשמת בהצלחה!', 'success');
    return result.user;
  } catch (error) {
    console.error('שגיאת הרשמה:', error);
    let errorMessage = 'שגיאה בהרשמה';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'כתובת מייל כבר בשימוש';
        break;
      case 'auth/weak-password':
        errorMessage = 'סיסמה חלשה מדי (לפחות 6 תווים)';
        break;
      case 'auth/invalid-email':
        errorMessage = 'כתובת מייל לא תקינה';
        break;
    }
    
    showToast(errorMessage, 'error');
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    showToast('התנתקת בהצלחה', 'success');
  } catch (error) {
    console.error('שגיאת התנתקות:', error);
    showToast('שגיאה בהתנתקות', 'error');
  }
};

// מעקב אחר מצב המשתמש
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    currentUser = user;
    callback(user);
  });
};

export const getCurrentUser = () => currentUser;

export const requireAuth = () => {
  if (!currentUser) {
    showLoginModal();
    throw new Error('נדרשת התחברות');
  }
  return currentUser;
};

// UI של התחברות
export const showLoginModal = () => {
  document.getElementById('authModal').classList.remove('hidden');
  document.getElementById('authModal').classList.add('flex');
};

export const hideLoginModal = () => {
  document.getElementById('authModal').classList.remove('flex');
  document.getElementById('authModal').classList.add('hidden');
};

export const showRegisterForm = () => {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('registerForm').classList.remove('hidden');
  document.getElementById('authModalTitle').textContent = 'הרשמה למערכת';
};

export const showLoginForm = () => {
  document.getElementById('registerForm').classList.add('hidden');
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('authModalTitle').textContent = 'התחברות למערכת';
};
