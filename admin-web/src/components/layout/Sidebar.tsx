import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, CreditCard, Bell, Settings,
    LogOut, ChevronLeft, ChevronRight, BookOpen,
} from 'lucide-react';
import { useState } from 'react';
import { signOut } from '../../firebase/auth';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/users', icon: Users, label: 'Users' },
    { to: '/subscriptions', icon: BookOpen, label: 'Subscriptions' },
    { to: '/payments', icon: CreditCard, label: 'Payments' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
    { to: '/settings', icon: Settings, label: 'Settings' },
];

export const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <aside
            className={`relative flex flex-col h-screen bg-dark-900 border-r border-white/[0.06] transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'
                }`}
        >
            {/* Logo */}
            <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/[0.06] ${collapsed ? 'justify-center' : ''}`}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    S
                </div>
                {!collapsed && (
                    <div>
                        <span className="font-bold text-white">Subtrack</span>
                        <span className="block text-[10px] text-white/40 uppercase tracking-widest">Admin</span>
                    </div>
                )}
            </div>

            {/* Nav Items */}
            <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${isActive
                                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/20'
                                : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
                            } ${collapsed ? 'justify-center' : ''}`
                        }
                        title={collapsed ? label : undefined}
                    >
                        <Icon size={18} className="flex-shrink-0" />
                        {!collapsed && <span>{label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Sign out */}
            <div className="p-2 border-t border-white/[0.06]">
                <button
                    onClick={handleSignOut}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-all text-white/50 hover:text-red-400 hover:bg-red-500/10 ${collapsed ? 'justify-center' : ''
                        }`}
                    title={collapsed ? 'Sign Out' : undefined}
                >
                    <LogOut size={18} className="flex-shrink-0" />
                    {!collapsed && <span>Sign Out</span>}
                </button>
            </div>

            {/* Collapse toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-dark-700 border border-white/[0.08] flex items-center justify-center text-white/60 hover:text-white hover:bg-dark-600 transition-all z-10"
            >
                {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>
        </aside>
    );
};
