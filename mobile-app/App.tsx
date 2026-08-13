import React, { useEffect, useRef, useState } from 'react';
import { Text, View, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { getAuthInstance, getDb } from './src/firebase/firebaseConfig';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { useStore } from './src/store/useStore';
import { PendingApprovalScreen } from './src/screens/auth/PendingApprovalScreen';
import { subscribeToSubscriptions } from './src/services/subscriptionService';
import { subscribeToPayments } from './src/services/paymentService';
import { initNotifications } from './src/services/notificationService';
import type { User } from './src/types';

// Suppress Expo Go environment warnings & deprecations
LogBox.ignoreLogs([
    'expo-notifications: Android Push notifications',
    '`expo-notifications` functionality is not fully supported in Expo Go',
    'SafeAreaView has been deprecated and will be removed in a future release',
    '"info-outline" is not a valid icon name',
]);

// Hide splash screen immediately on mount
try {
    SplashScreen.hideAsync().catch(() => { });
} catch {
    // Ignore
}

// ─── Error Boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { err: string | null }
> {
    state = { err: null };
    static getDerivedStateFromError(e: any) {
        return { err: String(e?.message ?? e) };
    }
    render() {
        if (this.state.err) {
            return (
                <View style={{ flex: 1, backgroundColor: '#07080f', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <Text style={{ color: '#f87171', fontSize: 16, textAlign: 'center', fontWeight: '600' }}>
                        {this.state.err}
                    </Text>
                </View>
            );
        }
        return this.props.children;
    }
}

// ─── Main App ──────────────────────────────────────────────────────────────────
function MainApp() {
    const { user, setUser, setSubscriptions, setPayments, reset } = useStore();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const uidRef = useRef<string | null>(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    useEffect(() => {
        try { initNotifications(); } catch { }

        let unsubAuth: (() => void) | null = null;
        let unsubSubs: (() => void) | null = null;
        let unsubPayments: (() => void) | null = null;
        let unsubUserDoc: (() => void) | null = null;

        const startDataListeners = (uid: string) => {
            unsubSubs?.();
            unsubPayments?.();
            unsubSubs = subscribeToSubscriptions(uid, setSubscriptions);
            unsubPayments = subscribeToPayments(uid, setPayments);
        };

        try {
            const auth = getAuthInstance();

            unsubAuth = onAuthStateChanged(
                auth,
                async (firebaseUser) => {
                    if (!firebaseUser) {
                        unsubSubs?.();
                        unsubPayments?.();
                        unsubUserDoc?.();
                        unsubSubs = null;
                        unsubPayments = null;
                        unsubUserDoc = null;
                        uidRef.current = null;
                        reset();
                        if (isMounted.current) setIsAuthenticated(false);
                        return;
                    }

                    const initialProfile: User = {
                        uid: firebaseUser.uid,
                        name: firebaseUser.displayName ?? firebaseUser.email?.split('@')[0] ?? 'User',
                        email: firebaseUser.email ?? '',
                        status: 'pending',
                        notificationPrefs: {
                            reminders: true,
                            paymentConfirmations: true,
                            broadcasts: true,
                        },
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };
                    setUser(initialProfile);
                    if (isMounted.current) setIsAuthenticated(true);

                    // Hydrate user profile in background
                    unsubUserDoc?.();
                    unsubUserDoc = onSnapshot(doc(getDb(), 'users', firebaseUser.uid), async (snap) => {
                        if (!isMounted.current) return;
                        if (snap.exists()) {
                            const data = snap.data();
                            setUser({ id: snap.id, uid: data.uid || snap.id, ...data } as unknown as User);
                            
                            if (data.status !== 'pending' && data.status !== 'rejected') {
                                if (uidRef.current !== firebaseUser.uid) {
                                    uidRef.current = firebaseUser.uid;
                                    startDataListeners(firebaseUser.uid);
                                }
                            } else {
                                unsubSubs?.();
                                unsubPayments?.();
                                unsubSubs = null;
                                unsubPayments = null;
                                uidRef.current = null;
                            }
                        } else {
                            const now = new Date().toISOString();
                            const profileData = {
                                uid: firebaseUser.uid,
                                name: firebaseUser.displayName ?? firebaseUser.email?.split('@')[0] ?? 'User',
                                email: firebaseUser.email ?? '',
                                status: 'pending',
                                notificationPrefs: {
                                    reminders: true,
                                    paymentConfirmations: true,
                                    broadcasts: true,
                                },
                                createdAt: now,
                                updatedAt: now,
                            };
                            await setDoc(doc(getDb(), 'users', firebaseUser.uid), profileData);
                        }
                    }, (err) => {
                        console.warn('[Subtrack] User snapshot error:', err);
                    });
                },
                (error) => {
                    console.error('[Subtrack] Auth state error:', error);
                    reset();
                    if (isMounted.current) setIsAuthenticated(false);
                }
            );
        } catch (e) {
            console.error('[Subtrack] Firebase init error:', e);
            reset();
            if (isMounted.current) setIsAuthenticated(false);
        }

        return () => {
            unsubAuth?.();
            unsubSubs?.();
            unsubPayments?.();
            unsubUserDoc?.();
        };
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <NavigationContainer>
                    <StatusBar style="light" />
                    {isAuthenticated ? (
                        user?.status === 'pending' ? (
                            <PendingApprovalScreen />
                        ) : (
                            <AppNavigator />
                        )
                    ) : (
                        <AuthNavigator />
                    )}
                </NavigationContainer>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

// ─── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
    return (
        <ErrorBoundary>
            <MainApp />
        </ErrorBoundary>
    );
}
