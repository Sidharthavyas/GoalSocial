import express from 'express';
import Comment from '../models/Comment.js';
import Goal from '../models/Goal.js';
import Task from '../models/Task.js';
import Friend from '../models/Friend.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Add comment
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { targetType, targetId, content } = req.body;

        if (!targetType || !targetId || !content) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (!['goal', 'task'].includes(targetType)) {
            return res.status(400).json({ error: 'Invalid target type' });
        }

        // Verify target exists and user has access
        let target;
        if (targetType === 'goal') {
            target = await Goal.findById(targetId);
        } else {
            target = await Task.findById(targetId);
        }

        if (!target) {
            return res.status(404).json({ error: 'Target not found' });
        }

        // Check if user can comment (owner or friend)
        const targetUserId = targetType === 'goal' ? target.userId : target.userId;

        if (targetUserId.toString() !== req.user._id.toString()) {
            // Check if friends
            const friendship = await Friend.findOne({
                $or: [
                    { requester: req.user._id, recipient: targetUserId, status: 'accepted' },
                    { requester: targetUserId, recipient: req.user._id, status: 'accepted' }
                ]
            });

            if (!friendship) {
                return res.status(403).json({ error: 'Not authorized' });
            }
        }

        const comment = new Comment({
            userId: req.user._id,
            targetType,
            targetId,
            content
        });

        await comment.save();
        await comment.populate('userId', 'uuid username');

        res.status(201).json({ comment });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get comments for target
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { targetType, targetId } = req.query;

        if (!targetType || !targetId) {
            return res.status(400).json({ error: 'Target type and ID required' });
        }

        const comments = await Comment.find({ targetType, targetId })
            .populate('userId', 'uuid username')
            .sort({ createdAt: -1 });

        res.json({ comments });
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
