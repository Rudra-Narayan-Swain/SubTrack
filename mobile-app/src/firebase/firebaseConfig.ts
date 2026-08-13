import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// App singleton — survives hot reloads
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Lazy auth singleton — failsafe initialization
let _auth: ReturnType<typeof initializeAuth> | undefined;
export const getAuthInstance = () => {
    if (!_auth) {
        try {
            _auth = initializeAuth(app, {
                persistence: getReactNativePersistence(AsyncStorage),
            });
        } catch (e: any) {
            // Fall back to standard getAuth if persistence initialization fails or is already initialized
            _auth = getAuth(app);
        }
    }
    return _auth;
};

// Lazy Firestore singleton
let _db: ReturnType<typeof getFirestore> | undefined;
export const getDb = () => {
    if (!_db) {
        _db = getFirestore(app);
    }
    return _db;
};

export { app };
