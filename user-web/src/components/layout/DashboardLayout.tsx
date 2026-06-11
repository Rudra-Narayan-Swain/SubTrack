import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, List, CreditCard, BarChart3, User, LogOut, Zap } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { signOut } from '../../firebase/auth';

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', color: '#6366f1' },
    { icon: List, label: 'Subscriptions', path: '/subscriptions', color: '#8b5cf6' },
    { icon: CreditCard, label: 'Payments', path: '/payments', color: '#22d3ee' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics', color: '#10b981' },
    { icon: User, label: 'Profile', path: '/profile', color: '#f59e0b' },
];

// Generate gradient avatar color from name initial
const avatarColors: Record<string, string> = {
    A: '#6366f1', B: '#8b5cf6', C: '#22d3ee', D: '#10b981', E: '#f59e0b',
    F: '#ef4444', G: '#06b6d4', H: '#3b82f6', I: '#a855f7', J: '#14b8a6',
    default: '#6366f1',
};
const getAvatarColor = (name?: string) =>
    avatarColors[name?.charAt(0).toUpperCase() || 'default'] || avatarColors.default;

export const DashboardLayout = () => {
    const navigate = useNavigate();
    const user = useStore((s) => s.user);
    const avatarColor = getAvatarColor(user?.name);

    const handleSignOut = async () => {
        try { await signOut(); navigate('/login'); }
        catch (e) { console.error(e); }
    };

    return (
        <div className="flex h-screen bg-background overflow-hidden relative selection:bg-primary/30">

            {/* Sidebar */}
            <aside className="w-64 flex flex-col z-10 hidden md:flex relative"
                style={{ background: 'linear-gradient(180deg, #09091a 0%, #07080f 100%)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>

                {/* Top glow line */}
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)' }} />

                {/* Logo */}
                <div className="h-20 flex items-center px-6 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mr-3 shrink-0"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.45)' }}>
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-extrabold tracking-tight"
                        style={{ background: 'linear-gradient(135deg, #fff 30%, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Subtrack
                    </span>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm group relative overflow-hidden ${isActive
                                    ? 'text-white'
                                    : 'text-white/40 hover:text-white/80 hover:bg-white/4'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <div className="absolute inset-0 rounded-xl"
                                            style={{
                                                background: `linear-gradient(135deg, ${item.color}22 0%, ${item.color}08 100%)`,
                                                borderLeft: `3px solid ${item.color}`,
                                            }} />
                                    )}
                                    <item.icon className="w-5 h-5 relative z-10 transition-transform duration-200 group-hover:scale-110"
                                        style={isActive ? { color: item.color } : {}} />
                                    <span className="relative z-10">{item.label}</span>
                                    {isActive && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full relative z-10"
                                            style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User section */}
                <div className="p-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl mb-1"
                        style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                            style={{ background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}bb)`, boxShadow: `0 4px 12px ${avatarColor}55` }}>
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                            <p className="text-xs text-white/30 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-2.5 w-full text-left rounded-xl transition-all duration-200 text-sm font-medium text-red-400/70 hover:text-red-400 group"
                        style={{ background: 'transparent' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                        <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 relative overflow-y-auto">
                <Outlet />
            </main>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 pb-safe z-50"
                style={{ background: 'rgba(7,8,15,0.9)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex justify-around items-center h-16 px-4">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200"
                        >
                            {({ isActive }) => (
                                <>
                                    <div className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200"
                                        style={isActive ? {
                                            background: `linear-gradient(135deg, ${item.color}22, ${item.color}11)`,
                                            boxShadow: `0 0 12px ${item.color}44`,
                                        } : {}}>
                                        <item.icon className="w-5 h-5 transition-colors duration-200"
                                            style={{ color: isActive ? item.color : 'rgba(255,255,255,0.35)' }} />
                                    </div>
                                    {isActive && (
                                        <div className="w-1 h-1 rounded-full"
                                            style={{ background: item.color, boxShadow: `0 0 4px ${item.color}` }} />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>
        </div>
    );
};
