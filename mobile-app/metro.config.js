const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Firebase 10 ships .cjs files — Metro must treat them as source, not assets.
config.resolver.sourceExts = [
    ...config.resolver.sourceExts.filter((e) => e !== 'cjs'),
    'cjs',
];
config.resolver.assetExts = config.resolver.assetExts.filter((e) => e !== 'cjs');

// Bump to force full Metro cache invalidation.
config.cacheVersion = 'firebase-rn-fix-v4';

// The root cause of "Component auth has not been registered yet":
//
// @firebase/app has "browser": "dist/esm/index.esm2017.js" — an ESM file.
// @firebase/auth (RN build) requires '@firebase/app' at runtime, which Metro
// resolves to the ESM browser build. But firebaseConfig.ts also imports
// '@firebase/app', resolved the same way. The problem: Hermes/Metro treats
// ESM and CJS as separate module instances even for the same package, creating
// TWO @firebase/app registries. auth registers in one; initializeApp runs in
// the other → "Component auth has not been registered yet".
//
// Fix: use resolveRequest to pin @firebase/app, @firebase/component, and
// @firebase/auth to their CJS builds so Metro always uses one module instance.

config.resolver.resolveRequest = (context, moduleName, platform) => {
    switch (moduleName) {
        case '@firebase/app':
            return {
                filePath: path.resolve(__dirname, 'node_modules/@firebase/app/dist/index.cjs.js'),
                type: 'sourceFile',
            };
        case '@firebase/auth':
            return {
                filePath: path.resolve(__dirname, 'node_modules/@firebase/auth/dist/rn/index.js'),
                type: 'sourceFile',
            };
        case 'firebase/auth':
            return {
                filePath: path.resolve(__dirname, 'node_modules/@firebase/auth/dist/rn/index.js'),
                type: 'sourceFile',
            };
        default:
            return context.resolveRequest(context, moduleName, platform);
    }
};

module.exports = config;
