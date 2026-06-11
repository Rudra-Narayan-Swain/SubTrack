import { addDocument, updateDocument, deleteDocument, subscribeToQuery, where } from '../firebase/firestore';
import type { Subscription } from '../types';
import type { Unsubscribe } from 'firebase/firestore';

export const addSubscription = (data: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) =>
    addDocument('subscriptions', data);

export const updateSubscription = (id: string, data: Partial<Subscription>) =>
    updateDocument('subscriptions', id, data);

export const deleteSubscription = (id: string) =>
    deleteDocument('subscriptions', id);

export const subscribeToSubscriptions = (userId: string, onData: (subs: Subscription[]) => void): Unsubscribe => {
    return subscribeToQuery<Subscription>('subscriptions', [where('userId', '==', userId)], onData);
};
