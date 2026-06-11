import { create } from 'zustand';
import type { User, Subscription, Payment } from '../types';

interface AppState {
    user: User | null;
    subscriptions: Subscription[];
    payments: Payment[];
    loadingAuth: boolean;
    setUser: (user: User | null) => void;
    setSubscriptions: (subs: Subscription[]) => void;
    setPayments: (payments: Payment[]) => void;
    setLoadingAuth: (v: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
    user: null,
    subscriptions: [],
    payments: [],
    loadingAuth: true,
    setUser: (user) => set({ user }),
    setSubscriptions: (subscriptions) => set({ subscriptions }),
    setPayments: (payments) => set({ payments }),
    setLoadingAuth: (loadingAuth) => set({ loadingAuth }),
}));
