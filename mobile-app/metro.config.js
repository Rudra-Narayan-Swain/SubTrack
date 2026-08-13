const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Enable .cjs extension for Firebase 10
config.resolver.sourceExts = [
    ...config.resolver.sourceExts.filter((e) => e !== 'cjs'),
    'cjs',
];
config.resolver.assetExts = config.resolver.assetExts.filter((e) => e !== 'cjs');

// Force Metro cache refresh
config.cacheVersion = 'firebase-rn-clean-v1';

// Direct module resolution mapping — avoids recursive resolveRequest stalls
config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules,
    '@firebase/app': path.resolve(__dirname, 'node_modules/@firebase/app'),
    '@firebase/component': path.resolve(__dirname, 'node_modules/@firebase/component'),
    '@firebase/auth': path.resolve(__dirname, 'node_modules/@firebase/auth'),
    'firebase/auth': path.resolve(__dirname, 'node_modules/@firebase/auth/dist/rn/index.js'),
};

module.exports = config;
