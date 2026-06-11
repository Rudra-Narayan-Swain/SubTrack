import { useState } from 'react';
import { Mail, Shield, LogOut, Loader2, Bell, Calendar } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { signOut } from '../../firebase/auth';

const avatarColors = ['#6366f1', '#8b5cf6', '#22d3ee', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];
const getAvatarColor = (name?: string) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];

export const Profile = () => {
    const user = useStore(s => s.user);
    const [loading, setLoading] = useState(false);
    const avatarColor = getAvatarColor(user?.name);

    const handleSignOut = async () => {
        setLoading(true);
        try { await signOut(); } catch (e) { console.error(e); setLoading(false); }
    };

    const infoRows = [
        { icon: Mail, label: 'Email Address', value: user?.email },
        { icon: Shield, label: 'Account Role', value: user?.isAdmin ? 'Administrator' : 'Standard User' },
        { icon: Bell, label: 'Notifications', value: user?.notificationPrefs?.reminders ? 'Enabled' : 'Disabled' },
        { icon: Calendar, label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '—' },
    ];

    return (
        <div className="p-6 md:p-10 max-w-3xl mx-auto pb-28 animate-fade-in">

            {/* Header */}
            <div className="mb-8">
                <p className="text-white/30 text-xs uppercase tracking-widest font-semibold mb-1">Account</p>
                <h1 className="text-4xl font-extrabold tracking-tight"
                    style={{ background: 'linear-gradient(135deg, #fff 40%, #fcd34d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Profile
                </h1>
            </div>

            {/* Avatar card */}
            <div className="rounded-2xl p-7 mb-6 relative overflow-hidden flex flex-col md:flex-row items-center gap-7 text-center md:text-left"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {/* Background gradient */}
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at top left, ${avatarColor}15 0%, transparent 60%)` }} />

                {/* Avatar */}
                <div className="relative shrink-0">
                    {/* Glow ring */}
                    <div className="absolute inset-0 rounded-2xl"
                        style={{ boxShadow: `0 0 30px ${avatarColor}60`, borderRadius: '18px' }} />
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-extrabold text-white relative"
                        style={{
                            background: `linear-gradient(135deg, ${avatarColor} 0%, ${avatarColor}bb 100%)`,
                            boxShadow: `0 8px 32px ${avatarColor}55`,
                        }}>
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                </div>

                <div className="relative">
                    <h2 className="text-2xl font-extrabold text-white mb-1">{user?.name}</h2>
                    <p className="text-white/40 text-sm flex items-center justify-center md:justify-start gap-2">
                        <Mail className="w-3.5 h-3.5" /> {user?.email}
                    </p>
                    {user?.isAdmin && (
                        <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold"
                            style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                            <Shield className="w-3 h-3" /> Administrator
                        </span>
                    )}
                </div>
            </div>

            {/* Info rows */}
            <div className="rounded-2xl overflow-hidden mb-6"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                {infoRows.map((row, i) => (
                    <div
                        key={row.label}
                        className="flex items-center justify-between p-5 transition-all duration-200"
                        style={{ borderBottom: i < infoRows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)' }}>
                                <row.icon className="w-4 h-4" style={{ color: '#818cf8' }} />
                            </div>
                            <div>
                                <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">{row.label}</p>
                                <p className="text-white text-sm font-medium mt-0.5">{row.value || '—'}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sign out */}
            <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-sm transition-all duration-200 disabled:opacity-60"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
                    e.currentTarget.style.boxShadow = '0 0 24px rgba(239,68,68,0.2)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            >
                {loading
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : <><LogOut className="w-5 h-5" /> Sign Out</>
                }
            </button>
        </div>
    );
};
