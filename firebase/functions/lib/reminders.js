"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.dailyReminderCheck = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const notifications_1 = require("./notifications");
/**
 * Scheduled Cloud Function that runs daily at 8am UTC.
 * Checks all subscriptions due within the next 3 days and sends push reminders.
 */
exports.dailyReminderCheck = functions.pubsub
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
        const promises = [];
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
            if (!shouldSend)
                continue;
            // Get user FCM token
            const userDoc = await db.collection('users').doc(userId).get();
            if (!userDoc.exists)
                continue;
            const user = userDoc.data();
            if (!user?.fcmToken || !user?.notificationPrefs?.reminders)
                continue;
            const daysUntil = Math.ceil((new Date(nextBillingDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const dueText = daysUntil === 0 ? 'today' : `in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`;
            // Send push notification
            promises.push((0, notifications_1.sendPushNotification)(user.fcmToken, {
                title: `🔔 Renewal Reminder: ${name}`,
                body: `Your ${name} subscription (${currency} ${price}) renews ${dueText}.`,
            }));
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
    }
    catch (error) {
        functions.logger.error('Error in dailyReminderCheck:', error);
    }
    return null;
});
//# sourceMappingURL=reminders.js.map