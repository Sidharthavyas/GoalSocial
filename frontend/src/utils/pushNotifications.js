import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

/**
 * Initialize push notifications for mobile app
 * This handles permission requests and notification display
 */
export const initPushNotifications = async () => {
    // Only initialize on native platforms
    if (!Capacitor.isNativePlatform()) {
        console.log('Push notifications only available on native platforms');
        return;
    }

    try {
        // Request permission to use push notifications
        const permission = await PushNotifications.requestPermissions();

        if (permission.receive === 'granted') {
            // Register with Apple / Google to receive push via APNS/FCM
            await PushNotifications.register();
            console.log('✅ Push notifications registered');
        } else {
            console.log('❌ Push notification permission denied');
        }

        // Listen for registration success
        PushNotifications.addListener('registration', (token) => {
            console.log('Push registration success, token:', token.value);
            // TODO: Send this token to your backend to enable push notifications
        });

        // Listen for registration errors
        PushNotifications.addListener('registrationError', (error) => {
            console.error('Push registration error:', error);
        });

        // Show notification when received
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('Push notification received:', notification);
            // Notification is automatically shown by the OS
        });

        // Handle notification tap
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            console.log('Push notification action performed:', notification);
            // TODO: Navigate to relevant screen based on notification data
        });

    } catch (error) {
        console.error('Failed to initialize push notifications:', error);
    }
};

/**
 * Get delivered notifications (Android only)
 */
export const getDeliveredNotifications = async () => {
    if (!Capacitor.isNativePlatform()) {
        return [];
    }

    try {
        const { notifications } = await PushNotifications.getDeliveredNotifications();
        return notifications;
    } catch (error) {
        console.error('Failed to get delivered notifications:', error);
        return [];
    }
};
