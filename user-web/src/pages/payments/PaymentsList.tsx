import { useEffect } from 'react';
import { CreditCard, CheckCircle, Clock, XCircle, TrendingDown } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatCurrency } from '../../utils/currencyUtils';
import { formatDate } from '../../utils/dateUtils';
import { subscribeToPayments } from '../../services/paymentService';

const statusConfig = {
    completed: {
        icon: CheckCircle,
        color: '#10b981',
        bg: 'rgba(16,185,129,0.1)',
        border: 'rgba(16,185,129,0.2)',
        label: 'Completed',
        accentBar: 'rgba(16,185,129,0.5)',
    },
    pending: {
        icon: Clock,
        color: '#f59e0b',
        bg: 'rgba(245,158,11,0.1)',
        border: 'rgba(245,158,11,0.2)',
        label: 'Pending',
        accentBar: 'rgba(245,158,11,0.5)',
    },
    failed: {
        icon: XCircle,
        color: '#ef4444',
        bg: 'rgba(239,68,68,0.1)',
        border: 'rgba(239,68,68,0.2)',
        label: 'Failed',
        accentBar: 'rgba(239,68,68,0.5)',
    },
} as const;

export const PaymentsList = () => {
    const { user, payments, setPayments } = useStore();

    useEffect(() => {
        if (!user?.uid) return;
        return subscribeToPayments(user.uid, setPayments);
    }, [user?.uid, setPayments]);

    const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0);
    const completedCount = payments.filter(p => p.status === 'completed').length;

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto pb-28 animate-fade-in">

            {/* Header */}
            <div className="mb-10">
                <p className="text-white/30 text-xs uppercase tracking-widest font-semibold mb-1">History</p>
                <h1 className="text-4xl font-extrabold tracking-tight"
                    style={{ background: 'linear-gradient(135deg, #fff 40%, #67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Payments
                </h1>

                {/* Mini stats */}
                <div className="flex items-center gap-6 mt-3">
                    <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4" style={{ color: '#22d3ee' }} />
                        <span className="text-sm text-white/60">Lifetime: <span className="text-white font-bold">{formatCurrency(totalSpent)}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" style={{ color: '#10b981' }} />
                        <span className="text-sm text-white/60"><span className="text-white font-bold">{completedCount}</span> completed</span>
                    </div>
                </div>
            </div>

            {payments.length === 0 ? (
                <div className="rounded-3xl p-16 flex flex-col items-center justify-center text-center"
                    style={{ border: '1px dashed rgba(34,211,238,0.2)', background: 'rgba(34,211,238,0.03)' }}>
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                        style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.15)' }}>
                        <CreditCard className="w-10 h-10" style={{ color: 'rgba(34,211,238,0.4)' }} />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">No Payment Records</h2>
                    <p className="text-white/30 max-w-sm text-sm">Payments will appear here when you record a subscription payment.</p>
                </div>
            ) : (
                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                    {payments.map((payment, i) => {
                        const cfg = statusConfig[payment.status as keyof typeof statusConfig] ?? statusConfig.pending;
                        const Icon = cfg.icon;
                        return (
                            <div
                                key={payment.id}
                                className="flex items-center justify-between p-4 transition-all duration-200 relative"
                                style={{
                                    background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                                    borderBottom: i < payments.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                    borderLeft: `3px solid ${cfg.accentBar}`,
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                                onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent')}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                                        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                                        <Icon className="w-5 h-5" style={{ color: cfg.color }} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-sm">{payment.subscriptionName}</h3>
                                        <p className="text-white/30 text-xs mt-0.5">
                                            {formatDate(payment.date)} · {payment.method.replace('_', ' ')}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right flex flex-col items-end gap-1">
                                    <p className="text-white font-bold">{formatCurrency(payment.amount, payment.currency)}</p>
                                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full"
                                        style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                                        {cfg.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
