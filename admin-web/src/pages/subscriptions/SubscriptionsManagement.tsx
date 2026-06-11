import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SubscriptionsTable } from '../../components/tables/SubscriptionsTable';
import { getSubscriptions } from '../../services/subscriptionService';
import { RefreshCw } from 'lucide-react';
import type { SubscriptionStatus } from '../../../../shared/index';

const STATUS_FILTERS: { label: string; value: SubscriptionStatus | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Paused', value: 'paused' },
    { label: 'Cancelled', value: 'cancelled' },
];

export const SubscriptionsManagement = () => {
    const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | 'all'>('all');

    const { data: subscriptions = [], isLoading, refetch } = useQuery({
        queryKey: ['subscriptions', statusFilter],
        queryFn: () => getSubscriptions(statusFilter === 'all' ? undefined : statusFilter),
    });

    return (
        <DashboardLayout title="Subscriptions">
            <div className="space-y-4">
                {/* Filters */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                        {STATUS_FILTERS.map(({ label, value }) => (
                            <button
                                key={value}
                                onClick={() => setStatusFilter(value)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === value
                                        ? 'bg-brand-500/20 text-brand-400 border border-brand-500/20'
                                        : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
                                    }`}
                                id={`filter-${value}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-white/40 text-sm">{subscriptions.length} results</span>
                        <button onClick={() => refetch()} className="btn-ghost flex items-center gap-2 py-2 px-3">
                            <RefreshCw size={14} />
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="glass-card overflow-hidden">
                    {isLoading ? (
                        <div className="p-6 space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="skeleton h-12" />
                            ))}
                        </div>
                    ) : (
                        <SubscriptionsTable subscriptions={subscriptions} />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};
