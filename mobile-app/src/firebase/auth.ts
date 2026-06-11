import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as _signOut,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged,
} from 'firebase/auth';
import { getAuthInstance } from './firebaseConfig';

export { onAuthStateChanged };

export const signUp = (email: string, password: string) =>
    createUserWithEmailAndPassword(getAuthInstance(), email, password);

export const signIn = (email: string, password: string) =>
    signInWithEmailAndPassword(getAuthInstance(), email, password);

export const signOut = () => _signOut(getAuthInstance());

export const resetPassword = (email: string) =>
    sendPasswordResetEmail(getAuthInstance(), email);

export const updateUserProfile = (
    user: Parameters<typeof updateProfile>[0],
    updates: { displayName?: string; photoURL?: string }
) => updateProfile(user, updates);
