import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { subscribeToUsers, createUser, updateUser, deleteUser, AdminUser } from '../../services/userService';
import { Search, UserPlus, AlertCircle, Link, Check, Trash2, X } from 'lucide-react';

export const UsersManagement = () => {
    const [search, setSearch] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Modal mode: 'new' or 'existing'
    const [mode, setMode] = useState<'new' | 'existing'>('new');

    // Modal form states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [uidInput, setUidInput] = useState('');
    const [role, setRole] = useState('user');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalError, setModalError] = useState('');

    // Real-time Users State
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        setIsLoading(true);
        const unsubscribe = subscribeToUsers(
            (updatedUsers) => {
                setUsers(updatedUsers);
                setIsLoading(false);
                setIsError(false);
            },
            (err) => {
                setError(err);
                setIsError(true);
                setIsLoading(false);
            },
            500
        );
        return () => unsubscribe();
    }, []);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (mode === 'new') {
            if (!email.trim() || !password.trim()) {
                setModalError('Email and Password are required');
                return;
            }
        } else {
            if (!uidInput.trim() || !email.trim()) {
                setModalError('UID and Email are required to link an existing user');
                return;
            }
        }

        setModalError('');
        setIsSubmitting(true);
        try {
            if (mode === 'new') {
                await createUser({
                    name: name.trim(),
                    email: email.trim(),
                    password: password.trim(),
                    role: role,
                    status: 'approved',
                });
            } else {
                // Link existing Auth user to Firestore
                await createUser({
                    id: uidInput.trim(),
                    name: name.trim(),
                    email: email.trim(),
                    role: role,
                    status: 'approved',
                });
            }
            
            setIsCreateModalOpen(false);
            setName('');
            setEmail('');
            setPassword('');
            setUidInput('');
            setRole('user');
            setMode('new');
        } catch (err: any) {
            setModalError(err?.message || 'Failed to create/link user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filtered = search
        ? users.filter(
            (u: any) =>
                u.email?.toLowerCase().includes(search.toLowerCase()) ||
                u.name?.toLowerCase().includes(search.toLowerCase())
        )
        : users;

    return (
        <DashboardLayout title="Users">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400">
                            <UserPlus size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Users Management</h2>
                            <p className="text-sm text-white/50">All mobile app registered users</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setMode('new');
                            setIsCreateModalOpen(true);
                        }}
                        className="btn-primary flex items-center gap-2 py-2 px-4 text-sm"
                    >
                        <UserPlus size={16} />
                        Create User
                    </button>
                </div>

                {/* Error Banner */}
                {isError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3 text-red-400 text-sm">
                        <AlertCircle size={16} />
                        <span>Error fetching users: {(error as any)?.message || 'Unknown error'}</span>
                    </div>
                )}

                {/* Toolbar */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                        <input
                            type="text"
                            placeholder="Search by name or email…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-dark pl-9 w-64"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-white/40 text-sm">
                            {isLoading ? 'Loading…' : `${filtered.length} of ${users.length} users`}
                        </span>
                        <div className="flex items-center gap-2 py-1.5 px-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-white/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live Sync Active
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="glass-card overflow-hidden">
                    {isLoading ? (
                        <div className="p-6 space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="skeleton h-12" />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-white/30 text-lg mb-2">No users found</p>
                            <p className="text-white/20 text-sm">
                                {users.length === 0
                                    ? 'No users exist in the database yet. Make sure your mobile app users have registered.'
                                    : 'No users match your search.'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/[0.06]">
                                        {['#', 'User', 'Email', 'Role', 'Joined', 'Status', 'UID', 'Actions'].map((h) => (
                                            <th key={h} className="text-left py-3 px-4 text-white/40 font-medium text-xs uppercase tracking-wider">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((user: any, idx: number) => (
                                        <tr key={user.id || user.uid || idx} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                                            <td className="py-3.5 px-4 text-white/30 text-xs">{idx + 1}</td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                                        {user.name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? 'U'}
                                                    </div>
                                                    <span className="text-white font-medium">{user.name || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-white/60">{user.email || 'N/A'}</td>
                                            <td className="py-3.5 px-4">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                    user.role === 'admin'
                                                        ? 'bg-brand-500/20 text-brand-400'
                                                        : 'bg-white/[0.06] text-white/40'
                                                }`}>
                                                    {user.role || 'user'}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-white/60">
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                    user.status === 'approved'
                                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/10'
                                                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/10'
                                                }`}>
                                                    {user.status || 'pending'}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-white/30 text-xs font-mono">
                                                {(user.uid || user.id || '').substring(0, 8)}…
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-2">
                                                    {user.status === 'approved' ? (
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    await updateUser(user.id, { status: 'pending' });
                                                                } catch (err: any) {
                                                                    alert(err?.message || 'Failed to suspend user');
                                                                }
                                                            }}
                                                            title="Suspend / Pending User"
                                                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    await updateUser(user.id, { status: 'approved' });
                                                                } catch (err: any) {
                                                                    alert(err?.message || 'Failed to approve user');
                                                                }
                                                            }}
                                                            title="Approve / Accept User"
                                                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={async () => {
                                                            if (window.confirm(`Are you sure you want to delete user ${user.name || user.email}?`)) {
                                                                try {
                                                                    await deleteUser(user.id);
                                                                } catch (err: any) {
                                                                    alert(err?.message || 'Failed to delete user');
                                                                }
                                                            }
                                                        }}
                                                        title="Delete User"
                                                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Create / Link User Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-md p-6 relative overflow-hidden border border-white/10 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                {mode === 'new' ? <UserPlus size={18} className="text-brand-400" /> : <Link size={18} className="text-brand-400" />}
                                {mode === 'new' ? 'Create New User' : 'Link Existing Mobile User'}
                            </h3>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-white/40 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Mode Switcher */}
                        <div className="flex border-b border-white/10 mb-5">
                            <button
                                type="button"
                                onClick={() => { setMode('new'); setModalError(''); }}
                                className={`flex-1 pb-2 font-semibold text-sm transition-colors ${mode === 'new' ? 'text-brand-400 border-b-2 border-brand-500' : 'text-white/40 hover:text-white/60'}`}
                            >
                                Register New
                            </button>
                            <button
                                type="button"
                                onClick={() => { setMode('existing'); setModalError(''); }}
                                className={`flex-1 pb-2 font-semibold text-sm transition-colors ${mode === 'existing' ? 'text-brand-400 border-b-2 border-brand-500' : 'text-white/40 hover:text-white/60'}`}
                            >
                                Link Existing (Expo/Mobile)
                            </button>
                        </div>

                        {modalError && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-red-400 text-xs mb-4 flex items-center gap-2">
                                <AlertCircle size={14} />
                                <span>{modalError}</span>
                            </div>
                        )}

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            {mode === 'existing' && (
                                <div>
                                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                                        User UID (from Firebase Auth)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. uJ93KldF01dks9..."
                                        required
                                        value={uidInput}
                                        onChange={(e) => setUidInput(e.target.value)}
                                        className="input-dark text-sm py-2.5 font-mono"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input-dark text-sm py-2.5"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    placeholder="john@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-dark text-sm py-2.5"
                                />
                            </div>

                            {mode === 'new' && (
                                <div>
                                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input-dark text-sm py-2.5"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                                    Role
                                </label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="input-dark text-sm py-2.5"
                                >
                                    <option value="user">User (Standard)</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="btn-ghost py-2 px-4 text-sm"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Processing...' : mode === 'new' ? 'Create User' : 'Link User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};
