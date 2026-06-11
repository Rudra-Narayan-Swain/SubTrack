import { format, parseISO, differenceInDays, addMonths, addYears, isValid, isPast } from 'date-fns';
import type { BillingCycle } from '../types';

export const formatDate = (dateStr: string) => {
    try { return format(parseISO(dateStr), 'MMM d, yyyy'); }
    catch { return dateStr; }
};

export const getNextBillingDate = (startDate: string, cycle: BillingCycle): string => {
    try {
        let d = parseISO(startDate);
        if (!isValid(d)) return startDate;
        while (isPast(d)) {
            if (cycle === 'monthly') d = addMonths(d, 1);
            else if (cycle === 'yearly') d = addYears(d, 1);
            else if (cycle === 'quarterly') d = addMonths(d, 3);
            else if (cycle === 'weekly') d.setDate(d.getDate() + 7);
            else break;
        }
        return d.toISOString();
    } catch { return startDate; }
};

export const getDaysUntil = (dateStr: string): number => {
    try { return differenceInDays(parseISO(dateStr), new Date()); }
    catch { return 0; }
};
