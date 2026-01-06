import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Goal from '../models/Goal.js';
import Friend from '../models/Friend.js';
import { calculateStreak } from './streakCalculator.js';

// Notification messages
const MESSAGES = {
    streak_rescue: {
        title: "One small action saves your streak 🔥",
        message: "2 minutes today keeps your momentum alive."
    },
    future_self_reminder: {
        title: "Your future self is waiting.",
        message: "You said this goal mattered."
    },
    almost_there: {
        title: "You're closer than you think.",
        message: "Finish one more task and close today strong."
    },
    silent_miss: {
        title: "This day is still yours.",
        message: "It's not too late."
    },
    consistency_over_perfection: {
        title: "Progress didn't reset. Only the counter did.",
        message: "Show up today."
    },
    friend_pressure: {
        title: "Someone you follow just showed up today.",
        message: "Your turn."
    },
    one_tap_return: {
        title: "Open → tap → done.",
        message: "One action. That's all."
    },
    friend_online: {
        title: "A friend is online",
        message: "{friendName} just came online."
    }
};

// Check if notification was already sent today for this type
async function canSendNotification(userId, type) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingNotification = await Notification.findOne({
        userId,
        type,
        createdAt: { $gte: today }
    });

    return !existingNotification;
}

// Check if same message was sent in last 7 days
async function canSendMessage(userId, title) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const existingNotification = await Notification.findOne({
        userId,
        title,
        createdAt: { $gte: sevenDaysAgo }
    });

    return !existingNotification;
}

// Create notification
async function createNotification(userId, type, metadata = {}) {
    const msg = MESSAGES[type];
    if (!msg) return null;

    // Check throttling
    if (!await canSendNotification(userId, type)) {
        return null;
    }

    // Replace placeholders in message
    let title = msg.title;
    let message = msg.message;

    if (metadata.friendName) {
        message = message.replace('{friendName}', metadata.friendName);
    }

    // Check if same message sent recently
    if (!await canSendMessage(userId, title)) {
        return null;
    }

    const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        metadata
    });

    return notification;
}

// 1. Streak Rescue - Trigger when streak will break in < 6 hours
async function checkStreakRescue() {
    const users = await User.find({});
    const notifications = [];

    for (const user of users) {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        // Check if user has any tasks today
        const todayTasks = await Task.find({
            userId: user._id,
            date: todayStr
        });

        // If no progress today and it's after 6 PM
        const hour = today.getHours();
        if (hour >= 18 && todayTasks.length === 0) {
            // Check if user has active goals
            const activeGoals = await Goal.find({ userId: user._id });
            if (activeGoals.length > 0) {
                const notification = await createNotification(user._id, 'streak_rescue');
                if (notification) notifications.push(notification);
            }
        }
    }

    return notifications;
}

// 2. Future Self Reminder - Missed same goal 2 days in a row
async function checkFutureSelfReminder() {
    const users = await User.find({});
    const notifications = [];

    for (const user of users) {
        const goals = await Goal.find({ userId: user._id });

        for (const goal of goals) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            const dayBefore = new Date();
            dayBefore.setDate(dayBefore.getDate() - 2);
            const dayBeforeStr = dayBefore.toISOString().split('T')[0];

            const yesterdayTask = await Task.findOne({
                userId: user._id,
                goalId: goal._id,
                date: yesterdayStr
            });

            const dayBeforeTask = await Task.findOne({
                userId: user._id,
                goalId: goal._id,
                date: dayBeforeStr
            });

            // If both days missed
            if (!yesterdayTask && !dayBeforeTask) {
                const notification = await createNotification(user._id, 'future_self_reminder', {
                    goalId: goal._id,
                    goalTitle: goal.title
                });
                if (notification) {
                    notifications.push(notification);
                    break; // Only one notification per user
                }
            }
        }
    }

    return notifications;
}

// 3. Almost There Nudge - Daily completion 60-80%
async function checkAlmostThere() {
    const users = await User.find({});
    const notifications = [];

    for (const user of users) {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        const goals = await Goal.find({ userId: user._id });
        const tasks = await Task.find({
            userId: user._id,
            date: todayStr
        });

        if (goals.length === 0) continue;

        // Calculate completion percentage
        const completedGoalIds = new Set(
            tasks
                .filter(t => t.completed || t.percentage === 100)
                .map(t => t.goalId.toString())
        );

        const completionPercent = (completedGoalIds.size / goals.length) * 100;

        if (completionPercent >= 60 && completionPercent <= 80) {
            const notification = await createNotification(user._id, 'almost_there', {
                completionPercent: Math.round(completionPercent)
            });
            if (notification) notifications.push(notification);
        }
    }

    return notifications;
}

// 4. Silent Miss Warning - Evening check for scheduled goals with zero progress
async function checkSilentMiss() {
    const users = await User.find({});
    const notifications = [];

    for (const user of users) {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        const goals = await Goal.find({ userId: user._id });
        const tasks = await Task.find({
            userId: user._id,
            date: todayStr
        });

        // If user has goals but no tasks today
        if (goals.length > 0 && tasks.length === 0) {
            const notification = await createNotification(user._id, 'silent_miss');
            if (notification) notifications.push(notification);
        }
    }

    return notifications;
}

// 5. Consistency Over Perfection - Broke streak yesterday
async function checkConsistencyOverPerfection() {
    const users = await User.find({});
    const notifications = [];

    for (const user of users) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const goals = await Goal.find({ userId: user._id });
        const yesterdayTasks = await Task.find({
            userId: user._id,
            date: yesterdayStr
        });

        // If user has goals but didn't complete any yesterday
        if (goals.length > 0 && yesterdayTasks.length === 0) {
            const notification = await createNotification(user._id, 'consistency_over_perfection');
            if (notification) notifications.push(notification);
        }
    }

    return notifications;
}

// 6. Friend Pressure - Friend completed goal, user hasn't
async function checkFriendPressure(userId, friendId) {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Check if friend has completed tasks today
    const friendTasks = await Task.find({
        userId: friendId,
        date: todayStr
    });

    // Check if user has completed tasks today
    const userTasks = await Task.find({
        userId: userId,
        date: todayStr
    });

    if (friendTasks.length > 0 && userTasks.length === 0) {
        const friend = await User.findById(friendId);
        const notification = await createNotification(userId, 'friend_pressure', {
            friendId: friendId,
            friendName: friend.username
        });
        return notification;
    }

    return null;
}

// 7. Friend Online
async function notifyFriendOnline(userId, friendId) {
    const friend = await User.findById(friendId);
    if (!friend) return null;

    const notification = await createNotification(userId, 'friend_online', {
        friendId: friendId,
        friendName: friend.username
    });

    return notification;
}

export {
    createNotification,
    checkStreakRescue,
    checkFutureSelfReminder,
    checkAlmostThere,
    checkSilentMiss,
    checkConsistencyOverPerfection,
    checkFriendPressure,
    notifyFriendOnline
};
