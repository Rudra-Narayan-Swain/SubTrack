import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/firebaseConfig';
import { getDocument } from './firebase/firestore';
import { useStore } from './store/useStore';
import type { User } from './types';

// Layouts
import { AuthLayout } from './components/layout/AuthLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';

// Dashboard Pages
import { Dashboard } from './pages/dashboard/Dashboard';
import { SubscriptionsList } from './pages/subscriptions/SubscriptionsList';
import { AddSubscription } from './pages/subscriptions/AddSubscription';
import { PaymentsList } from './pages/payments/PaymentsList';
import { AddPayment } from './pages/payments/AddPayment';
import { Analytics } from './pages/analytics/Analytics';
import { Profile } from './pages/profile/Profile';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loadingAuth } = useStore();
  if (loadingAuth) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="relative">
        <div className="w-12 h-12 rounded-full animate-spin" style={{ background: 'conic-gradient(from 0deg, #6366f1, #8b5cf6, transparent)', padding: '3px' }}>
          <div className="w-full h-full rounded-full bg-background" />
        </div>
        <div className="absolute inset-0 rounded-full animate-pulse-glow" />
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loadingAuth } = useStore();
  if (loadingAuth) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="relative">
        <div className="w-12 h-12 rounded-full animate-spin" style={{ background: 'conic-gradient(from 0deg, #6366f1, #8b5cf6, transparent)', padding: '3px' }}>
          <div className="w-full h-full rounded-full bg-background" />
        </div>
        <div className="absolute inset-0 rounded-full animate-pulse-glow" />
      </div>
    </div>
  );
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export default function App() {
  const { setUser, setLoadingAuth } = useStore();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDocument<User>('users', firebaseUser.uid);
          if (userDoc) {
            setUser({ ...userDoc, uid: userDoc.uid || firebaseUser.uid });
          } else {
            setUser({
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              notificationPrefs: { reminders: true, paymentConfirmations: true, broadcasts: true },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
        } catch (e: any) {
          // If Firestore is offline or permission denied, just use basic auth info
          if (e?.code !== 'unavailable') {
            console.warn('Could not fetch user profile:', e.message);
          }
          setUser({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            notificationPrefs: { reminders: true, paymentConfirmations: true, broadcasts: true },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      } else {
        setUser(null);
      }
      setLoadingAuth(false);
    });
    return () => unsub();
  }, [setUser, setLoadingAuth]);

  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Private Routes */}
        <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/subscriptions" element={<SubscriptionsList />} />
          <Route path="/subscriptions/new" element={<AddSubscription />} />
          <Route path="/payments" element={<PaymentsList />} />
          <Route path="/payments/new/:subId" element={<AddPayment />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
