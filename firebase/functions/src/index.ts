import * as admin from 'firebase-admin';
import { dailyReminderCheck } from './reminders';
import { sendAdminBroadcast } from './notifications';
import { monthlyAnalyticsAggregation, getUserAnalytics } from './analytics';
import { onPaymentCreated } from './payments';

// Initialize Firebase Admin SDK
admin.initializeApp();

// ─── Exports ──────────────────────────────────────────────────────────────────

// Scheduled: Daily subscription renewal reminders
export { dailyReminderCheck };

// Callable: Admin broadcasts notifications
export { sendAdminBroadcast };

// Scheduled: Monthly analytics aggregation
export { monthlyAnalyticsAggregation };

// Callable: Get user analytics
export { getUserAnalytics };

// Trigger: Update subscription on payment creation
export { onPaymentCreated };
