import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

/**
 * Scheduled monthly analytics aggregation.
 * Runs on the 1st of every month at midnight UTC.
 * Reads payments from the previous month per user and writes a summary doc.
 */
export const monthlyAnalyticsAggregation = functions.pubsub
    .schedule('0 0 1 * *')
    .timeZone('UTC')
    .onRun(async (_context) => {
        const db = admin.firestore();
        const now = new Date();

        // Previous month
        const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const monthKey = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;
        const monthStart = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1).toISOString().split('T')[0];
        const monthEnd = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0).toISOString().split('T')[0];

        functions.logger.info(`Aggregating analytics for month: ${monthKey}`);

        try {
            const paymentsSnap = await db
                .collection('payments')
                .where('date', '>=', monthStart)
                .where('date', '<=', monthEnd)
                .where('status', '==', 'completed')
                .get();

            if (paymentsSnap.empty) {
                functions.logger.info('No payments found for the previous month.');
                return null;
            }

            // Group payments by userId
            const userMap: Record<string, {
                totalSpend: number;
                currency: string;
                byCategory: Record<string, number>;
                transactionCount: number;
            }> = {};

            for (const doc of paymentsSnap.docs) {
                const p = doc.data();
                const { userId, amount, currency } = p;

                // Fetch subscription to get category
                const subDoc = await db.collection('subscriptions').doc(p.subscriptionId).get();
                const category = subDoc.exists ? (subDoc.data()?.category ?? 'other') : 'other';

                if (!userMap[userId]) {
                    userMap[userId] = { totalSpend: 0, currency, byCategory: {}, transactionCount: 0 };
                }
                userMap[userId].totalSpend += amount;
                userMap[userId].transactionCount += 1;
                userMap[userId].byCategory[category] = (userMap[userId].byCategory[category] ?? 0) + amount;
            }

            const batch = db.batch();
            for (const [userId, analytics] of Object.entries(userMap)) {
                const ref = db
                    .collection('analytics')
                    .doc(userId)
                    .collection('monthly')
                    .doc(monthKey);

                batch.set(ref, {
                    userId,
                    month: monthKey,
                    totalSpend: analytics.totalSpend,
                    currency: analytics.currency,
                    byCategory: analytics.byCategory,
                    transactionCount: analytics.transactionCount,
                    generatedAt: new Date().toISOString(),
                });
            }

            await batch.commit();
            functions.logger.info(`Analytics written for ${Object.keys(userMap).length} users.`);
        } catch (error) {
            functions.logger.error('Error in monthlyAnalyticsAggregation:', error);
        }

        return null;
    });

/**
 * Callable function – Get analytics summary for the current user.
 */
export const getUserAnalytics = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { months = 6 } = data as { months?: number };
    const db = admin.firestore();
    const userId = context.auth.uid;

    const analyticsSnap = await db
        .collection('analytics')
        .doc(userId)
        .collection('monthly')
        .orderBy(admin.firestore.FieldPath.documentId(), 'desc')
        .limit(months)
        .get();

    return analyticsSnap.docs.map((d) => d.data());
});
