import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { sendPushNotification } from './notifications';

/**
 * Scheduled Cloud Function that runs daily at 8am UTC.
 * Checks all subscriptions due within the next 3 days and sends push reminders.
 */
export const dailyReminderCheck = functions.pubsub
    .schedule('0 8 * * *')
    .timeZone('UTC')
    .onRun(async (_context) => {
        const db = admin.firestore();
        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

        const nowISO = now.toISOString().split('T')[0];
        const thresholdISO = threeDaysFromNow.toISOString().split('T')[0];

        functions.logger.info(`Checking subscriptions due between ${nowISO} and ${thresholdISO}`);

        try {
            const subsSnapshot = await db
                .collection('subscriptions')
                .where('status', '==', 'active')
                .where('nextBillingDate', '>=', nowISO)
                .where('nextBillingDate', '<=', thresholdISO)
                .get();

            if (subsSnapshot.empty) {
                functions.logger.info('No upcoming subscriptions found.');
                return null;
            }

            const batch = db.batch();
            const promises: Promise<void>[] = [];

            for (const doc of subsSnapshot.docs) {
                const sub = doc.data();
                const { userId, name, price, currency, nextBillingDate } = sub;

                // Check user's reminder preferences
                const reminderSnap = await db
                    .collection('reminders')
                    .where('userId', '==', userId)
                    .where('subscriptionId', '==', doc.id)
                    .where('isEnabled', '==', true)
                    .limit(1)
                    .get();

                // Default to sending reminder if no explicit preference
                const shouldSend = reminderSnap.empty || !reminderSnap.docs[0].data().isEnabled === false;
                if (!shouldSend) continue;

                // Get user FCM token
                const userDoc = await db.collection('users').doc(userId).get();
                if (!userDoc.exists) continue;

                const user = userDoc.data();
                if (!user?.fcmToken || !user?.notificationPrefs?.reminders) continue;

                const daysUntil = Math.ceil(
                    (new Date(nextBillingDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                );
                const dueText = daysUntil === 0 ? 'today' : `in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`;

                // Send push notification
                promises.push(
                    sendPushNotification(user.fcmToken, {
                        title: `🔔 Renewal Reminder: ${name}`,
                        body: `Your ${name} subscription (${currency} ${price}) renews ${dueText}.`,
                    })
                );

                // Log notification in Firestore
                const notifRef = db.collection('notifications').doc();
                batch.set(notifRef, {
                    userId,
                    title: `Renewal Reminder: ${name}`,
                    body: `Your ${name} subscription (${currency} ${price}) renews ${dueText}.`,
                    type: 'reminder',
                    isRead: false,
                    sentAt: new Date().toISOString(),
                    data: { subscriptionId: doc.id },
                });
            }

            await Promise.all(promises);
            await batch.commit();

            functions.logger.info(`Sent reminders for ${promises.length} subscriptions.`);
        } catch (error) {
            functions.logger.error('Error in dailyReminderCheck:', error);
        }

        return null;
    });
