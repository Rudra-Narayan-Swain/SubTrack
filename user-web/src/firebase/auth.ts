import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as _signOut,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged,
} from 'firebase/auth';
import { auth } from './firebaseConfig';

export { onAuthStateChanged };

export const signUp = (email: string, password: string) =>
    createUserWithEmailAndPassword(auth, email, password);

export const signIn = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password);

export const signOut = () => _signOut(auth);

export const resetPassword = (email: string) =>
    sendPasswordResetEmail(auth, email);

export const updateUserProfile = (
    user: any,
    updates: { displayName?: string; photoURL?: string }
) => updateProfile(user, updates);
