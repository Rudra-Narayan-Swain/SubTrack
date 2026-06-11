import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

/**
 * Firestore trigger: when a new payment is created,
 * update the parent subscription's lastPaidDate field.
 */
export const onPaymentCreated = functions.firestore
    .document('payments/{paymentId}')
    .onCreate(async (snap, _context) => {
        const payment = snap.data();
        const { subscriptionId, date, status } = payment;

        if (status !== 'completed') {
            functions.logger.info(`Payment ${snap.id} is not completed. Skipping subscription update.`);
            return null;
        }

        if (!subscriptionId) {
            functions.logger.warn(`Payment ${snap.id} has no subscriptionId.`);
            return null;
        }

        try {
            const db = admin.firestore();
            const subRef = db.collection('subscriptions').doc(subscriptionId);
            const subSnap = await subRef.get();

            if (!subSnap.exists) {
                functions.logger.warn(`Subscription ${subscriptionId} not found.`);
                return null;
            }

            const sub = subSnap.data()!;
            const billingCycle: string = sub.billingCycle ?? 'monthly';

            // Calculate next billing date after this payment
            const paymentDate = new Date(date);
            const nextBillingDate = calculateNextBillingDate(paymentDate, billingCycle);

            await subRef.update({
                lastPaidDate: date,
                nextBillingDate: nextBillingDate.toISOString().split('T')[0],
                updatedAt: new Date().toISOString(),
            });

            functions.logger.info(
                `Updated subscription ${subscriptionId}: lastPaidDate=${date}, nextBillingDate=${nextBillingDate.toISOString().split('T')[0]}`
            );
        } catch (error) {
            functions.logger.error(`Error updating subscription ${subscriptionId}:`, error);
        }

        return null;
    });

/**
 * Calculate the next billing date based on a billing cycle.
 */
function calculateNextBillingDate(fromDate: Date, cycle: string): Date {
    const next = new Date(fromDate);
    switch (cycle) {
        case 'weekly':
            next.setDate(next.getDate() + 7);
            break;
        case 'monthly':
            next.setMonth(next.getMonth() + 1);
            break;
        case 'quarterly':
            next.setMonth(next.getMonth() + 3);
            break;
        case 'yearly':
            next.setFullYear(next.getFullYear() + 1);
            break;
        default:
            next.setMonth(next.getMonth() + 1);
    }
    return next;
}
