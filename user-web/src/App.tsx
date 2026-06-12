import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/firebaseConfig';
import { subscribeToDocument, setDocument } from './firebase/firestore';
import { useStore } from './store/useStore';
import type { User } from './types';

// Layouts
import { AuthLayout } from './components/layout/AuthLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { PendingApproval } from './pages/auth/PendingApproval';

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
  if (user.status !== 'approved') return <Navigate to="/pending-approval" replace />;
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
    let docUnsub: (() => void) | null = null;

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (docUnsub) {
        docUnsub();
        docUnsub = null;
      }

      if (firebaseUser) {
        setLoadingAuth(true);
        // Start real-time listener for the user doc
        docUnsub = subscribeToDocument<User>('users', firebaseUser.uid, async (userDoc) => {
          if (userDoc) {
            setUser({ ...userDoc, uid: userDoc.uid || firebaseUser.uid });
          } else {
            const defaultUser: User = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              notificationPrefs: { reminders: true, paymentConfirmations: true, broadcasts: true },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              status: 'pending'
            };
            setUser(defaultUser);
            try {
              await setDocument('users', firebaseUser.uid, defaultUser);
            } catch (err) {
              console.warn('Failed to auto-create missing user profile document:', err);
            }
          }
          setLoadingAuth(false);
        });
      } else {
        setUser(null);
        setLoadingAuth(false);
      }
    });

    return () => {
      unsub();
      if (docUnsub) docUnsub();
    };
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

        {/* Pending Approval Route */}
        <Route element={<AuthLayout />}>
          <Route path="/pending-approval" element={<PendingApproval />} />
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
