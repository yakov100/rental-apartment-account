// Firestore data layer (Compat SDK) with admin/tenant support
// Exposes window.firebaseData for use by public/app.js

(function initFirebaseDataCompat() {
    if (typeof firebase === 'undefined') {
        console.warn('firebase not found; firebase-data-compat disabled');
        return;
    }

    const db = () => firebase.firestore();

    function requireAuth() {
        const user = firebase.auth().currentUser;
        if (!user) throw new Error('Not authenticated');
        return user;
    }

    async function isAdmin() {
        const user = requireAuth();
        const token = await user.getIdTokenResult();
        return token.claims && token.claims.role === 'admin';
    }

    function getUserRecordDocRef(userId, recordId) {
        return db().doc(`users/${userId}/records/${recordId}`);
    }

    function getUserCollectionRef(userId, collectionName) {
        return db().collection(`users/${userId}/${collectionName}`);
    }

    async function saveRecord(record) {
        const user = requireAuth();
        const userId = user.uid;
        const toSave = { ...record };
        // Normalize id to string
        if (toSave.id == null || toSave.id === '') {
            toSave.id = String(Date.now());
        } else {
            toSave.id = String(toSave.id);
        }
        // Server-managed/derived fields
        if (typeof toSave.paid !== 'boolean') toSave.paid = false;
        toSave.userId = userId;
        // Persist under users/{uid}/records/{id}
        const ref = getUserRecordDocRef(userId, toSave.id);
        await ref.set(toSave, { merge: true });
        return toSave;
    }

    async function deleteRecord(recordId, options = {}) {
        const user = requireAuth();
        const admin = (options.isAdmin === true) || (await isAdmin());
        const idStr = String(recordId);
        if (admin) {
            // Find the record across all users and delete
            const snap = await db().collectionGroup('records').where('id', '==', idStr).limit(1).get();
            if (!snap.empty) {
                await snap.docs[0].ref.delete();
                return true;
            }
            return false;
        } else {
            // Tenant can attempt only own doc; rules will still block, but we avoid calling from UI
            const ref = getUserRecordDocRef(user.uid, idStr);
            await ref.delete();
            return true;
        }
    }

    async function setPaid(recordId, paid, options = {}) {
        const admin = (options.isAdmin === true) || (await isAdmin());
        if (!admin) throw new Error('Not authorized');
        const idStr = String(recordId);
        const snap = await db().collectionGroup('records').where('id', '==', idStr).limit(1).get();
        if (!snap.empty) {
            await snap.docs[0].ref.update({ paid: !!paid });
            return true;
        }
        return false;
    }

    async function getRecords(options = {}) {
        const user = requireAuth();
        const admin = (options.isAdmin === true) || (await isAdmin());
        let q;
        if (admin) {
            q = db().collectionGroup('records');
        } else {
            q = getUserCollectionRef(user.uid, 'records');
        }
        // readingDate is stored as string (YYYY-MM-DD) in this app
        const snap = await q.get();
        const records = [];
        snap.forEach(doc => records.push({ id: doc.id, ...doc.data() }));
        // Optional: sort by readingDate desc client-side
        records.sort((a, b) => String(b.readingDate || '').localeCompare(String(a.readingDate || '')));
        return records;
    }

    function subscribeToRecords(optionsOrIsAdmin, callback) {
        const options = typeof optionsOrIsAdmin === 'boolean' ? { isAdmin: optionsOrIsAdmin } : (optionsOrIsAdmin || {});
        const user = firebase.auth().currentUser;
        if (!user) return () => {};
        let unsub = null;
        const start = async () => {
            const admin = (options.isAdmin === true) || (await isAdmin());
            if (unsub) unsub();
            let q;
            if (admin) {
                q = db().collectionGroup('records');
            } else {
                q = getUserCollectionRef(user.uid, 'records');
            }
            unsub = q.onSnapshot((snapshot) => {
                const list = [];
                snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
                list.sort((a, b) => String(b.readingDate || '').localeCompare(String(a.readingDate || '')));
                try { callback(list); } catch (e) { console.error(e); }
            }, (err) => {
                console.error('subscribeToRecords error:', err);
            });
        };
        start();
        return () => { if (unsub) unsub(); };
    }

    // Families (per user)
    async function saveFamilies(familiesSet) {
        const user = requireAuth();
        const arr = Array.from(familiesSet || []);
        const ref = db().doc(`users/${user.uid}/settings/families`);
        await ref.set({ families: arr, updatedAt: new Date() }, { merge: true });
        return true;
    }

    async function getFamilies() {
        const user = requireAuth();
        const ref = db().doc(`users/${user.uid}/settings/families`);
        const d = await ref.get();
        if (d.exists) return new Set(d.data().families || []);
        return new Set();
    }

    // Family colors (per user)
    async function saveFamilyColors(colors) {
        const user = requireAuth();
        const ref = db().doc(`users/${user.uid}/settings/familyColors`);
        await ref.set({ familyColors: colors || {}, updatedAt: new Date() }, { merge: true });
        return true;
    }

    async function getFamilyColors() {
        const user = requireAuth();
        const ref = db().doc(`users/${user.uid}/settings/familyColors`);
        const d = await ref.get();
        if (d.exists) return d.data().familyColors || {};
        return {};
    }

    // Rates (per user)
    async function saveRates(rates) {
        const user = requireAuth();
        const ref = db().doc(`users/${user.uid}/settings/rates`);
        await ref.set({ rates: rates || {}, updatedAt: new Date() }, { merge: true });
        return true;
    }

    async function getRates() {
        const user = requireAuth();
        const ref = db().doc(`users/${user.uid}/settings/rates`);
        const d = await ref.get();
        if (d.exists) return d.data().rates || { חשמל: 0.6, מים: 7, ארנונה: 50 };
        return { חשמל: 0.6, מים: 7, ארנונה: 50 };
    }

    // Family profiles (entryDate, phones, email) per user
    async function saveFamilyProfiles(profiles) {
        const user = requireAuth();
        const ref = db().doc(`users/${user.uid}/settings/familyProfiles`);
        await ref.set({ profiles: profiles || {}, updatedAt: new Date() }, { merge: true });
        return true;
    }

    async function getFamilyProfiles() {
        const user = requireAuth();
        const ref = db().doc(`users/${user.uid}/settings/familyProfiles`);
        const d = await ref.get();
        if (d.exists) return d.data().profiles || {};
        return {};
    }

    window.firebaseData = {
        saveRecord,
        deleteRecord,
        setPaid,
        getRecords,
        subscribeToRecords,
        saveFamilies,
        getFamilies,
        saveFamilyColors,
        getFamilyColors,
        saveRates,
        getRates,
        saveFamilyProfiles,
        getFamilyProfiles
    };
})();


