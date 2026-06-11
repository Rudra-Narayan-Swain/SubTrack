import { Bell, Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
    title: string;
}

export const Header = ({ title }: HeaderProps) => {
    const { user } = useAuth();

    return (
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-dark-900/50 backdrop-blur-sm">
            <h1 className="text-xl font-semibold text-white">{title}</h1>

            <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative hidden md:block">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-white/[0.05] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 outline-none w-52 focus:border-brand-500/60 focus:bg-white/[0.08] transition-all"
                    />
                </div>

                {/* Notifications */}
                <button className="relative w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.09] transition-all">
                    <Bell size={16} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 border border-dark-900" />
                </button>

                {/* User avatar */}
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                        {user?.email?.[0]?.toUpperCase() ?? 'A'}
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-medium text-white leading-none">Admin</p>
                        <p className="text-xs text-white/40 mt-0.5 truncate max-w-[120px]">{user?.email}</p>
                    </div>
                </div>
            </div>
        </header>
    );
};
