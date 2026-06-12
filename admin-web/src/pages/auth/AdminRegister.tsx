import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUp } from '../../firebase/auth';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';

const friendlyError = (err: any): string => {
    switch (err.code) {
        case 'auth/email-already-in-use':
            return 'An account with this email already exists.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/network-request-failed':
            return 'Network error — Firebase authentication failed. Make sure "localhost" is added to your Firebase Console → Authentication → Settings → Authorized Domains.';
        default:
            return err.message || 'Something went wrong. Please try again.';
    }
};

export const AdminRegister = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const cleanEmail = email.trim().toLowerCase();
        if (cleanEmail !== 'rudraswain1520@gmail.com' || password !== '123456') {
            setError('Registration is restricted to the administrator account.');
            setLoading(false);
            return;
        }

        try {
            await signUp(cleanEmail, password);
            navigate('/');
        } catch (err: any) {
            setError(friendlyError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-600/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="w-full max-w-md relative animate-fadeIn">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 neon-glow">
                        S
                    </div>
                    <h1 className="text-2xl font-bold text-white">Create Admin Account</h1>
                    <p className="text-white/40 mt-1 text-sm">Sign up for your subtrack dashboard</p>
                </div>

                {/* Form */}
                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@subtrack.app"
                                    className="input-dark pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="input-dark pl-10 pr-10"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
                            id="signup-btn"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Creating account…
                                </>
                            ) : (
                                'Sign Up'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-white/60">
                        Already have an account?{' '}
                        <Link to="/login" className="text-brand-400 hover:text-brand-300 transition-colors">
                            Sign in here
                        </Link>
                    </div>
                </div>

                <p className="text-center text-white/30 text-xs mt-6">
                    Subtrack Admin Panel · Unauthorized access is prohibited
                </p>
            </div>
        </div>
    );
};
