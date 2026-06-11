import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminLogin } from '../pages/auth/AdminLogin';
import { AdminRegister } from '../pages/auth/AdminRegister';
import { Dashboard } from '../pages/dashboard/Dashboard';
import { UsersManagement } from '../pages/users/UsersManagement';
import { SubscriptionsManagement } from '../pages/subscriptions/SubscriptionsManagement';
import { PaymentsManagement } from '../pages/payments/PaymentsManagement';
import { NotificationCenter } from '../pages/notifications/NotificationCenter';
import { AdminSettings } from '../pages/settings/AdminSettings';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-950 flex items-center justify-center">
                <Loader2 size={32} className="text-brand-400 animate-spin" />
            </div>
        );
    }

    if (!user || !isAdmin) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/register" element={<AdminRegister />} />
            <Route path="/login" element={<AdminLogin />} />

            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><UsersManagement /></ProtectedRoute>} />
            <Route path="/subscriptions" element={<ProtectedRoute><SubscriptionsManagement /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><PaymentsManagement /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationCenter /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};
