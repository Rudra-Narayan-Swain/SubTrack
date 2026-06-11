import { addDocument, subscribeToQuery, where, orderBy } from '../firebase/firestore';
import { updateSubscription } from './subscriptionService';
import type { Payment, Subscription } from '../types';
import type { Unsubscribe } from 'firebase/firestore';

export const addPayment = async (
    paymentData: Omit<Payment, 'id' | 'createdAt'>,
    subscription?: Subscription,
    nextBillingDate?: string
) => {
    const pId = await addDocument('payments', paymentData);
    if (paymentData.status === 'completed' && subscription && nextBillingDate) {
        await updateSubscription(subscription.id, {
            lastPaidDate: new Date().toISOString(),
            nextBillingDate,
            status: 'active'
        });
    }
    return pId;
};

export const subscribeToPayments = (userId: string, onData: (payments: Payment[]) => void): Unsubscribe => {
    return subscribeToQuery<Payment>(
        'payments',
        [where('userId', '==', userId), orderBy('date', 'desc')],
        onData
    );
};
