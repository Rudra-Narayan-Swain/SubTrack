import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Loader2, AlertCircle, Wifi } from 'lucide-react'; // Wifi used in network error alert
import { signUp, updateUserProfile } from '../../firebase/auth';
import { setDocument } from '../../firebase/firestore';

const friendlyError = (code: string): { msg: string; isNetwork: boolean } => {
    switch (code) {
        case 'auth/email-already-in-use':
            return { msg: 'An account with this email already exists.', isNetwork: false };
        case 'auth/weak-password':
            return { msg: 'Password should be at least 6 characters.', isNetwork: false };
        case 'auth/invalid-email':
            return { msg: 'Please enter a valid email address.', isNetwork: false };
        case 'auth/network-request-failed':
            return {
                msg: 'Network error — Firebase cannot be reached. Make sure "localhost" is added to your Firebase Console → Authentication → Settings → Authorized Domains.',
                isNetwork: true,
            };
        default:
            return { msg: 'Something went wrong. Please try again.', isNetwork: false };
    }
};

export const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<{ msg: string; isNetwork: boolean } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password) { setError({ msg: 'Please fill in all fields.', isNetwork: false }); return; }
        setError(null);
        setLoading(true);
        try {
            const cred = await signUp(email, password);
            await updateUserProfile(cred.user, { displayName: name });
            await setDocument('users', cred.user.uid, {
                uid: cred.user.uid,
                name: name,
                email: email,
                role: 'user',
                status: 'pending',
                notificationPrefs: {
                    reminders: true,
                    paymentConfirmations: true,
                    broadcasts: true
                },
                createdAt: new Date().toISOString(),
            });
        } catch (err: any) {
            setError(friendlyError(err.code || ''));
            setLoading(false);
        }
    };

    return (
        <div className="p-2 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-white/50 mb-6">Join Subtrack to start tracking your spend</p>

            {error && (
                <div className={`border rounded-xl p-4 mb-6 text-sm flex items-start gap-3 ${error.isNetwork
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                    {error.isNetwork
                        ? <Wifi className="w-5 h-5 shrink-0 mt-0.5" />
                        : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    }
                    <div>
                        <p>{error.msg}</p>
                        {error.isNetwork && (
                            <a
                                href="https://console.firebase.google.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-2 text-amber-300 underline underline-offset-2 hover:text-amber-200 text-xs"
                            >
                                Open Firebase Console →
                            </a>
                        )}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="label">Full Name</label>
                    <div className="relative">
                        <User className="w-5 h-5 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-field pl-12"
                            placeholder="John Doe"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="label">Email Address</label>
                    <div className="relative">
                        <Mail className="w-5 h-5 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field pl-12"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="label">Password</label>
                    <div className="relative">
                        <Lock className="w-5 h-5 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field pl-12"
                            placeholder="••••••••"
                            minLength={6}
                            required
                        />
                    </div>
                </div>

                <button type="submit" className="btn-primary w-full mt-6" disabled={loading}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                </button>
            </form>

            <p className="text-center mt-6 text-white/50 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-white font-semibold hover:text-primary transition-colors">
                    Sign in
                </Link>
            </p>
        </div>
    );
};
