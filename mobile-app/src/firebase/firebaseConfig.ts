import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

// metro.config.js pins:
//   firebase/auth  → @firebase/auth/dist/rn/index.js   (RN build, has getReactNativePersistence)
//   @firebase/auth → @firebase/auth/dist/rn/index.js   (same)
//   @firebase/app  → @firebase/app/dist/index.cjs.js   (CJS, single instance)
//
// Without pinning @firebase/app to CJS, Metro resolves it to the ESM browser
// build ("browser" field in package.json). The RN auth build then gets a
// DIFFERENT module instance of @firebase/app, splitting the component registry
// and causing "Component auth has not been registered yet".

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

// Lazy auth singleton — initialized on first call so all module side-effects
// (including registerAuth("ReactNative")) have run before we touch the registry.
let _auth: ReturnType<typeof initializeAuth> | undefined;
export const getAuthInstance = () => {
    if (!_auth) {
        try {
            _auth = initializeAuth(app, {
                persistence: getReactNativePersistence(AsyncStorage),
            });
        } catch (e: any) {
            if (e?.code === 'auth/already-initialized') {
                _auth = getAuth(app);
            } else {
                throw e;
            }
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
