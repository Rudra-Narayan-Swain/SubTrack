# 🔔 Subtrack

> A modern subscription tracking platform built with Firebase, featuring a mobile app for users and an admin dashboard for management.

## ✨ Features

### 📱 User App

* Track active subscriptions
* Manage recurring payments
* Set renewal reminders
* Receive push notifications
* View spending insights

### 🖥️ Admin Dashboard

* Manage users and subscriptions
* Monitor payments and activity
* Configure categories and reminders
* Access analytics and reports

### 🔥 Firebase Backend

* Authentication
* Cloud Firestore
* Cloud Storage
* Cloud Messaging (FCM)
* Cloud Functions

---

## 🏗️ Architecture

```text
React Native App (Expo)
        │
        ▼
Firebase Backend
(Auth • Firestore • Storage • FCM • Functions)
        ▲
        │
React Admin Dashboard (Vite + React)
```

---

## 📂 Project Structure

```text
subtrack-firebase/
├── mobile-app/      # React Native User App
├── admin-web/       # React Admin Dashboard
├── firebase/        # Firebase Config & Functions
├── shared/          # Shared TypeScript Types
└── README.md
```

---

## 🚀 Getting Started

### Mobile App

```bash
cd mobile-app
npm install
npx expo start
```

### Admin Dashboard

```bash
cd admin-web
npm install
npm run dev
```

### Firebase Functions

```bash
cd firebase/functions
npm install
npm run build
firebase deploy --only functions
```

---

## ⚙️ Firebase Setup

1. Create a Firebase project
2. Enable:

   * Authentication
   * Firestore
   * Storage
   * Cloud Messaging
   * Cloud Functions
3. Add Firebase configuration to:

   * `mobile-app/src/firebase/firebaseConfig.ts`
   * `admin-web/src/firebase/firebaseConfig.ts`
4. Enable:

   * Google Sign-In
   * Email/Password Authentication
5. Configure admin access using Firebase Custom Claims

---

## 🗄️ Firestore Collections

| Collection     | Purpose                    |
| -------------- | -------------------------- |
| users          | User profiles              |
| subscriptions  | Subscription records       |
| payments       | Payment history            |
| categories     | Subscription categories    |
| reminders      | Reminder settings          |
| notifications  | Notification logs          |
| admin_settings | Application settings       |
| analytics      | Monthly spending analytics |

---

## 🚢 Deployment

### Deploy Firestore

```bash
firebase deploy --only firestore
```

### Deploy Functions

```bash
firebase deploy --only functions
```

### Deploy Admin Dashboard

```bash
cd admin-web
npm run build
firebase deploy --only hosting
```

---

## 🛠️ Tech Stack

* React Native (Expo)
* React + Vite
* TypeScript
* Firebase Authentication
* Cloud Firestore
* Firebase Storage
* Firebase Cloud Messaging
* Cloud Functions
* Tailwind CSS

---

## 📄 License

This project is licensed under the MIT License.
