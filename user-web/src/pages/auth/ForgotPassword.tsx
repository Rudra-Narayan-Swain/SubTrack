import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { resetPassword } from '../../firebase/auth';

export const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return setError('Please enter your email');
        setError('');
        setLoading(true);
        try {
            await resetPassword(email);
            setSuccess(true);
        } catch (err: any) {
            if (err.code === 'auth/invalid-email') setError('Please enter a valid email address.');
            else setError(err.message?.replace('Firebase: ', '') || 'Failed to send reset code');
        } finally { setLoading(false); }
    };

    return (
        <div className="p-2 animate-fade-in">
            <Link to="/login" className="inline-flex items-center text-white/50 hover:text-white text-sm mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to login
            </Link>
            <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
            <p className="text-white/50 mb-6">Enter your email and we'll send you a link to reset your password</p>

            {success ? (
                <div className="bg-green-500/10 border border-green-500/20 py-8 px-6 text-center rounded-2xl flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Check your email</h3>
                    <p className="text-white/60 text-sm">We've sent a password reset link to {email}</p>
                </div>
            ) : (
                <>
                    {error ? (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-4 mb-6 text-sm flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    ) : null}

                    <form onSubmit={handleSubmit} className="space-y-4">
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

                        <button type="submit" className="btn-primary w-full mt-6 pt-4 pb-4" disabled={loading}>
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                        </button>
                    </form>
                </>
            )}
        </div>
    );
};
