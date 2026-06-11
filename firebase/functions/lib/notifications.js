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
exports.sendAdminBroadcast = void 0;
exports.sendPushNotification = sendPushNotification;
exports.sendMulticastNotification = sendMulticastNotification;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
/**
 * Send a push notification to a single FCM token.
 */
async function sendPushNotification(token, payload) {
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
}
/**
 * Send a broadcast notification to a list of FCM tokens (multicast).
 */
async function sendMulticastNotification(tokens, payload) {
    if (tokens.length === 0) {
        return { responses: [], successCount: 0, failureCount: 0 };
    }
    const chunks = [];
    for (let i = 0; i < tokens.length; i += 500) {
        chunks.push(tokens.slice(i, i + 500));
    }
    let totalSuccessCount = 0;
    let totalFailureCount = 0;
    const responses = [];
    for (const chunk of chunks) {
        const message = {
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
    functions.logger.info(`Multicast: ${totalSuccessCount} success, ${totalFailureCount} failure out of ${tokens.length} tokens.`);
    return {
        responses,
        successCount: totalSuccessCount,
        failureCount: totalFailureCount,
    };
}
/**
 * Callable Cloud Function – Admin broadcasts a notification to all users or a specific user.
 *
 * Admin status is checked against Firestore (role === 'admin'),
 * matching how make-admin.ts promotes users — NOT via custom claims.
 */
exports.sendAdminBroadcast = functions.https.onCall(async (data, context) => {
    // ── 1. Must be authenticated ─────────────────────────────────────────────
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be signed in.');
    }
    const db = admin.firestore();
    // ── 2. Verify admin — accept custom claim (setupAdmin.js) OR Firestore role (make-admin.ts)
    try {
        const hasCustomClaim = context.auth.token?.admin === true;
        if (!hasCustomClaim) {
            const callerDoc = await db.collection('users').doc(context.auth.uid).get();
            if (!callerDoc.exists || callerDoc.data()?.role !== 'admin') {
                throw new functions.https.HttpsError('permission-denied', `Access denied. UID ${context.auth.uid} is not an admin. Run make-admin or setupAdmin.js first.`);
            }
        }
    }
    catch (err) {
        if (err instanceof functions.https.HttpsError)
            throw err;
        throw new functions.https.HttpsError('internal', 'Failed to verify admin status.');
    }
    // ── 3. Validate payload ──────────────────────────────────────────────────
    const { title, body, targetUserId } = data;
    if (!title?.trim() || !body?.trim()) {
        throw new functions.https.HttpsError('invalid-argument', 'title and body are required.');
    }
    // ── 4. Send ──────────────────────────────────────────────────────────────
    try {
        if (targetUserId) {
            // ── Specific user ────────────────────────────────────────────────
            const userDoc = await db.collection('users').doc(targetUserId).get();
            if (!userDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'User not found.');
            }
            const fcmToken = userDoc.data()?.fcmToken;
            if (!fcmToken) {
                throw new functions.https.HttpsError('not-found', 'This user has no registered device. They need to open the app first.');
            }
            await sendPushNotification(fcmToken, { title, body });
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
        }
        else {
            // ── Broadcast to all users ───────────────────────────────────────
            const usersSnap = await db
                .collection('users')
                .where('notificationPrefs.broadcasts', '==', true)
                .get();
            const tokens = usersSnap.docs
                .map((d) => d.data().fcmToken)
                .filter(Boolean);
            if (tokens.length === 0) {
                return { success: true, sent: 0 };
            }
            const result = await sendMulticastNotification(tokens, { title, body });
            // Log broadcast
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
    }
    catch (err) {
        // Re-throw known HttpsErrors as-is
        if (err instanceof functions.https.HttpsError)
            throw err;
        // Wrap unknown errors (e.g. FCM failures) with a readable message
        functions.logger.error('sendAdminBroadcast error:', err);
        throw new functions.https.HttpsError('internal', err?.message || 'Notification delivery failed. Check function logs.');
    }
});
//# sourceMappingURL=notifications.js.map