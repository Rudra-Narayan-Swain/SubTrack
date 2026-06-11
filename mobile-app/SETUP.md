# Subtrack Mobile App - Setup Guide

## Quick Start

### Prerequisites
- Node.js v18+ (v22.21.1 recommended)
- npm or yarn
- Expo CLI (included in dependencies)

### Installation

1. **Install Dependencies**
```bash
cd mobile-app
npm install
```

2. **Configure Environment Variables**
- Copy `.env.example` to `.env`
- Update with your Firebase credentials (already configured in `.env`)

3. **Run Web Version**
```bash
npm run web
```
Then press `w` in the terminal or open http://localhost:8081

4. **Run on Mobile (Expo Go)**
```bash
npm run start
```
Scan the QR code with:
- **iOS**: Camera app
- **Android**: Expo Go app

## Available Scripts

- `npm run start` - Start Expo development server
- `npm run android` - Run on Android (requires Android SDK)
- `npm run ios` - Run on iOS simulator (requires Xcode)
- `npm run web` - Run in web browser

## Android Build Setup (Optional)

If you want to build standalone Android apps:

1. **Install Android Studio**
2. **Set ANDROID_HOME environment variable:**
   ```powershell
   # PowerShell (Admin)
   $env:ANDROID_HOME = "C:\Users\YourUsername\AppData\Local\Android\Sdk"
   
   # Add to PATH
   $env:Path += ";$env:ANDROID_HOME\platform-tools"
   ```

3. **Install required SDK components:**
   - Android SDK Platform
   - Android SDK Build-Tools
   - Android Emulator (optional)

## Troubleshooting

### Common Issues

**1. Package Version Mismatches**
```bash
npx expo install --fix
```

**2. Metro Bundler Issues**
```bash
npm run start -- --clear
```

**3. TypeScript Errors**
```bash
npx tsc --noEmit
```

**4. Clear Cache**
```bash
npx expo start -c
```

### Known Limitations

- **Android builds require Android SDK** - Not needed for Expo Go testing
- **Web requires react-native-web** - Already installed
- **Firebase configuration** - Make sure `.env` file has correct values

## Project Structure

```
mobile-app/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # Screen components
│   ├── navigation/     # React Navigation setup
│   ├── firebase/       # Firebase configuration
│   ├── services/       # API and business logic
│   ├── store/          # State management (Zustand)
│   ├── types/          # TypeScript types
│   └── utils/          # Helper functions
├── .env                # Environment variables
├── app.json            # Expo configuration
└── package.json        # Dependencies
```

## Tech Stack

- **Framework**: Expo SDK 54
- **React Native**: 0.81.5
- **Navigation**: React Navigation 6
- **State Management**: Zustand
- **Backend**: Firebase (Auth, Firestore, Storage)
- **UI**: React Native Paper
- **Charts**: react-native-chart-kit

## Development Tips

1. Use Expo Go for quick testing during development
2. Web version is great for rapid prototyping
3. Use TypeScript - it catches errors early
4. Check the terminal for build errors and warnings
5. Hot reload is enabled - changes appear instantly

## Support

For issues or questions, check:
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Firebase Docs](https://firebase.google.com/docs)
