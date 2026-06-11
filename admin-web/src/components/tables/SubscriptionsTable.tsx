import type { Subscription } from '../../../../shared/index';
import { Trash2, ExternalLink } from 'lucide-react';

interface Props {
    subscriptions: Subscription[];
    onDelete?: (id: string) => void;
}

const statusBadge: Record<string, string> = {
    active: 'badge-green',
    paused: 'badge-yellow',
    cancelled: 'badge-red',
};

const cycleLabel: Record<string, string> = {
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly',
};

export const SubscriptionsTable = ({ subscriptions, onDelete }: Props) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-white/[0.06]">
                        {['Name', 'User', 'Price', 'Cycle', 'Next Billing', 'Status', 'Actions'].map((h) => (
                            <th key={h} className="text-left py-3 px-4 text-white/40 font-medium text-xs uppercase tracking-wider">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {subscriptions.map((sub) => (
                        <tr key={sub.id} className="border-b border-white/[0.04] table-row-hover">
                            <td className="py-3.5 px-4">
                                <div>
                                    <p className="text-white font-medium">{sub.name}</p>
                                    <p className="text-white/40 text-xs capitalize">{sub.category}</p>
                                </div>
                            </td>
                            <td className="py-3.5 px-4 text-white/60 text-xs font-mono truncate max-w-[100px]">
                                {sub.userId}
                            </td>
                            <td className="py-3.5 px-4 text-white font-medium">
                                {sub.currency} {sub.price.toFixed(2)}
                            </td>
                            <td className="py-3.5 px-4 text-white/60">{cycleLabel[sub.billingCycle]}</td>
                            <td className="py-3.5 px-4 text-white/60">
                                {new Date(sub.nextBillingDate).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 px-4">
                                <span className={statusBadge[sub.status] ?? 'badge'}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                    {sub.status}
                                </span>
                            </td>
                            <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2">
                                    {sub.website && (
                                        <a
                                            href={sub.website}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-1.5 rounded-lg text-white/40 hover:text-brand-400 hover:bg-brand-500/10 transition-all"
                                        >
                                            <ExternalLink size={14} />
                                        </a>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={() => onDelete(sub.id)}
                                            className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    {subscriptions.length === 0 && (
                        <tr>
                            <td colSpan={7} className="text-center py-12 text-white/30">
                                No subscriptions found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
