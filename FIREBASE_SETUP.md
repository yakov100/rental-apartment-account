# הגדרת Firebase עבור מערכת ניהול צריכה יחידות

## שלב 1: יצירת פרויקט Firebase

1. היכנס ל-[Firebase Console](https://console.firebase.google.com/)
2. לחץ על "Add project" / "הוסף פרויקט"
3. תן שם לפרויקט (למשל: "units-consumption-manager")
4. בחר אם לאפשר Google Analytics (לא חובה)
5. לחץ "Create project"
 
## שלב 2: הגדרת Authentication

1. בתפריט השמאלי, לחץ על "Authentication"
2. לחץ "Get started" 
3. עבור ללשונית "Sign-in method"
4. אפשר את השיטות הבאות:
   - **Email/Password**: לחץ על Email/Password → Enable → Save
   - **Google**: לחץ על Google → Enable → בחר Support email → Save

## שלב 3: הגדרת Firestore Database

1. בתפריט השמאלי, לחץ על "Firestore Database"
2. לחץ "Create database"
3. בחר "Start in test mode" (נשנה אחר כך)
4. בחר מיקום (europe-west או us-central1)
5. לחץ "Done"

## שלב 4: הגדרת Hosting

1. בתפריט השמאלי, לחץ על "Hosting"
2. לחץ "Get started"
3. עקוב אחר ההוראות להתקנת Firebase CLI

## שלב 5: קבלת נתוני החיבור

1. לחץ על סמל הגירובאלים ⚙️ ליד "Project Overview"
2. בחר "Project settings"
3. גלול למטה ל"Your apps"
4. לחץ על "</>" (Web app)
5. תן שם לאפליקציה
6. סמן "Also set up Firebase Hosting"
7. לחץ "Register app"
8. **העתק את קוד התצורה** - נדרש לשלב הבא!

## שלב 6: עדכון קוד האפליקציה

פתח את הקובץ `src/firebase-config.js` והחלף את השורות הבאות בנתונים שלך:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",           // השורה: apiKey
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",  // השורה: authDomain
  projectId: "YOUR_PROJECT_ID",         // השורה: projectId
  storageBucket: "YOUR_PROJECT_ID.appspot.com",   // השורה: storageBucket
  messagingSenderId: "YOUR_SENDER_ID",  // השורה: messagingSenderId
  appId: "YOUR_APP_ID"                  // השורה: appId
};
```

## שלב 7: עדכון כללי אבטחה

1. חזור ל-Firestore Database
2. לחץ על "Rules"
3. החלף את התוכן בקובץ `firestore.rules` שכבר נוצר בפרויקט
4. לחץ "Publish"

## שלב 8: התקנה והרצה

### התקנת Firebase CLI (אם עדיין לא מותקן):
```bash
npm install -g firebase-tools
```

### התחברות לחשבון:
```bash
firebase login
```

### אתחול הפרויקט:
```bash
firebase init
```
- בחר: Firestore, Hosting
- בחר את הפרויקט שיצרת
- קבל את כל ברירות המחדל

### העלאה לאינטרנט:
```bash
npm install
firebase deploy
```

## שלב 9: גישה לאתר

אחרי ההעלאה, תקבל כתובת אתר כגון:
`https://your-project-id.web.app`

האתר יהיה זמין מכל מקום באינטרנט! 🎉

## תכונות שיעבדו:

✅ **התחברות** - Google או אימייל/סיסמה  
✅ **שמירה בענן** - כל הנתונים ב-Firestore  
✅ **סינכרון בזמן אמת** - עדכונים מיידיים  
✅ **מצב אופליין** - עבודה ללא אינטרנט  
✅ **גיבוי אוטומטי** - כל השינויים נשמרים  
✅ **מרובה מכשירים** - גישה מכל מקום  

## פתרון בעיות נפוצות:

### שגיאת "Firebase project not found":
- ודא שהפרויקט ID נכון בקובץ firebase-config.js

### שגיאת Authentication:
- ודא שאפשרת Email/Password ו-Google ב-Authentication

### שגיאת Firestore:
- ודא שעדכנת את כללי האבטחה

### האתר לא עובד:
- ודא שהרצת `firebase deploy` בהצלחה
- בדוק ב-Console אם יש שגיאות

יש בעיות? שאל אותי! 😊
