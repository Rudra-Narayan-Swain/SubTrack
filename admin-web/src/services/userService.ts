import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, getDocs, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { firebaseConfig } from '../firebase/firebaseConfig';

export interface AdminUser {
    id: string;
    uid?: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
}

// Fetch ALL users directly from Firestore — no constraints, no ordering
export const getUsers = async (pageLimit = 500): Promise<AdminUser[]> => {
    try {
        const snapshot = await getDocs(collection(db, 'users'));
        const users: AdminUser[] = [];
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            users.push({
                id: docSnap.id,
                uid: data.uid || docSnap.id,
                ...data,
            });
        });

        // Sort by createdAt descending (newest first), handle missing dates
        users.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });

        return users.slice(0, pageLimit);
    } catch (err) {
        console.error('Error fetching users:', err);
        return [];
    }
};

// Real-time listener for users collection
export const subscribeToUsers = (
    callback: (users: AdminUser[]) => void,
    onError: (err: any) => void,
    pageLimit = 500
) => {
    const q = collection(db, 'users');
    return onSnapshot(q, (snapshot) => {
        const users: AdminUser[] = [];
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            users.push({
                id: docSnap.id,
                uid: data.uid || docSnap.id,
                ...data,
            });
        });

        // Sort by createdAt descending (newest first)
        users.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });

        callback(users.slice(0, pageLimit));
    }, (error) => {
        console.error('Error listening to users:', error);
        onError(error);
    });
};

export const getUserStats = async (): Promise<{
    total: number;
    newThisMonth: number;
}> => {
    try {
        const snapshot = await getDocs(collection(db, 'users'));
        const total = snapshot.size;

        const now = new Date();
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        let newThisMonth = 0;

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.createdAt && data.createdAt >= firstOfMonth) {
                newThisMonth++;
            }
        });

        return { total, newThisMonth };
    } catch (err) {
        console.error('Error fetching user stats:', err);
        return { total: 0, newThisMonth: 0 };
    }
};

export const searchUsersByEmail = async (email: string): Promise<AdminUser[]> => {
    const all = await getUsers();
    return all.filter(u =>
        u.email?.toLowerCase().includes(email.toLowerCase())
    );
};

export const createUser = async (data: Partial<AdminUser> & { email: string; password?: string }) => {
    let uid = data.id;

    if (data.email && data.password) {
        const secondaryApp = getApps().find(app => app.name === 'Secondary')
            || initializeApp(firebaseConfig, 'Secondary');
        const secondaryAuth = getAuth(secondaryApp);
        const cred = await createUserWithEmailAndPassword(secondaryAuth, data.email, data.password);
        uid = cred.user.uid;
        delete data.password;
    }

    const userData = {
        ...data,
        uid: uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    if (uid) {
        await setDoc(doc(db, 'users', uid), userData);
        return uid;
    } else {
        const ref = doc(collection(db, 'users'));
        await setDoc(ref, { ...userData, uid: ref.id });
        return ref.id;
    }
};

export const updateUser = async (uid: string, data: Partial<AdminUser>) => {
    await updateDoc(doc(db, 'users', uid), {
        ...data,
        updatedAt: new Date().toISOString(),
    });
};

export const deleteUser = async (uid: string) => {
    await deleteDoc(doc(db, 'users', uid));
};
