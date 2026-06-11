import { useState, FormEvent } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { addDocument, getCollection } from '../../firebase/firestore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AdminSettings as AdminSettingsType } from '../../../../shared/index';
import { Plus, Settings as SettingsIcon } from 'lucide-react';

const DEFAULT_CATEGORIES = [
    { name: 'streaming', icon: '🎬', color: '#ef4444' },
    { name: 'music', icon: '🎵', color: '#8b5cf6' },
    { name: 'gaming', icon: '🎮', color: '#06b6d4' },
    { name: 'software', icon: '💻', color: '#10b981' },
    { name: 'news', icon: '📰', color: '#f59e0b' },
    { name: 'fitness', icon: '💪', color: '#ec4899' },
    { name: 'cloud', icon: '☁️', color: '#5b5fff' },
    { name: 'other', icon: '📦', color: '#6b7280' },
];

export const AdminSettings = () => {
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');
    const queryClient = useQueryClient();

    const { data: settings = [] } = useQuery({
        queryKey: ['admin-settings'],
        queryFn: () => getCollection<AdminSettingsType>('admin_settings', []),
    });

    const addSetting = useMutation({
        mutationFn: ({ key, value }: { key: string; value: string }) =>
            addDocument('admin_settings', { key, value, type: 'string' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
            setNewKey('');
            setNewValue('');
        },
    });

    const handleAddSetting = (e: FormEvent) => {
        e.preventDefault();
        if (!newKey || !newValue) return;
        addSetting.mutate({ key: newKey, value: newValue });
    };

    return (
        <DashboardLayout title="Settings">
            <div className="max-w-3xl space-y-6">
                {/* Categories */}
                <div className="glass-card p-6">
                    <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
                        <SettingsIcon size={18} className="text-brand-400" />
                        Subscription Categories
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {DEFAULT_CATEGORIES.map((cat) => (
                            <div
                                key={cat.name}
                                className="flex items-center gap-2 glass-card p-3 rounded-xl"
                            >
                                <span className="text-xl">{cat.icon}</span>
                                <span className="text-white/70 text-sm capitalize">{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* App settings key-value */}
                <div className="glass-card p-6">
                    <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                        <Plus size={18} className="text-brand-400" />
                        Application Settings
                    </h2>

                    {/* Existing settings */}
                    {settings.length > 0 && (
                        <div className="space-y-2 mb-5">
                            {settings.map((s) => (
                                <div key={s.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                                    <div>
                                        <p className="text-white text-sm font-medium">{s.key}</p>
                                        <p className="text-white/40 text-xs mt-0.5">{s.value}</p>
                                    </div>
                                    <span className="badge badge-blue">{s.type}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add new setting */}
                    <form onSubmit={handleAddSetting} className="flex gap-3 flex-wrap">
                        <input
                            type="text"
                            value={newKey}
                            onChange={(e) => setNewKey(e.target.value)}
                            placeholder="Key (e.g. MAX_SUBSCRIPTIONS)"
                            className="input-dark flex-1 min-w-40"
                            id="setting-key"
                        />
                        <input
                            type="text"
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                            placeholder="Value"
                            className="input-dark flex-1 min-w-40"
                            id="setting-value"
                        />
                        <button type="submit" className="btn-primary flex items-center gap-2" id="add-setting-btn">
                            <Plus size={16} />
                            Add
                        </button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};
