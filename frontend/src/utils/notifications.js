import { PushNotifications } from '@capacitor/push-notifications';

// Schedule local notifications every 2 hours
export const initializeNotifications = async () => {
    try {
        // Request permission
        const permission = await PushNotifications.requestPermissions();

        if (permission.receive === 'granted') {
            await PushNotifications.register();
            console.log('Push notifications registered');
        }

        // Set up recurring reminder
        setupRecurringReminder();
    } catch (error) {
        console.warn('Push notifications not supported:', error);
    }
};

// Setup recurring 2-hour reminders using browser notification API for web
// and local notifications for mobile
const setupRecurringReminder = () => {
    // For web: use setInterval with Notification API
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                // Send reminder every 2 hours
                setInterval(() => {
                    sendBrowserNotification();
                }, 2 * 60 * 60 * 1000); // 2 hours in milliseconds

                // Send first notification after 2 hours
                setTimeout(() => {
                    sendBrowserNotification();
                }, 2 * 60 * 60 * 1000);
            }
        });
    }
};

const sendBrowserNotification = () => {
    const messages = [
        'Time to check your goals! 🎯',
        'How\'s your progress today? 📊',
        'Keep crushing those goals! 💪',
        'Don\'t forget to update your tasks! ✅',
        'Stay on track with your habits! 🔥'
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    if (document.hidden) { // Only show if tab is not active
        new Notification('Goal Tracker Reminder', {
            body: randomMessage,
            icon: '/icon.png',
            badge: '/icon.png',
            tag: 'goal-reminder',
            requireInteraction: false
        });
    }
};

// Setup mobile push notifications for receiving backend notifications
export const setupPushNotifications = async () => {
    try {
        await PushNotifications.addListener('registration', token => {
            console.log('Push registration success, token: ' + token.value);
            // Send token to backend to store
            sendTokenToBackend(token.value);
        });

        await PushNotifications.addListener('registrationError', err => {
            console.error('Registration error: ', err.error);
        });

        await PushNotifications.addListener('pushNotificationReceived', notification => {
            console.log('Push notification received: ', notification);
        });

        await PushNotifications.addListener('pushNotificationActionPerformed', notification => {
            console.log('Push notification action performed', notification.actionId, notification.inputValue);
        });
    } catch (error) {
        console.warn('Push notification setup failed:', error);
    }
};

const sendTokenToBackend = async (token) => {
    try {
        // Send FCM token to backend for storage
        // await api.post('/notifications/register-device', { token });
        console.log('Device token ready:', token);
    } catch (error) {
        console.error('Failed to send token to backend:', error);
    }
};
