import {
    getCollection,
    updateDocument,
    deleteDocument,
    where,
    limit,
} from '../firebase/firestore';
import type { Subscription } from '../../../shared/index';

export const getSubscriptions = async (status?: string, pageLimit = 200): Promise<Subscription[]> => {
    const constraints = status
        ? [where('status', '==', status), limit(pageLimit)]
        : [limit(pageLimit)];
    const subs = await getCollection<Subscription>('subscriptions', constraints);
    // Sort client-side — no composite index required
    return subs.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
    });
};

export const getSubscriptionsByUser = async (userId: string): Promise<Subscription[]> => {
    const subs = await getCollection<Subscription>('subscriptions', [
        where('userId', '==', userId),
        limit(200),
    ]);
    return subs.sort((a, b) =>
        new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime()
    );
};

export const getSubscriptionStats = async () => {
    const all = await getCollection<Subscription>('subscriptions', []);
    return {
        total: all.length,
        active: all.filter((s) => s.status === 'active').length,
        paused: all.filter((s) => s.status === 'paused').length,
        cancelled: all.filter((s) => s.status === 'cancelled').length,
        byCategory: all.reduce<Record<string, number>>((acc, s) => {
            acc[s.category] = (acc[s.category] ?? 0) + 1;
            return acc;
        }, {}),
    };
};

export const updateSubscription = async (id: string, data: Partial<Subscription>) => {
    return updateDocument('subscriptions', id, data);
};

export const deleteSubscription = async (id: string) => {
    return deleteDocument('subscriptions', id);
};
