import {
    getCollection,
    where,
    limit,
} from '../firebase/firestore';
import type { Payment } from '../../../shared/index';

export const getPayments = async (pageLimit = 200): Promise<Payment[]> => {
    const payments = await getCollection<Payment>('payments', [limit(pageLimit)]);
    // Sort client-side descending by date — no composite index required
    return payments.sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
    });
};

export const getPaymentsByUser = async (userId: string): Promise<Payment[]> => {
    const payments = await getCollection<Payment>('payments', [
        where('userId', '==', userId),
        limit(200),
    ]);
    return payments.sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
    });
};

export const getPaymentStats = async () => {
    const all = await getCollection<Payment>('payments', []);
    const completed = all.filter((p) => p.status === 'completed');
    const totalRevenue = completed.reduce((sum, p) => sum + p.amount, 0);

    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthlyRevenue = completed
        .filter((p) => p.date >= firstOfMonth)
        .reduce((sum, p) => sum + p.amount, 0);

    return {
        total: all.length,
        totalRevenue,
        monthlyRevenue,
        completed: completed.length,
        failed: all.filter((p) => p.status === 'failed').length,
        pending: all.filter((p) => p.status === 'pending').length,
    };
};

export const getMonthlyRevenueTrend = async (months = 6): Promise<{ month: string; revenue: number }[]> => {
    // Fetch completed payments and sort client-side — avoids composite index
    const all = await getCollection<Payment>('payments', [
        where('status', '==', 'completed'),
        limit(1000),
    ]);
    all.sort((a, b) => (a.date > b.date ? 1 : -1));

    const result: Record<string, number> = {};
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        result[key] = 0;
    }

    for (const p of all) {
        const month = p.date.substring(0, 7);
        if (month in result) {
            result[month] += p.amount;
        }
    }

    return Object.entries(result).map(([month, revenue]) => ({ month, revenue }));
};
