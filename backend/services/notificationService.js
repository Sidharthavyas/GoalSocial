import Notification from '../models/Notification.js';
import User from '../models/User.js';

/**
 * Notification messages for different types
 */
const NOTIFICATION_MESSAGES = {
    dailyGoalReminder: [
        { title: '🎯 Your goals are waiting!', message: "Don't let today slip by. Check off those goals!" },
        { title: '💪 Time to crush it!', message: 'Your daily goals need some love. Let\'s get started!' },
        { title: '⚡ Goals won\'t complete themselves!', message: 'Make today count. Your future self will thank you!' },
        { title: '🔥 Keep the momentum going!', message: 'You\'ve got this! Time to tackle your daily goals.' },
        { title: '✨ Make magic happen today!', message: 'Your goals are calling. Answer them!' }
    ],
    streakRescue: [
        { title: '🔥 Don\'t lose your {{streak}}-day streak!', message: 'Just one small action keeps it alive!' },
        { title: '⚠️ Your streak is at risk!', message: '{{streak}} days of progress. Don\'t break it now!' },
        { title: '💔 Your streak needs you!', message: '{{streak}} days strong. Keep the momentum going!' },
        { title: '🚨 Streak alert!', message: 'You\'ve worked {{streak}} days straight. Finish strong today!' },
        { title: '⏰ Time is running out!', message: 'Save your {{streak}}-day streak before midnight!' }
    ],
    friendOnline: {
        title: '🟢 {{friendName}} is now online!',
        message: 'Your friend just logged in. Say hi!'
    },
    goalPending: {
        title: '⏰ Pending goals for today',
        message: 'You have {{count}} goal(s) waiting. Time to make progress!'
    },
    almostThere: {
        title: '🎯 You\'re almost there!',
        message: 'Just {{remaining}}% left on "{{goalTitle}}". Finish strong!'
    },
    perfectDay: {
        title: '⭐ Perfect day incoming!',
        message: 'Complete {{remaining}} more goal(s) for a perfect day!'
    }
};

/**
 * Create a notification for a user
 */
export const createNotification = async (userId, type, metadata = {}) => {
    try {
        let title, message;

        switch (type) {
            case 'daily_goal_reminder':
                const dailyMsg = NOTIFICATION_MESSAGES.dailyGoalReminder[
                    Math.floor(Math.random() * NOTIFICATION_MESSAGES.dailyGoalReminder.length)
                ];
                title = dailyMsg.title;
                message = dailyMsg.message;
                break;

            case 'streak_rescue':
                const streakMsg = NOTIFICATION_MESSAGES.streakRescue[
                    Math.floor(Math.random() * NOTIFICATION_MESSAGES.streakRescue.length)
                ];
                title = streakMsg.title.replace('{{streak}}', metadata.streak || 0);
                message = streakMsg.message.replace('{{streak}}', metadata.streak || 0);
                break;

            case 'friend_online':
                title = NOTIFICATION_MESSAGES.friendOnline.title.replace('{{friendName}}', metadata.friendName || 'A friend');
                message = NOTIFICATION_MESSAGES.friendOnline.message;
                break;

            case 'goal_pending':
                title = NOTIFICATION_MESSAGES.goalPending.title;
                message = NOTIFICATION_MESSAGES.goalPending.message.replace('{{count}}', metadata.count || 0);
                break;

            case 'almost_there':
                title = NOTIFICATION_MESSAGES.almostThere.title;
                message = NOTIFICATION_MESSAGES.almostThere.message
                    .replace('{{remaining}}', metadata.remaining || 0)
                    .replace('{{goalTitle}}', metadata.goalTitle || 'your goal');
                break;

            case 'perfect_day':
                title = NOTIFICATION_MESSAGES.perfectDay.title;
                message = NOTIFICATION_MESSAGES.perfectDay.message.replace('{{remaining}}', metadata.remaining || 0);
                break;

            default:
                title = metadata.title || 'Notification';
                message = metadata.message || '';
        }

        const notification = new Notification({
            userId,
            type,
            title,
            message,
            metadata,
            read: false
        });

        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

/**
 * Send daily goal reminder notifications to all active users
 */
export const sendDailyGoalReminders = async () => {
    try {
        // Find users who have been active in the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const activeUsers = await User.find({
            lastLogin: { $gte: sevenDaysAgo }
        });

        for (const user of activeUsers) {
            await createNotification(user._id, 'daily_goal_reminder');
        }

        console.log(`✅ Sent daily goal reminders to ${activeUsers.length} users`);
    } catch (error) {
        console.error('Error sending daily goal reminders:', error);
    }
};

/**
 * Check for streak rescue notifications
 */
export const checkStreakRescue = async (userId, streak) => {
    if (streak >= 3) {
        await createNotification(userId, 'streak_rescue', { streak });
    }
};

/**
 * Notify user about friend coming online
 */
export const notifyFriendOnline = async (userId, friendId, friendName) => {
    await createNotification(userId, 'friend_online', { friendId, friendName });
};

/**
 * Notify about pending goals
 */
export const notifyPendingGoals = async (userId, count) => {
    if (count > 0) {
        await createNotification(userId, 'goal_pending', { count });
    }
};

/**
 * Clean up old notifications (older than 30 days)
 */
export const cleanupOldNotifications = async () => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const result = await Notification.deleteMany({
            createdAt: { $lt: thirtyDaysAgo },
            read: true
        });

        console.log(`🗑️ Cleaned up ${result.deletedCount} old notifications`);
    } catch (error) {
        console.error('Error cleaning up notifications:', error);
    }
};

export default {
    createNotification,
    sendDailyGoalReminders,
    checkStreakRescue,
    notifyFriendOnline,
    notifyPendingGoals,
    cleanupOldNotifications
};
