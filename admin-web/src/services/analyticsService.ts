import { getPaymentStats, getMonthlyRevenueTrend } from './paymentService';
import { getSubscriptionStats } from './subscriptionService';
import { getUserStats } from './userService';

export interface DashboardStats {
    users: { total: number; newThisMonth: number };
    subscriptions: {
        total: number;
        active: number;
        paused: number;
        cancelled: number;
        byCategory: Record<string, number>;
    };
    payments: {
        total: number;
        totalRevenue: number;
        monthlyRevenue: number;
        completed: number;
        failed: number;
        pending: number;
    };
    revenueTrend: { month: string; revenue: number }[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const [users, subscriptions, payments, revenueTrend] = await Promise.all([
        getUserStats(),
        getSubscriptionStats(),
        getPaymentStats(),
        getMonthlyRevenueTrend(6),
    ]);

    return { users, subscriptions, payments, revenueTrend };
};
