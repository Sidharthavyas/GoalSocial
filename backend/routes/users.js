import express from 'express';
import User from '../models/User.js';
import Goal from '../models/Goal.js';
import Friend from '../models/Friend.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Search users by username or UUID
router.get('/search', authenticateToken, async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.status(400).json({ error: 'Search query must be at least 2 characters' });
        }

        const users = await User.find({
            $and: [
                { _id: { $ne: req.user._id } }, // Exclude current user
                {
                    $or: [
                        { username: { $regex: q, $options: 'i' } },
                        { uuid: { $regex: q, $options: 'i' } }
                    ]
                }
            ]
        })
            .select('uuid username email createdAt')
            .limit(20);

        res.json({ users });
    } catch (error) {
        console.error('User search error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user profile
router.get('/:userId', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .select('uuid username createdAt');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user's goals (only if friend or self)
router.get('/:userId/goals', authenticateToken, async (req, res) => {
    try {
        const targetUserId = req.params.userId;

        // Check if viewing own goals
        if (targetUserId === req.user._id.toString()) {
            const goals = await Goal.find({ userId: targetUserId, isActive: true })
                .sort({ createdAt: -1 });
            return res.json({ goals });
        }

        // Check if friends
        const friendship = await Friend.findOne({
            $or: [
                { requester: req.user._id, recipient: targetUserId, status: 'accepted' },
                { requester: targetUserId, recipient: req.user._id, status: 'accepted' }
            ]
        });

        if (!friendship) {
            return res.status(403).json({ error: 'Not authorized to view this user\'s goals' });
        }

        const goals = await Goal.find({ userId: targetUserId, isActive: true })
            .sort({ createdAt: -1 });

        res.json({ goals });
    } catch (error) {
        console.error('Get user goals error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
