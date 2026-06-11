import React, { useEffect, useRef, useState } from 'react';
import { Text, View, ActivityIndicator, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { getAuthInstance, getDb } from './src/firebase/firebaseConfig';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { useStore } from './src/store/useStore';
import { PendingApprovalScreen } from './src/screens/auth/PendingApprovalScreen';
import { subscribeToSubscriptions } from './src/services/subscriptionService';
import { subscribeToPayments } from './src/services/paymentService';
import { initNotifications } from './src/services/notificationService';
import type { User } from './src/types';

// Suppress the expo-notifications Expo Go warning — it's a known limitation,
// not an app error. Local notifications still work in development builds.
LogBox.ignoreLogs([
    'expo-notifications: Android Push notifications',
    '`expo-notifications` functionality is not fully supported in Expo Go',
]);

// Keep the splash screen visible while we fetch auth state
SplashScreen.preventAutoHideAsync().catch(() => { });

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

// ─── Loading Screen ────────────────────────────────────────────────────────────
function LoadingScreen() {
    return (
        <View style={{ flex: 1, backgroundColor: '#07080f', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{
                width: 80, height: 80, borderRadius: 22,
                backgroundColor: '#5b5fff',
                alignItems: 'center', justifyContent: 'center',
            }}>
                <Text style={{ fontSize: 40, fontWeight: '800', color: '#fff' }}>S</Text>
            </View>
            <Text style={{ marginTop: 18, fontSize: 22, fontWeight: '700', color: '#fff', letterSpacing: 1 }}>
                Subtrack
            </Text>
            <ActivityIndicator style={{ marginTop: 20 }} color="#5b5fff" size="large" />
        </View>
    );
}

// ─── Main App ──────────────────────────────────────────────────────────────────
function MainApp() {
    const { user, setUser, setSubscriptions, setPayments, reset } = useStore();
    const [isReady, setIsReady] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const resolvedRef = useRef(false);
    const uidRef = useRef<string | null>(null);

    const finish = (authenticated: boolean) => {
        setIsAuthenticated(authenticated);
        if (!resolvedRef.current) {
            resolvedRef.current = true;
            setIsReady(true);
            SplashScreen.hideAsync().catch(() => { });
        }
    };

    useEffect(() => {
        // Init notifications — silently ignore Expo Go limitations
        try { initNotifications(); } catch { }

        let unsubAuth: (() => void) | null = null;
        let unsubSubs: (() => void) | null = null;
        let unsubPayments: (() => void) | null = null;
        let unsubUserDoc: (() => void) | null = null;

        const timeout = setTimeout(() => {
            if (!resolvedRef.current) {
                reset();
                finish(false);
            }
        }, 5000);

        const startDataListeners = (uid: string) => {
            // Clean up previous listeners before creating new ones
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
                    clearTimeout(timeout);

                    if (!firebaseUser) {
                        // Clean up data listeners on sign-out
                        unsubSubs?.();
                        unsubPayments?.();
                        unsubUserDoc?.();
                        unsubSubs = null;
                        unsubPayments = null;
                        unsubUserDoc = null;
                        uidRef.current = null;
                        reset();
                        finish(false);
                        return;
                    }

                    // Populate initial profile synchronously from firebaseUser to enable instant navigation transition
                    const initialProfile: User = {
                        uid: firebaseUser.uid,
                        name: firebaseUser.displayName ?? firebaseUser.email?.split('@')[0] ?? 'User',
                        email: firebaseUser.email ?? '',
                        status: 'pending', // Default to pending until Firestore says otherwise
                        notificationPrefs: {
                            reminders: true,
                            paymentConfirmations: true,
                            broadcasts: true,
                        },
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };
                    setUser(initialProfile);

                    // Listen to user's Firestore document in real-time
                    unsubUserDoc?.();
                    unsubUserDoc = onSnapshot(doc(getDb(), 'users', firebaseUser.uid), async (snap) => {
                        if (snap.exists()) {
                            const data = snap.data();
                             setUser({ id: snap.id, uid: data.uid || snap.id, ...data } as unknown as User);
                            
                            // Start data listeners if they are not pending or rejected (e.g. approved or admin)
                            if (data.status !== 'pending' && data.status !== 'rejected') {
                                if (uidRef.current !== firebaseUser.uid) {
                                    uidRef.current = firebaseUser.uid;
                                    startDataListeners(firebaseUser.uid);
                                }
                            } else {
                                // If status is pending or rejected, stop data listeners to prevent security rule warnings
                                unsubSubs?.();
                                unsubPayments?.();
                                unsubSubs = null;
                                unsubPayments = null;
                                uidRef.current = null;
                            }
                        } else {
                            // If profile document is missing in Firestore, create it!
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
                        finish(true);
                    }, (err) => {
                        console.warn('[Subtrack] User document snapshot failed:', err);
                        // Fallback on error
                        setUser(initialProfile);
                        finish(true);
                    });
                },
                (error) => {
                    clearTimeout(timeout);
                    console.error('[Subtrack] onAuthStateChanged error:', error);
                    reset();
                    finish(false);
                }
            );
        } catch (e) {
            clearTimeout(timeout);
            console.error('[Subtrack] Firebase init error:', e);
            reset();
            finish(false);
        }

        return () => {
            clearTimeout(timeout);
            unsubAuth?.();
            unsubSubs?.();
            unsubPayments?.();
            unsubUserDoc?.();
        };
    }, []);

    if (!isReady) return <LoadingScreen />;

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
