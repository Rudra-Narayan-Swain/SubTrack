import type { User } from '../../../../shared/index';
import { Trash2, Edit2 } from 'lucide-react';

interface Props {
    users: User[];
    onEdit?: (user: User) => void;
    onDelete?: (uid: string) => void;
}

export const UsersTable = ({ users, onEdit, onDelete }: Props) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-white/[0.06]">
                        {['User', 'Email', 'Phone', 'Joined', 'Actions'].map((h) => (
                            <th key={h} className="text-left py-3 px-4 text-white/40 font-medium text-xs uppercase tracking-wider">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.uid} className="border-b border-white/[0.04] table-row-hover">
                            <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                        {user.name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? 'U'}
                                    </div>
                                    <span className="text-white font-medium">{user.name || 'N/A'}</span>
                                </div>
                            </td>
                            <td className="py-3.5 px-4 text-white/60">{user.email || 'N/A'}</td>
                            <td className="py-3.5 px-4 text-white/60">{user.phone || '—'}</td>
                            <td className="py-3.5 px-4 text-white/60">
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                            </td>
                            <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2">
                                    {onEdit && (
                                        <button
                                            onClick={() => onEdit(user)}
                                            className="p-1.5 rounded-lg text-white/40 hover:text-brand-400 hover:bg-brand-500/10 transition-all"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={() => onDelete(user.uid)}
                                            className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    {users.length === 0 && (
                        <tr>
                            <td colSpan={5} className="text-center py-12 text-white/30">
                                No users found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
