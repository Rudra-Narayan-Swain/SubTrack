import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

// Sign up a new admin account (restricted to admin email & password)
export const signUp = async (email: string, password: string): Promise<User> => {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail !== 'rudraswain1520@gmail.com' || password !== '123456') {
        const err = new Error('Registration is restricted to the administrator account.') as any;
        err.code = 'auth/admin-registration-restricted';
        throw err;
    }

    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    const now = new Date().toISOString();

    // Write admin profile to Firestore (best-effort)
    try {
        await setDoc(doc(db, 'users', cred.user.uid), {
            email: cred.user.email,
            name: 'Admin',
            role: 'admin',
            createdAt: now,
            updatedAt: now,
        });
    } catch (err) {
        console.warn('Could not write user profile:', err);
    }

    return cred.user;
};

// Sign in — only rudraswain1520@gmail.com with password 123456 is allowed
export const signIn = async (email: string, password: string): Promise<User> => {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail !== 'rudraswain1520@gmail.com' || password !== '123456') {
        const err = new Error('Invalid email or password.') as any;
        err.code = 'auth/invalid-credential';
        throw err;
    }

    try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        return cred.user;
    } catch (err: any) {
        // If the user does not exist in Firebase, create the account automatically
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
            try {
                const user = await signUp(cleanEmail, password);
                return user;
            } catch (signUpErr) {
                throw err;
            }
        }
        throw err;
    }
};

export const signOut = () => firebaseSignOut(auth);

export const getCurrentUser = () => auth.currentUser;

// Verify user is the admin
export const isAdmin = async (user: User): Promise<boolean> => {
    return user.email?.trim().toLowerCase() === 'rudraswain1520@gmail.com';
};

export const getUserProfile = async (uid: string) => {
    try {
        const { doc: firestoreDoc, getDoc } = await import('firebase/firestore');
        const docSnap = await getDoc(firestoreDoc(db, 'users', uid));
        return docSnap.exists() ? docSnap.data() : null;
    } catch {
        return null;
    }
};

export { onAuthStateChanged, auth };
