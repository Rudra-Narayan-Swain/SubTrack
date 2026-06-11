import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { RevenueChart } from '../../components/charts/RevenueChart';
import { SubscriptionChart } from '../../components/charts/SubscriptionChart';
import { getDashboardStats } from '../../services/analyticsService';
import { Users, CreditCard, BookOpen, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({
    label,
    value,
    sub,
    icon: Icon,
    trend,
    color,
}: {
    label: string;
    value: string | number;
    sub?: string;
    icon: any;
    trend?: 'up' | 'down';
    color: string;
}) => (
    <div className="stat-card flex items-start justify-between">
        <div>
            <p className="text-white/50 text-sm mb-1">{label}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
            {sub && (
                <p className={`text-xs mt-1.5 flex items-center gap-1 ${trend === 'up' ? 'text-emerald-400' : 'text-white/40'}`}>
                    {trend === 'up' && <ArrowUpRight size={12} />}
                    {trend === 'down' && <ArrowDownRight size={12} />}
                    {sub}
                </p>
            )}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
            <Icon size={22} className="text-white" />
        </div>
    </div>
);

export const Dashboard = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: getDashboardStats,
        staleTime: 5 * 60 * 1000,
    });

    return (
        <DashboardLayout title="Dashboard">
            <div className="space-y-6">
                {/* KPI Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <StatCard
                        label="Total Users"
                        value={isLoading ? '—' : stats?.users.total ?? 0}
                        sub={isLoading ? undefined : `+${stats?.users.newThisMonth ?? 0} this month`}
                        trend="up"
                        icon={Users}
                        color="bg-brand-500/20"
                    />
                    <StatCard
                        label="Active Subscriptions"
                        value={isLoading ? '—' : stats?.subscriptions.active ?? 0}
                        sub={isLoading ? undefined : `${stats?.subscriptions.total ?? 0} total`}
                        icon={BookOpen}
                        color="bg-emerald-500/20"
                    />
                    <StatCard
                        label="Monthly Revenue"
                        value={isLoading ? '—' : `$${(stats?.payments.monthlyRevenue ?? 0).toLocaleString()}`}
                        sub="This month"
                        trend="up"
                        icon={TrendingUp}
                        color="bg-purple-500/20"
                    />
                    <StatCard
                        label="Total Payments"
                        value={isLoading ? '—' : stats?.payments.total ?? 0}
                        sub={isLoading ? undefined : `${stats?.payments.failed ?? 0} failed`}
                        icon={CreditCard}
                        color="bg-amber-500/20"
                    />
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <div className="xl:col-span-2 glass-card p-6">
                        <h2 className="text-base font-semibold text-white mb-4">Revenue Trend (6 months)</h2>
                        {isLoading ? (
                            <div className="skeleton h-[220px]" />
                        ) : (
                            <RevenueChart data={stats?.revenueTrend ?? []} />
                        )}
                    </div>
                    <div className="glass-card p-6">
                        <h2 className="text-base font-semibold text-white mb-4">Subscriptions by Category</h2>
                        {isLoading ? (
                            <div className="skeleton h-[220px]" />
                        ) : (
                            <SubscriptionChart data={stats?.subscriptions.byCategory ?? {}} />
                        )}
                    </div>
                </div>

                {/* Summary tiles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: 'Lifetime Revenue', value: `$${(stats?.payments.totalRevenue ?? 0).toLocaleString()}`, color: 'text-brand-400' },
                        { label: 'Cancelled Subs', value: stats?.subscriptions.cancelled ?? 0, color: 'text-red-400' },
                        { label: 'Pending Payments', value: stats?.payments.pending ?? 0, color: 'text-amber-400' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="glass-card p-5 flex items-center justify-between">
                            <span className="text-white/50 text-sm">{label}</span>
                            <span className={`text-xl font-bold ${color}`}>{isLoading ? '—' : value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};
