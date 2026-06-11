const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

console.log("Starting test script...");

const firebaseConfig = {
    apiKey: "AIzaSyD94AVbH2dufxhg1rt_Ugc96T_Fcrltl-s",
    authDomain: "subtrack-cf561.firebaseapp.com",
    projectId: "subtrack-cf561",
    storageBucket: "subtrack-cf561.firebasestorage.app",
    messagingSenderId: "55553989241",
    appId: "1:55553989241:web:37d541aae3bf3a765692a8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    try {
        console.log("Fetching...");
        const snap = await getDocs(collection(db, 'users'));
        console.log("Success. Docs:", snap.size);
        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}
run();
