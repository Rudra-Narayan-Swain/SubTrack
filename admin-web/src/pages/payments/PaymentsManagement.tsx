import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { PaymentsTable } from '../../components/tables/PaymentsTable';
import { getPayments, getPaymentStats } from '../../services/paymentService';
import { RefreshCw, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';

export const PaymentsManagement = () => {
    const { data: payments = [], isLoading: loadingPayments, refetch } = useQuery({
        queryKey: ['payments'],
        queryFn: () => getPayments(200),
    });

    const { data: stats } = useQuery({
        queryKey: ['payment-stats'],
        queryFn: getPaymentStats,
    });

    return (
        <DashboardLayout title="Payments">
            <div className="space-y-4">
                {/* Mini stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: 'Monthly Revenue', value: `$${(stats?.monthlyRevenue ?? 0).toLocaleString()}`, icon: DollarSign, color: 'text-brand-400' },
                        { label: 'Completed', value: stats?.completed ?? 0, icon: CheckCircle, color: 'text-emerald-400' },
                        { label: 'Failed', value: stats?.failed ?? 0, icon: AlertCircle, color: 'text-red-400' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="glass-card p-5 flex items-center justify-between">
                            <div>
                                <p className="text-white/50 text-xs mb-1">{label}</p>
                                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                            </div>
                            <Icon size={24} className={`${color} opacity-60`} />
                        </div>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <span className="text-white/40 text-sm">{payments.length} records</span>
                    <button onClick={() => refetch()} className="btn-ghost flex items-center gap-2 py-2 px-3">
                        <RefreshCw size={14} />
                        Refresh
                    </button>
                </div>

                {/* Table */}
                <div className="glass-card overflow-hidden">
                    {loadingPayments ? (
                        <div className="p-6 space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="skeleton h-12" />
                            ))}
                        </div>
                    ) : (
                        <PaymentsTable payments={payments} />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};
