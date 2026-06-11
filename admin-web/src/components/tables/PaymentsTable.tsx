import type { Payment } from '../../../../shared/index';

interface Props {
    payments: Payment[];
}

const statusBadge: Record<string, string> = {
    completed: 'badge-green',
    pending: 'badge-yellow',
    failed: 'badge-red',
};

export const PaymentsTable = ({ payments }: Props) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-white/[0.06]">
                        {['Subscription', 'User', 'Amount', 'Method', 'Date', 'Status'].map((h) => (
                            <th key={h} className="text-left py-3 px-4 text-white/40 font-medium text-xs uppercase tracking-wider">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {payments.map((p) => (
                        <tr key={p.id} className="border-b border-white/[0.04] table-row-hover">
                            <td className="py-3.5 px-4 text-white font-medium">{p.subscriptionName}</td>
                            <td className="py-3.5 px-4 text-white/60 text-xs font-mono truncate max-w-[100px]">
                                {p.userId}
                            </td>
                            <td className="py-3.5 px-4 text-white font-semibold">
                                {p.currency} {p.amount.toFixed(2)}
                            </td>
                            <td className="py-3.5 px-4 text-white/60 capitalize">
                                {p.method.replace('_', ' ')}
                            </td>
                            <td className="py-3.5 px-4 text-white/60">
                                {new Date(p.date).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 px-4">
                                <span className={statusBadge[p.status] ?? 'badge'}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                    {p.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                    {payments.length === 0 && (
                        <tr>
                            <td colSpan={6} className="text-center py-12 text-white/30">
                                No payments found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
