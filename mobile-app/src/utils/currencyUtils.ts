import type { BillingCycle } from '../types';

// Hermes (React Native / Expo SDK 54) does NOT fully support Intl.NumberFormat
// with style:'currency'. Using a manual formatter prevents crashes on all screens.
export const formatCurrency = (amount: number, currency = 'USD'): string => {
    const symbol = CURRENCY_SYMBOLS[currency] ?? currency + ' ';
    const formatted = Math.abs(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return amount < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
};

const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥',
    CAD: 'CA$',
    AUD: 'A$',
    SGD: 'S$',
};

export const toMonthlyCost = (price: number, cycle: BillingCycle): number => {
    switch (cycle) {
        case 'weekly': return price * 4.33;
        case 'monthly': return price;
        case 'quarterly': return price / 3;
        case 'yearly': return price / 12;
        default: return price;
    }
};

export const toYearlyCost = (price: number, cycle: BillingCycle): number =>
    toMonthlyCost(price, cycle) * 12;
