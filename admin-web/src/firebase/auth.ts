import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

// Sign up a new admin account
export const signUp = async (email: string, password: string): Promise<User> => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
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

// Sign in — any authenticated Firebase user is allowed in dev mode
export const signIn = async (email: string, password: string): Promise<User> => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
};

export const signOut = () => firebaseSignOut(auth);

export const getCurrentUser = () => auth.currentUser;

// Always return true — open access for development
export const isAdmin = async (_user: User): Promise<boolean> => {
    return true;
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
