import type { BillingCycle } from '../types';

export const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

export const toMonthlyCost = (amount: number, cycle: BillingCycle): number => {
    switch (cycle) {
        case 'weekly': return amount * (52 / 12);
        case 'monthly': return amount;
        case 'quarterly': return amount / 3;
        case 'yearly': return amount / 12;
        default: return amount;
    }
};

export const toYearlyCost = (amount: number, cycle: BillingCycle): number => {
    switch (cycle) {
        case 'weekly': return amount * 52;
        case 'monthly': return amount * 12;
        case 'quarterly': return amount * 4;
        case 'yearly': return amount;
        default: return amount;
    }
};
