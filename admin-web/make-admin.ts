import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as readline from 'readline';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string): Promise<string> => {
    return new Promise((resolve) => rl.question(query, resolve));
};

async function main() {
    console.log("=== Promote User to Admin ===");
    console.log("Firebase Project:", firebaseConfig.projectId);
    
    if (!firebaseConfig.apiKey) {
        console.error("Error: Firebase configuration not found in .env.local!");
        rl.close();
        return;
    }

    const email = await question("Enter user email: ");
    const password = await question("Enter user password: ");

    rl.close();

    try {
        console.log(`Logging in as ${email}...`);
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        console.log(`Success! Logged in (UID: ${cred.user.uid})`);

        console.log("Promoting user to admin...");
        await setDoc(doc(db, 'users', cred.user.uid), {
            role: 'admin',
            updatedAt: new Date().toISOString(),
        }, { merge: true });

        console.log("\n==============================================");
        console.log(`🎉 SUCCESS: ${email} is now an Admin!`);
        console.log("You can now log in using this account on http://localhost:3001");
        console.log("==============================================");
    } catch (e: any) {
        console.error("\n❌ ERROR:", e.message);
    }
}

main();
