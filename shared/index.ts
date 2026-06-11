// Shared TypeScript types for Subtrack
// Used by both admin-web and mobile-app

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
  createdAt: string; // ISO date string
  updatedAt: string;
}

export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

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

export type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'crypto' | 'other';
export type PaymentStatus = 'completed' | 'pending' | 'failed';

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
  createdAt: string;
}

export interface Reminder {
  id: string;
  userId: string;
  subscriptionId: string;
  daysBeforeDue: number;
  isEnabled: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId?: string; // undefined = broadcast to all
  title: string;
  body: string;
  type: 'reminder' | 'payment' | 'broadcast' | 'system';
  isRead: boolean;
  sentAt: string;
  data?: Record<string, string>;
}

export interface AdminSettings {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  updatedAt: string;
}

export interface MonthlyAnalytics {
  userId: string;
  month: string; // YYYY-MM
  totalSpend: number;
  currency: string;
  byCategory: Record<string, number>;
  transactionCount: number;
  generatedAt: string;
}
