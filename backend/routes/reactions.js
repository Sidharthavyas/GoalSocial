import express from 'express';
import Reaction from '../models/Reaction.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Add or update reaction
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { targetType, targetId, emoji } = req.body;

        if (!targetType || !targetId || !emoji) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (!['goal', 'task', 'comment'].includes(targetType)) {
            return res.status(400).json({ error: 'Invalid target type' });
        }

        // Upsert reaction (update if exists, create if not)
        const reaction = await Reaction.findOneAndUpdate(
            {
                userId: req.user._id,
                targetType,
                targetId
            },
            {
                emoji
            },
            {
                upsert: true,
                new: true
            }
        );

        await reaction.populate('userId', 'uuid username');

        res.json({ reaction });
    } catch (error) {
        console.error('Add reaction error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Remove reaction
router.delete('/:reactionId', authenticateToken, async (req, res) => {
    try {
        const reaction = await Reaction.findById(req.params.reactionId);

        if (!reaction) {
            return res.status(404).json({ error: 'Reaction not found' });
        }

        if (reaction.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await Reaction.findByIdAndDelete(req.params.reactionId);

        res.json({ message: 'Reaction removed' });
    } catch (error) {
        console.error('Remove reaction error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get reactions for target
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { targetType, targetId } = req.query;

        if (!targetType || !targetId) {
            return res.status(400).json({ error: 'Target type and ID required' });
        }

        const reactions = await Reaction.find({ targetType, targetId })
            .populate('userId', 'uuid username')
            .sort({ createdAt: -1 });

        res.json({ reactions });
    } catch (error) {
        console.error('Get reactions error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
