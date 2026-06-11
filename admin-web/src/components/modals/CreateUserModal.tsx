import { useState, FormEvent } from 'react';
import { X, Loader2 } from 'lucide-react';
import { createUser } from '../../services/userService';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateUserModal = ({ isOpen, onClose, onSuccess }: CreateUserModalProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<'user' | 'admin'>('user');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await createUser({
                email,
                password,
                name,
                role
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-dark-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">Create New User</h2>
                    <button onClick={onClose} className="p-2 text-white/50 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter user's name"
                                className="input-dark w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="user@example.com"
                                className="input-dark w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Min 6 characters"
                                className="input-dark w-full"
                                required
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">Role</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
                                className="input-dark w-full"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn-secondary flex-1"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary flex-1 flex items-center justify-center gap-2"
                                disabled={loading}
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Create User'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
