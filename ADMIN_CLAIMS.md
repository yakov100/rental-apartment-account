# הגדרת מנהל (Admin) במערכת

כדי לסמן משתמש כמנהל (עם הרשאות מחיקה ועדכון סטטוס תשלום לכולם), יש להוסיף לו custom claim בשם role: 'admin' בצד השרת/CLI מאובטח.

## אפשרות 1: Node.js עם Firebase Admin SDK

1) התקנה:
```bash
npm i firebase-admin
```

2) צור קובץ set-admin.js:
```js
const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

async function setAdmin(uid) {
  await admin.auth().setCustomUserClaims(uid, { role: 'admin' });
  console.log('Admin claim set for', uid);
}

setAdmin(process.argv[2]).catch(console.error);
```

3) הרצה (UID של המשתמש):
```bash
node set-admin.js <USER_UID>
```

הערה: ודא שהמשתנה GOOGLE_APPLICATION_CREDENTIALS מצביע על Service Account JSON תקין, או שרץ בסביבת Cloud עם הרשאות.

## אפשרות 2: Cloud Functions (קריאה מאובטחת בלבד)

ניתן ליצור HTTPS function פנימית מוגנת שמקבלת UID ומגדירה claim.

לאחר שינוי ה־claim, על המשתמש להתנתק ולהתחבר מחדש כדי לרענן ה־ID token.

## אימות בצד הלקוח

```js
const token = await firebase.auth().currentUser.getIdTokenResult(true);
const isAdmin = token.claims && token.claims.role === 'admin';
```

## פרסום כללי Firestore

פרסם את הכללים מהקובץ firestore.rules:
```bash
firebase deploy --only firestore:rules
```

