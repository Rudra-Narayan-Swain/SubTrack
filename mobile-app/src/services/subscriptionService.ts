import { subscribeToQuery, addDocument, updateDocument, deleteDocument, where } from '../firebase/firestore';
import { getNextBillingDate } from '../utils/dateUtils';
import type { Subscription } from '../types';

export const subscribeToSubscriptions = (
    userId: string,
    onData: (subs: Subscription[]) => void
) =>
    subscribeToQuery<Subscription>(
        'subscriptions',
        // Only filter by userId — no orderBy, which avoids needing a composite
        // Firestore index (where + orderBy on different fields requires one).
        // We sort client-side instead.
        [where('userId', '==', userId)],
        (subs) => onData(
            [...subs].sort((a, b) =>
                new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime()
            )
        )
    );

export const addSubscription = async (data: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
    return addDocument('subscriptions', data);
};

export const updateSubscription = async (id: string, data: Partial<Subscription>) => {
    await updateDocument('subscriptions', id, data);
};

export const deleteSubscription = async (id: string) => {
    await deleteDocument('subscriptions', id);
};

export const markSubscriptionPaid = async (sub: Subscription) => {
    const nextBillingDate = getNextBillingDate(sub.nextBillingDate, sub.billingCycle);
    await updateDocument('subscriptions', sub.id, {
        lastPaidDate: new Date().toISOString().split('T')[0],
        nextBillingDate,
    });
};
