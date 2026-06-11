import { useState, FormEvent } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { functions } from '../../firebase/firebaseConfig';
import { httpsCallable } from 'firebase/functions';
import { Send, Bell, Users, User, CheckCircle } from 'lucide-react';

export const NotificationCenter = () => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [targetUserId, setTargetUserId] = useState('');
    const [mode, setMode] = useState<'all' | 'specific'>('all');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSend = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);
        try {
            const sendBroadcast = httpsCallable(functions, 'sendAdminBroadcast');
            const result = await sendBroadcast({
                title,
                body,
                targetUserId: mode === 'specific' ? targetUserId : undefined,
            }) as any;
            setSuccess(`Notification sent to ${result.data.sent} device${result.data.sent !== 1 ? 's' : ''}.`);
            setTitle('');
            setBody('');
            setTargetUserId('');
        } catch (err: any) {
            setError(err.message || 'Failed to send notification.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="Notification Center">
            <div className="max-w-2xl space-y-6">
                {/* Mode selector */}
                <div className="glass-card p-5">
                    <p className="text-white/60 text-sm mb-3">Audience</p>
                    <div className="flex gap-3">
                        {[
                            { value: 'all', label: 'All Users', icon: Users },
                            { value: 'specific', label: 'Specific User', icon: User },
                        ].map(({ value, label, icon: Icon }) => (
                            <button
                                key={value}
                                onClick={() => setMode(value as 'all' | 'specific')}
                                id={`mode-${value}`}
                                className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${mode === value
                                        ? 'bg-brand-500/20 border-brand-500/30 text-brand-400'
                                        : 'bg-white/[0.04] border-white/[0.08] text-white/60 hover:border-white/20 hover:text-white'
                                    }`}
                            >
                                <Icon size={16} />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Compose form */}
                <form onSubmit={handleSend} className="glass-card p-6 space-y-5">
                    <h2 className="text-base font-semibold text-white flex items-center gap-2">
                        <Bell size={18} className="text-brand-400" />
                        Compose Notification
                    </h2>

                    {mode === 'specific' && (
                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">User ID</label>
                            <input
                                type="text"
                                value={targetUserId}
                                onChange={(e) => setTargetUserId(e.target.value)}
                                placeholder="Firebase User UID"
                                className="input-dark"
                                required={mode === 'specific'}
                                id="target-user-id"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Notification title"
                            className="input-dark"
                            required
                            id="notif-title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Message</label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Notification body text…"
                            rows={4}
                            className="input-dark resize-none"
                            required
                            id="notif-body"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-emerald-400 text-sm flex items-center gap-2">
                            <CheckCircle size={16} />
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex items-center gap-2"
                        id="send-notif-btn"
                    >
                        <Send size={16} />
                        {loading ? 'Sending…' : mode === 'all' ? 'Broadcast to All Users' : 'Send to User'}
                    </button>
                </form>
            </div>
        </DashboardLayout>
    );
};
