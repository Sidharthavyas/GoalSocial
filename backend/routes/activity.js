import express from 'express';
import Friend from '../models/Friend.js';
import Goal from '../models/Goal.js';
import Task from '../models/Task.js';
import Comment from '../models/Comment.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get activity feed from friends
router.get('/', authenticateToken, async (req, res) => {
    try {
        // Get friend IDs
        const friendships = await Friend.find({
            $or: [
                { requester: req.user._id, status: 'accepted' },
                { recipient: req.user._id, status: 'accepted' }
            ]
        });

        const friendIds = friendships.map(f => {
            return f.requester.toString() === req.user._id.toString()
                ? f.recipient
                : f.requester;
        });

        if (friendIds.length === 0) {
            return res.json({ activities: [] });
        }

        const limit = parseInt(req.query.limit) || 50;

        // Get recent activities from friends
        const activities = [];

        // Recent goals
        const recentGoals = await Goal.find({
            userId: { $in: friendIds },
            isActive: true
        })
            .populate('userId', 'uuid username')
            .sort({ createdAt: -1 })
            .limit(20);

        recentGoals.forEach(goal => {
            activities.push({
                type: 'goal.created',
                user: goal.userId,
                goal: {
                    id: goal._id,
                    title: goal.title,
                    type: goal.type
                },
                timestamp: goal.createdAt
            });
        });

        // Recent tasks/progress
        const recentTasks = await Task.find({
            userId: { $in: friendIds }
        })
            .populate('userId', 'uuid username')
            .populate('goalId', 'title type')
            .sort({ updatedAt: -1 })
            .limit(30);

        recentTasks.forEach(task => {
            activities.push({
                type: 'progress.updated',
                user: task.userId,
                task: {
                    id: task._id,
                    date: task.date,
                    completed: task.completed,
                    percentage: task.percentage,
                    value: task.value
                },
                goal: task.goalId,
                timestamp: task.updatedAt
            });
        });

        // Recent comments
        const recentComments = await Comment.find({
            userId: { $in: friendIds }
        })
            .populate('userId', 'uuid username')
            .sort({ createdAt: -1 })
            .limit(20);

        recentComments.forEach(comment => {
            activities.push({
                type: 'comment.created',
                user: comment.userId,
                comment: {
                    id: comment._id,
                    targetType: comment.targetType,
                    targetId: comment.targetId,
                    content: comment.content.substring(0, 100)
                },
                timestamp: comment.createdAt
            });
        });

        // Sort by timestamp and limit
        activities.sort((a, b) => b.timestamp - a.timestamp);
        const limitedActivities = activities.slice(0, limit);

        res.json({ activities: limitedActivities });
    } catch (error) {
        console.error('Get activity error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
