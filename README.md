# Subtrack 🔔

> A Firebase-powered subscription tracking platform with a mobile app for users and an admin web dashboard.

## Architecture

```
React Native App (Expo)
       │
       │ Firebase SDK
       ▼
Firebase Backend
(Auth + Firestore + Storage + FCM + Cloud Functions)
       ▲
       │
React Admin Dashboard (Vite + React)
```

## Project Structure

```
subtrack-firebase/
├── mobile-app/        # React Native User App (Expo)
├── admin-web/         # React Admin Dashboard (Vite + Tailwind)
├── firebase/          # Firebase config, rules, Cloud Functions
├── shared/            # Shared TypeScript types
└── README.md
```

## Sub-Projects

### 📱 Mobile App (`mobile-app/`)
React Native (Expo) app for end users to manage subscriptions.

```bash
cd mobile-app
npm install
npx expo start
```

### 🖥️ Admin Dashboard (`admin-web/`)
Vite + React web dashboard for administrators.

```bash
cd admin-web
npm install
npm run dev
```

### 🔥 Firebase Functions (`firebase/functions/`)
Cloud Functions for reminders, analytics, and payment triggers.

```bash
cd firebase/functions
npm install
npm run build
firebase deploy --only functions
```

## Firebase Setup

1. Create a [Firebase project](https://console.firebase.google.com/)
2. Enable: **Authentication**, **Firestore**, **Storage**, **Cloud Messaging**, **Functions**
3. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) for the mobile app
4. Replace placeholder values in:
   - `mobile-app/src/firebase/firebaseConfig.ts`
   - `admin-web/src/firebase/firebaseConfig.ts`
5. Enable Google Authentication and Email/Password in Auth settings
6. Set admin custom claim on your admin user via the Firebase Admin SDK or Cloud Function

## Firestore Collections

| Collection | Description |
|---|---|
| `users` | User profiles |
| `subscriptions` | User subscriptions |
| `payments` | Payment records |
| `categories` | Subscription categories |
| `reminders` | Reminder preferences |
| `notifications` | Notification log |
| `admin_settings` | App config |
| `analytics/{userId}/monthly/{YYYY-MM}` | Monthly spending aggregates |

## Deployment

```bash
# Deploy Firestore rules and indexes
firebase deploy --only firestore

# Deploy Cloud Functions
firebase deploy --only functions

# Deploy Admin Web to Firebase Hosting
cd admin-web && npm run build
firebase deploy --only hosting
```
