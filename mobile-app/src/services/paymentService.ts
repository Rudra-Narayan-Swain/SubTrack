import { subscribeToQuery, addDocument, where } from '../firebase/firestore';
import type { Payment } from '../types';

export const subscribeToPayments = (
    userId: string,
    onData: (payments: Payment[]) => void
) =>
    subscribeToQuery<Payment>(
        'payments',
        [where('userId', '==', userId)],
        (payments) => onData(
            [...payments].sort((a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            )
        )
    );

export const addPayment = async (data: Omit<Payment, 'id' | 'createdAt'>) => {
    return addDocument('payments', data);
};
