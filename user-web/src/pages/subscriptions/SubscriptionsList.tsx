import { Link } from 'react-router-dom';
import { Plus, Layers } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatCurrency, toMonthlyCost } from '../../utils/currencyUtils';

// Deterministic color from subscription name
const PALETTE = ['#6366f1', '#8b5cf6', '#22d3ee', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6', '#a855f7'];
const colorFor = (name: string) => PALETTE[name.charCodeAt(0) % PALETTE.length];

const billingLabel: Record<string, string> = {
    monthly: '/mo', yearly: '/yr', weekly: '/wk', quarterly: '/qtr',
};

export const SubscriptionsList = () => {
    const subscriptions = useStore((s) => s.subscriptions);
    const activeCount = subscriptions.filter(s => s.status === 'active').length;
    const monthlyTotal = subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + toMonthlyCost(s.price, s.billingCycle), 0);

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto pb-28 animate-fade-in">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <p className="text-white/30 text-xs uppercase tracking-widest font-semibold mb-1">Library</p>
                    <h1 className="text-4xl font-extrabold tracking-tight"
                        style={{ background: 'linear-gradient(135deg, #fff 40%, #c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Subscriptions
                    </h1>
                    <p className="text-white/30 text-sm mt-1">
                        {activeCount} active · {formatCurrency(monthlyTotal)}/mo total
                    </p>
                </div>
                <Link to="/subscriptions/new" className="btn-primary w-fit text-sm px-5 py-2.5">
                    <Plus className="w-4 h-4" />
                    Add New
                </Link>
            </div>

            {subscriptions.length === 0 ? (
                <div className="rounded-3xl p-16 flex flex-col items-center justify-center text-center"
                    style={{ border: '1px dashed rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.03)' }}>
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                        style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                        <Layers className="w-10 h-10" style={{ color: 'rgba(99,102,241,0.5)' }} />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">No Subscriptions Yet</h2>
                    <p className="text-white/30 max-w-sm mb-8 text-sm">You aren't tracking any subscriptions. Add your first one to start seeing insights.</p>
                    <Link to="/subscriptions/new" className="btn-primary text-sm">
                        <Plus className="w-4 h-4" />
                        Add Subscription
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subscriptions.map((sub, i) => {
                        const color = colorFor(sub.name);
                        const statusConfig = {
                            active: { label: 'Active', dot: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
                            paused: { label: 'Paused', dot: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
                            cancelled: { label: 'Cancelled', dot: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
                        }[sub.status] || { label: sub.status, dot: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.2)' };

                        return (
                            <div
                                key={sub.id}
                                className="p-5 rounded-2xl cursor-pointer group transition-all duration-300 relative overflow-hidden"
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    animationDelay: `${i * 60}ms`,
                                }}
                                onMouseEnter={e => {
                                    const el = e.currentTarget;
                                    el.style.transform = 'translateY(-4px)';
                                    el.style.background = `${color}0a`;
                                    el.style.borderColor = `${color}33`;
                                    el.style.boxShadow = `0 12px 40px ${color}20`;
                                }}
                                onMouseLeave={e => {
                                    const el = e.currentTarget;
                                    el.style.transform = 'translateY(0)';
                                    el.style.background = 'rgba(255,255,255,0.03)';
                                    el.style.borderColor = 'rgba(255,255,255,0.06)';
                                    el.style.boxShadow = 'none';
                                }}
                            >
                                {/* Top row */}
                                <div className="flex justify-between items-start mb-5">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shrink-0"
                                        style={{ background: `linear-gradient(135deg, ${color}cc, ${color}88)`, boxShadow: `0 4px 16px ${color}44` }}>
                                        {sub.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold"
                                        style={{ color: statusConfig.dot, background: statusConfig.bg, border: `1px solid ${statusConfig.border}` }}>
                                        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: statusConfig.dot }} />
                                        {statusConfig.label}
                                    </span>
                                </div>

                                <h3 className="text-base font-bold text-white mb-1 truncate">{sub.name}</h3>
                                {sub.category && <p className="text-xs text-white/30 mb-3 capitalize">{sub.category}</p>}

                                <p className="text-2xl font-extrabold mb-4" style={{ color }}>
                                    {formatCurrency(sub.price, sub.currency)}
                                    <span className="text-sm font-normal text-white/25 ml-1">{billingLabel[sub.billingCycle] || `/${sub.billingCycle}`}</span>
                                </p>

                                <div className="pt-3 flex justify-between items-center"
                                    style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <p className="text-xs text-white/30">Next: {new Date(sub.nextBillingDate).toLocaleDateString()}</p>
                                    <span className="text-xs font-semibold transition-colors duration-200" style={{ color: `${color}80` }}>
                                        Details →
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
