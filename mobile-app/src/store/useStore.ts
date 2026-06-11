import { create } from 'zustand';
import type { User, Subscription, Payment } from '../types';

interface AppState {
    user: User | null;
    subscriptions: Subscription[];
    payments: Payment[];
    loading: boolean;
    error: string | null;
    setUser: (user: User | null) => void;
    setSubscriptions: (subs: Subscription[]) => void;
    addSubscription: (sub: Subscription) => void;
    updateSubscription: (id: string, updates: Partial<Subscription>) => void;
    removeSubscription: (id: string) => void;
    setPayments: (payments: Payment[]) => void;
    addPayment: (payment: Payment) => void;
    setLoading: (v: boolean) => void;
    setError: (e: string | null) => void;
    reset: () => void;
}

const initial = { user: null, subscriptions: [], payments: [], loading: false, error: null };

export const useStore = create<AppState>((set) => ({
    ...initial,
    setUser: (user) => set({ user }),
    setSubscriptions: (subscriptions) => set({ subscriptions }),
    addSubscription: (sub) => set((s) => ({ subscriptions: [sub, ...s.subscriptions] })),
    updateSubscription: (id, updates) =>
        set((s) => ({ subscriptions: s.subscriptions.map((x) => (x.id === id ? { ...x, ...updates } : x)) })),
    removeSubscription: (id) =>
        set((s) => ({ subscriptions: s.subscriptions.filter((x) => x.id !== id) })),
    setPayments: (payments) => set({ payments }),
    addPayment: (payment) => set((s) => ({ payments: [payment, ...s.payments] })),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    reset: () => set(initial),
}));
