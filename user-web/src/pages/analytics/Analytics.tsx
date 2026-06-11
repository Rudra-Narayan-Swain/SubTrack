import { useEffect, useState } from 'react';
import { TrendingUp, BarChart3, Zap } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatCurrency, toMonthlyCost, toYearlyCost } from '../../utils/currencyUtils';

const CATEGORY_COLORS = [
    '#6366f1', '#8b5cf6', '#22d3ee', '#10b981',
    '#f59e0b', '#ef4444', '#3b82f6', '#ec4899',
];

export const Analytics = () => {
    const { subscriptions } = useStore();
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setAnimate(true), 200);
        return () => clearTimeout(t);
    }, []);

    const active = subscriptions.filter((s) => s.status === 'active');
    const monthly = active.reduce((sum, s) => sum + toMonthlyCost(s.price, s.billingCycle), 0);
    const yearly = active.reduce((sum, s) => sum + toYearlyCost(s.price, s.billingCycle), 0);

    const byCategory: Record<string, number> = {};
    active.forEach(s => {
        byCategory[s.category] = (byCategory[s.category] || 0) + toMonthlyCost(s.price, s.billingCycle);
    });
    const sortedCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

    const overviewCards = [
        {
            label: 'Monthly Run Rate',
            value: formatCurrency(monthly),
            sub: 'Projected spend · next 30 days',
            icon: TrendingUp,
            gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            glow: 'rgba(99,102,241,0.35)',
            textGrad: 'linear-gradient(135deg, #fff 30%, #a5b4fc)',
            border: 'rgba(99,102,241,0.2)',
            bg: 'rgba(99,102,241,0.06)',
        },
        {
            label: 'Yearly Run Rate',
            value: formatCurrency(yearly),
            sub: 'Projected spend · next 12 months',
            icon: BarChart3,
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            glow: 'rgba(16,185,129,0.35)',
            textGrad: 'linear-gradient(135deg, #fff 30%, #6ee7b7)',
            border: 'rgba(16,185,129,0.2)',
            bg: 'rgba(16,185,129,0.06)',
        },
    ];

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto pb-28 animate-fade-in">

            {/* Header */}
            <div className="mb-10">
                <p className="text-white/30 text-xs uppercase tracking-widest font-semibold mb-1">Insights</p>
                <h1 className="text-4xl font-extrabold tracking-tight"
                    style={{ background: 'linear-gradient(135deg, #fff 40%, #6ee7b7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Analytics
                </h1>
                <p className="text-white/30 text-sm mt-1">Detailed breakdown of your subscription spending</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                {overviewCards.map((card) => (
                    <div key={card.label} className="rounded-2xl p-6 relative overflow-hidden transition-all duration-300"
                        style={{ background: card.bg, border: `1px solid ${card.border}` }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 40px ${card.glow}`; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        {/* Background icon */}
                        <div className="absolute -top-2 -right-2 opacity-6 pointer-events-none">
                            <card.icon className="w-28 h-28 text-white" strokeWidth={1} />
                        </div>

                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 shrink-0"
                            style={{ background: card.gradient, boxShadow: `0 4px 16px ${card.glow}` }}>
                            <card.icon className="w-5 h-5 text-white" />
                        </div>

                        <p className="text-xs text-white/30 uppercase tracking-widest font-semibold mb-2">{card.label}</p>
                        <p className="text-4xl font-extrabold mb-2"
                            style={{ background: card.textGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {card.value}
                        </p>
                        <p className="text-xs text-white/30">{card.sub}</p>
                    </div>
                ))}
            </div>

            {/* Category Breakdown */}
            {sortedCategories.length > 0 && (
                <div className="rounded-2xl p-6"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-3 mb-7">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 12px rgba(99,102,241,0.35)' }}>
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-lg font-bold text-white">Spend by Category</h2>
                    </div>

                    <div className="space-y-5">
                        {sortedCategories.map(([cat, amt], idx) => {
                            const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                            const pct = monthly > 0 ? Math.min((amt / monthly) * 100, 100) : 0;
                            return (
                                <div key={cat}>
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                                            <span className="text-white/80 font-medium text-sm capitalize">{cat}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                                style={{ color, background: `${color}18` }}>
                                                {pct.toFixed(1)}%
                                            </span>
                                            <span className="text-white/60 text-sm font-semibold">{formatCurrency(amt)}<span className="text-white/25 text-xs">/mo</span></span>
                                        </div>
                                    </div>
                                    {/* Bar */}
                                    <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                        <div
                                            className="h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{
                                                width: animate ? `${pct}%` : '0%',
                                                background: `linear-gradient(90deg, ${color}cc, ${color})`,
                                                boxShadow: `0 0 8px ${color}66`,
                                                transitionDelay: `${idx * 100}ms`,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {sortedCategories.length === 0 && (
                <div className="rounded-2xl p-16 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(99,102,241,0.15)' }}>
                    <BarChart3 className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(99,102,241,0.3)' }} />
                    <p className="text-white/30 text-sm">Add subscriptions to see spending analytics</p>
                </div>
            )}
        </div>
    );
};
