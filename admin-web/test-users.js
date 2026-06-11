import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve('.env.local') });

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
};

console.log("Firebase config loaded, API Key:", !!firebaseConfig.apiKey);

try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    async function test() {
        try {
            console.log('Fetching users...');
            const snap = await getDocs(collection(db, 'users'));
            console.log(`Found ${snap.size} users.`);
            snap.forEach(doc => {
                console.log(doc.id, doc.data());
            });
            process.exit(0);
        } catch (e) {
            console.error('Error fetching users:', e.message);
            process.exit(1);
        }
    }

    test();
} catch (err) {
    console.error("Initialization error:", err);
}
