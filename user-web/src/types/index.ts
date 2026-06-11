// Shared TypeScript types copied from previous implementations

export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'crypto' | 'other';
export type PaymentStatus = 'completed' | 'pending' | 'failed';

export interface User {
    uid: string;
    name: string;
    email: string;
    phone?: string;
    photoURL?: string;
    fcmToken?: string;
    isAdmin?: boolean;
    notificationPrefs: {
        reminders: boolean;
        paymentConfirmations: boolean;
        broadcasts: boolean;
    };
    createdAt: string;
    updatedAt: string;
}

export interface Subscription {
    id: string;
    userId: string;
    name: string;
    description?: string;
    price: number;
    currency: string;
    category: string;
    billingCycle: BillingCycle;
    startDate: string;
    nextBillingDate: string;
    lastPaidDate?: string;
    status: SubscriptionStatus;
    logoUrl?: string;
    website?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Payment {
    id: string;
    userId: string;
    subscriptionId: string;
    subscriptionName: string;
    amount: number;
    currency: string;
    date: string;
    method: PaymentMethod;
    status: PaymentStatus;
    receiptUrl?: string;
    notes?: string;
    createdAt: string;
}

export interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
}

export interface Reminder {
    id: string;
    userId: string;
    subscriptionId: string;
    daysBeforeDue: number;
    isEnabled: boolean;
    createdAt: string;
}
