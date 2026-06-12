import { Navigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { signOut } from '../../firebase/auth';
import { Clock, AlertTriangle, LogOut } from 'lucide-react';
import { useState } from 'react';

export const PendingApproval = () => {
    const { user } = useStore();
    const [loading, setLoading] = useState(false);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.status === 'approved') {
        return <Navigate to="/" replace />;
    }

    const handleSignOut = async () => {
        setLoading(true);
        try {
            await signOut();
        } catch (err) {
            console.error('Failed to sign out', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-2 animate-fade-in text-center">
            {user.status === 'rejected' ? (
                <>
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto mb-6">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
                    <p className="text-white/50 mb-8 text-sm">
                        Your account has been rejected or suspended. Please contact support or the administrator for assistance.
                    </p>
                </>
            ) : (
                <>
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto mb-6 relative">
                        <div className="absolute inset-0 rounded-2xl bg-amber-500/5 animate-pulse" />
                        <Clock className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Pending Approval</h2>
                    <p className="text-white/50 mb-8 text-sm">
                        Your account has been created and is currently pending approval by an administrator. Once approved, you will automatically gain access.
                    </p>
                </>
            )}

            <button
                onClick={handleSignOut}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
            >
                <LogOut className="w-4 h-4" />
                {loading ? 'Signing out...' : 'Sign Out'}
            </button>
        </div>
    );
};
