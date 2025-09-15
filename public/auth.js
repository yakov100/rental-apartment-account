// ניהול אימות משתמשים - Firebase v8 Compat
// נשתמש ב-Firebase v8 שכבר נטען בדף

let currentUser = null;

// פונקציות אימות - Firebase v8 Compat
export const signInWithGoogle = async () => {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await firebase.auth().signInWithPopup(provider);
    if (typeof showToast === 'function') {
      showToast('התחברת בהצלחה!', 'success');
    }
    return result.user;
  } catch (error) {
    console.error('שגיאת התחברות Google:', error);
    if (typeof showToast === 'function') {
      showToast('שגיאה בהתחברות עם Google', 'error');
    }
    throw error;
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const result = await firebase.auth().signInWithEmailAndPassword(email, password);
    if (typeof showToast === 'function') {
      showToast('התחברת בהצלחה!', 'success');
    }
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
    
    if (typeof showToast === 'function') {
      showToast(errorMessage, 'error');
    }
    throw error;
  }
};

export const registerWithEmail = async (email, password) => {
  try {
    const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
    if (typeof showToast === 'function') {
      showToast('נרשמת בהצלחה!', 'success');
    }
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
    
    if (typeof showToast === 'function') {
      showToast(errorMessage, 'error');
    }
    throw error;
  }
};

export const logout = async () => {
  try {
    await firebase.auth().signOut();
    if (typeof showToast === 'function') {
      showToast('התנתקת בהצלחה', 'success');
    }
  } catch (error) {
    console.error('שגיאת התנתקות:', error);
    if (typeof showToast === 'function') {
      showToast('שגיאה בהתנתקות', 'error');
    }
  }
};

// מעקב אחר מצב המשתמש
export const onAuthChange = (callback) => {
  return firebase.auth().onAuthStateChanged((user) => {
    currentUser = user;
    if (typeof callback === 'function') {
      callback(user);
    }
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
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
};

export const hideLoginModal = () => {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.remove('flex');
    modal.classList.add('hidden');
  }
};

export const showRegisterForm = () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const title = document.getElementById('authModalTitle');
  
  if (loginForm) loginForm.classList.add('hidden');
  if (registerForm) registerForm.classList.remove('hidden');
  if (title) title.textContent = 'הרשמה למערכת';
};

export const showLoginForm = () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const title = document.getElementById('authModalTitle');
  
  if (registerForm) registerForm.classList.add('hidden');
  if (loginForm) loginForm.classList.remove('hidden');
  if (title) title.textContent = 'התחברות למערכת';
};
