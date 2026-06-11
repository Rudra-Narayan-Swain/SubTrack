import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Check if we're running in Expo Go (not a development build)
// expo-notifications remote push is not supported in Expo Go SDK 53+
const isExpoGo = Constants.appOwnership === 'expo';

export const initNotifications = () => {
    // setNotificationHandler works for local notifications in Expo Go
    // but may throw for push-related setup — guard it
    try {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: false, // badge requires push entitlement, skip in Expo Go
            }),
        });
    } catch {
        // Silently ignore — not critical for app functionality
    }
};

export const requestPermissions = async (): Promise<boolean> => {
    try {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
            });
        }
        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
    } catch {
        return false;
    }
};

export const scheduleLocalNotification = async (
    title: string,
    body: string,
    triggerDate: Date
): Promise<string | null> => {
    try {
        return await Notifications.scheduleNotificationAsync({
            content: { title, body, sound: true },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
        });
    } catch {
        return null;
    }
};

export const cancelNotification = (id: string) => {
    try { Notifications.cancelScheduledNotificationAsync(id); } catch { }
};

export const cancelAllNotifications = () => {
    try { Notifications.cancelAllScheduledNotificationsAsync(); } catch { }
};
