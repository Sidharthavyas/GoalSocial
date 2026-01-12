import express from 'express';
import Task from '../models/Task.js';
import Goal from '../models/Goal.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create or update task
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { goalId, date, completed, value, percentage, notes } = req.body;

        if (!goalId || !date) {
            return res.status(400).json({ error: 'Goal ID and date are required' });
        }

        // Verify goal exists and belongs to user
        const goal = await Goal.findById(goalId);
        if (!goal || goal.userId.toString() !== req.user.id.toString()) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        // Ensure date is in YYYY-MM-DD format using local timezone
        let dateString;
        if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            dateString = date;
        } else {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            dateString = `${year}-${month}-${day}`;
        }

        // Find existing task or create new one
        let task = await Task.findOne({
            goalId,
            userId: req.user.id,
            date: dateString
        });

        if (task) {
            // Update existing
            if (completed !== undefined) task.completed = completed;
            if (value !== undefined) task.value = value;
            if (percentage !== undefined) task.percentage = percentage;
            if (notes !== undefined) task.notes = notes;
        } else {
            // Create new
            task = new Task({
                goalId,
                userId: req.user.id,
                date: dateString,
                completed: completed || false,
                value: value || 0,
                percentage: percentage || 0,
                notes: notes || ''
            });
        }

        await task.save();

        // ✅ EMIT SOCKET EVENT FOR REAL-TIME UPDATES
        if (req.io) {
            try {
                const userId = req.user.id.toString();
                // Emit to user's personal room
                req.io.to(`user:${userId}`).emit('progress.updated', {
                    userId: userId,
                    taskId: task._id.toString(),
                    goalId: task.goalId.toString(),
                    completed: task.completed,
                    percentage: task.percentage,
                    date: task.date
                });
                req.io.to(`user:${userId}`).emit('progress.updated.success', {
                    userId: userId,
                    taskId: task._id.toString(),
                    goalId: task.goalId.toString(),
                    completed: task.completed,
                    percentage: task.percentage,
                    date: task.date
                });
                console.log('📡 Emitted progress.updated event for user:', req.user.username);
            } catch (emitError) {
                console.error('Failed to emit socket event:', emitError);
            }
        }

        // Notify friends if goal completed
        if (task.completed || task.percentage === 100) {
            try {
                const Friend = (await import('../models/Friend.js')).default;
                const notificationService = await import('../services/notificationService.js');
                const streakCalculator = await import('../utils/streakCalculator.js');

                // Find all accepted friends
                const friends = await Friend.find({
                    $or: [{ requester: req.user.id }, { recipient: req.user.id }],
                    status: 'accepted'
                });

                // Send completion notification
                for (const friendship of friends) {
                    const friendId = friendship.requester.toString() === req.user.id.toString()
                        ? friendship.recipient
                        : friendship.requester;

                    await notificationService.createNotification(friendId, 'friend_goal_completed', {
                        friendName: req.user.username,
                        goalTitle: goal.title,
                        goalId: goal._id
                    });
                }

                // Check for streak milestone
                // Get all tasks to calculate new streak accurately
                const allTasks = await Task.find({ userId: req.user.id });
                const streak = streakCalculator.calculateStreak(allTasks);

                if ([3, 7, 30, 100, 365].includes(streak)) {
                    // Notify user
                    await notificationService.createNotification(req.user.id, 'streak_milestone', {
                        streak,
                        message: `You've hit a ${streak}-day streak! Keep it up! 🔥`
                    });

                    // Notify friends about streak
                    for (const friendship of friends) {
                        const friendId = friendship.requester.toString() === req.user.id.toString()
                            ? friendship.recipient
                            : friendship.requester;

                        await notificationService.createNotification(friendId, 'friend_streak_milestone', {
                            friendName: req.user.username,
                            streak
                        });
                    }
                }

            } catch (error) {
                console.error('Error sending notifications:', error);
            }
        }

        res.json({ task });
    } catch (error) {
        console.error('Create/update task error:', error);
        res.status(500).json({ error: 'Server error', message: error.message });
    }
});

// Get tasks by date
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { date, goalId } = req.query;

        let query = { userId: req.user._id };

        if (date) {
            // Convert to YYYY-MM-DD format using local timezone
            let dateString;
            if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
                dateString = date;
            } else {
                const d = new Date(date);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                dateString = `${year}-${month}-${day}`;
            }

            query.date = dateString;
        }

        if (goalId) {
            query.goalId = goalId;
        }

        const tasks = await Task.find(query)
            .populate('goalId', 'title type')
            .sort({ date: -1 });

        res.json({ tasks });
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get specific task
router.get('/:taskId', authenticateToken, async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId)
            .populate('goalId', 'title type');

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        if (task.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        res.json({ task });
    } catch (error) {
        console.error('Get task error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Bulk complete all goals for a date
router.post('/bulk-complete', authenticateToken, async (req, res) => {
    try {
        const { date, goalIds } = req.body;

        if (!date || !goalIds || !Array.isArray(goalIds)) {
            return res.status(400).json({ error: 'Date and goalIds array are required' });
        }

        // Ensure date is in YYYY-MM-DD format using local timezone
        let dateString;
        if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            dateString = date;
        } else {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            dateString = `${year}-${month}-${day}`;
        }

        const tasks = [];

        for (const goalId of goalIds) {
            // Verify goal exists and belongs to user
            const goal = await Goal.findById(goalId);
            if (!goal || goal.userId.toString() !== req.user.id.toString()) {
                continue; // Skip invalid goals
            }

            // Find existing task or create new one
            let task = await Task.findOne({
                goalId,
                userId: req.user.id,
                date: dateString
            });

            if (task) {
                // Update existing
                task.completed = true;
                task.percentage = 100;
            } else {
                // Create new
                task = new Task({
                    goalId,
                    userId: req.user.id,
                    date: dateString,
                    completed: true,
                    value: 0,
                    percentage: 100,
                    notes: ''
                });
            }

            await task.save();
            tasks.push(task);
        }

        // ✅ EMIT SOCKET EVENT FOR REAL-TIME UPDATES
        if (req.io && tasks.length > 0) {
            try {
                const userId = req.user.id.toString();
                req.io.to(`user:${userId}`).emit('progress.updated', {
                    userId: userId,
                    date: dateString,
                    bulkUpdate: true
                });
                req.io.to(`user:${userId}`).emit('progress.updated.success', {
                    userId: userId,
                    date: dateString,
                    bulkUpdate: true
                });
                console.log('📡 Emitted bulk progress.updated event for user:', req.user.username);
            } catch (emitError) {
                console.error('Failed to emit socket event:', emitError);
            }
        }

        res.json({ tasks, message: `Completed ${tasks.length} goals` });
    } catch (error) {
        console.error('Bulk complete error:', error);
        res.status(500).json({ error: 'Server error', message: error.message });
    }
});

export default router;
