const admin = require('firebase-admin');
admin.initializeApp();

const email = 'admin@subtrack.com';
const password = 'password123';

async function setupAdmin() {
    try {
        let user;
        try {
            user = await admin.auth().getUserByEmail(email);
            console.log('User exists, updating password...');
            await admin.auth().updateUser(user.uid, { password });
        } catch (e) {
            console.log('User does not exist, creating...');
            user = await admin.auth().createUser({ email, password, displayName: 'Admin' });
        }

        console.log('Setting admin custom claim...');
        await admin.auth().setCustomUserClaims(user.uid, { admin: true });

        console.log('Writing to Firestore/users...');
        await admin.firestore().collection('users').doc(user.uid).set({
            email,
            name: 'Admin',
            role: 'admin',
            createdAt: new Date().toISOString()
        }, { merge: true });

        console.log(`✅ Admin setup complete!`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
    } catch (e) {
        console.error('Error setting up admin:', e);
    }
}

setupAdmin();
