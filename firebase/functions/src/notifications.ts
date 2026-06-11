import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

export interface NotificationPayload {
    title: string;
    body: string;
    imageUrl?: string;
    data?: Record<string, string>;
}

/**
 * Send a push notification to a single FCM token.
 */
export async function sendPushNotification(
    token: string,
    payload: NotificationPayload
): Promise<void> {
    try {
        await admin.messaging().send({
            token,
            notification: {
                title: payload.title,
                body: payload.body,
                imageUrl: payload.imageUrl,
            },
            data: payload.data ?? {},
            android: {
                priority: 'high',
                notification: {
                    channelId: 'subtrack_default',
                    sound: 'default',
                },
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1,
                    },
                },
            },
        });
    } catch (error) {
        functions.logger.error(`Failed to send notification to token ${token}:`, error);
        throw error;
    }
}

/**
 * Send a broadcast notification to a list of FCM tokens (multicast).
 */
export async function sendMulticastNotification(
    tokens: string[],
    payload: NotificationPayload
): Promise<admin.messaging.BatchResponse> {
    if (tokens.length === 0) {
        throw new Error('No tokens provided for multicast notification.');
    }

    const chunks: string[][] = [];
    for (let i = 0; i < tokens.length; i += 500) {
        chunks.push(tokens.slice(i, i + 500));
    }

    let totalSuccessCount = 0;
    let totalFailureCount = 0;
    const responses: admin.messaging.SendResponse[] = [];

    for (const chunk of chunks) {
        const message: admin.messaging.MulticastMessage = {
            tokens: chunk,
            notification: {
                title: payload.title,
                body: payload.body,
                imageUrl: payload.imageUrl,
            },
            data: payload.data ?? {},
            android: {
                priority: 'high',
                notification: { channelId: 'subtrack_default', sound: 'default' },
            },
            apns: {
                payload: { aps: { sound: 'default', badge: 1 } },
            },
        };

        const batchResponse = await admin.messaging().sendEachForMulticast(message);
        totalSuccessCount += batchResponse.successCount;
        totalFailureCount += batchResponse.failureCount;
        responses.push(...batchResponse.responses);
    }

    functions.logger.info(
        `Multicast: ${totalSuccessCount} success, ${totalFailureCount} failure out of ${tokens.length} tokens.`
    );

    return {
        responses,
        successCount: totalSuccessCount,
        failureCount: totalFailureCount,
    };
}

/**
 * Callable Cloud Function – Admin broadcasts a notification to all users.
 */
export const sendAdminBroadcast = functions.https.onCall(async (data, context) => {
    // Verify caller is an admin
    if (!context.auth?.token?.admin) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can send broadcasts.');
    }

    const { title, body, targetUserId } = data as {
        title: string;
        body: string;
        targetUserId?: string;
    };

    if (!title || !body) {
        throw new functions.https.HttpsError('invalid-argument', 'title and body are required.');
    }

    const db = admin.firestore();

    if (targetUserId) {
        // Send to a specific user
        const userDoc = await db.collection('users').doc(targetUserId).get();
        if (!userDoc.exists || !userDoc.data()?.fcmToken) {
            throw new functions.https.HttpsError('not-found', 'User or token not found.');
        }
        await sendPushNotification(userDoc.data()!.fcmToken, { title, body });

        // Log notification
        await db.collection('notifications').add({
            userId: targetUserId,
            title,
            body,
            type: 'broadcast',
            isRead: false,
            sentAt: new Date().toISOString(),
            data: {},
        });

        return { success: true, sent: 1 };
    } else {
        // Broadcast to all users with FCM tokens
        const usersSnap = await db
            .collection('users')
            .where('notificationPrefs.broadcasts', '==', true)
            .get();

        const tokens = usersSnap.docs
            .map((d) => d.data().fcmToken as string)
            .filter(Boolean);

        if (tokens.length === 0) {
            return { success: true, sent: 0 };
        }

        const result = await sendMulticastNotification(tokens, { title, body });

        // Log broadcast notification (no userId = global)
        await db.collection('notifications').add({
            userId: null,
            title,
            body,
            type: 'broadcast',
            isRead: false,
            sentAt: new Date().toISOString(),
            data: {},
        });

        return { success: true, sent: result.successCount, failed: result.failureCount };
    }
});
