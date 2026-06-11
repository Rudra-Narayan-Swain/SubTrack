import { format, differenceInDays, isPast, isToday, isTomorrow, parseISO, addMonths, addWeeks, addYears, isValid } from 'date-fns';
import type { BillingCycle } from '../types';

export const formatDate = (dateStr: string, fmt = 'MMM d, yyyy') => {
    try {
        if (!dateStr) return '';
        const parsed = parseISO(dateStr);
        if (!isValid(parsed)) return dateStr || '';
        return format(parsed, fmt);
    } catch {
        return dateStr || '';
    }
};

export const formatShortDate = (dateStr: string) => formatDate(dateStr, 'MMM d');

export const daysUntil = (dateStr: string): number => {
    try {
        if (!dateStr) return 0;
        const parsed = parseISO(dateStr);
        if (!isValid(parsed)) return 0;
        return differenceInDays(parsed, new Date());
    } catch {
        return 0;
    }
};

export const getDueDateLabel = (dateStr: string): string => {
    try {
        if (!dateStr) return 'No date';
        const date = parseISO(dateStr);
        if (!isValid(date)) return dateStr || 'No date';
        if (isPast(date) && !isToday(date)) return 'Overdue';
        if (isToday(date)) return 'Due today';
        if (isTomorrow(date)) return 'Due tomorrow';
        const days = daysUntil(dateStr);
        if (days <= 7) return `Due in ${days}d`;
        return formatDate(dateStr, 'MMM d');
    } catch {
        return dateStr || 'No date';
    }
};

export const isOverdue = (dateStr: string): boolean => {
    try {
        if (!dateStr) return false;
        const date = parseISO(dateStr);
        if (!isValid(date)) return false;
        return isPast(date) && !isToday(date);
    } catch {
        return false;
    }
};

export const isUpcoming = (dateStr: string, withinDays = 7): boolean => {
    try {
        if (!dateStr) return false;
        const d = daysUntil(dateStr);
        return d >= 0 && d <= withinDays;
    } catch {
        return false;
    }
};

export const getNextBillingDate = (fromDate: string, cycle: BillingCycle): string => {
    try {
        if (!fromDate) fromDate = new Date().toISOString();
        const base = parseISO(fromDate);
        if (!isValid(base)) return fromDate;
        let next: Date;
        switch (cycle) {
            case 'weekly': next = addWeeks(base, 1); break;
            case 'monthly': next = addMonths(base, 1); break;
            case 'quarterly': next = addMonths(base, 3); break;
            case 'yearly': next = addYears(base, 1); break;
            default: next = addMonths(base, 1);
        }
        return format(next, 'yyyy-MM-dd');
    } catch {
        return fromDate;
    }
};

