import express from 'express';
import Goal from '../models/Goal.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create new goal
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, description, type, targetValue, unit, startDate, endDate } = req.body;

        if (!title || !type) {
            return res.status(400).json({ error: 'Title and type are required' });
        }

        const validTypes = ['one-time', 'recurring', 'series', 'numeric', 'percentage'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ error: 'Invalid goal type' });
        }

        const goal = new Goal({
            userId: req.user._id,
            title,
            description,
            type,
            targetValue,
            unit,
            startDate,
            endDate
        });

        await goal.save();

        res.status(201).json({ goal });
    } catch (error) {
        console.error('Create goal error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user's goals
router.get('/', authenticateToken, async (req, res) => {
    try {
        const goals = await Goal.find({
            userId: req.user._id,
            isActive: true
        }).sort({ createdAt: -1 });

        res.json({ goals });
    } catch (error) {
        console.error('Get goals error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get specific goal
router.get('/:goalId', authenticateToken, async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.goalId);

        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        // Check ownership
        if (goal.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        res.json({ goal });
    } catch (error) {
        console.error('Get goal error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update goal
router.put('/:goalId', authenticateToken, async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.goalId);

        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        // Check ownership
        if (goal.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { title, description, type, targetValue, unit, endDate, isActive } = req.body;

        if (title) goal.title = title;
        if (description !== undefined) goal.description = description;
        if (type) goal.type = type;
        if (targetValue !== undefined) goal.targetValue = targetValue;
        if (unit !== undefined) goal.unit = unit;
        if (endDate !== undefined) goal.endDate = endDate;
        if (isActive !== undefined) goal.isActive = isActive;

        await goal.save();

        res.json({ goal });
    } catch (error) {
        console.error('Update goal error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete goal
router.delete('/:goalId', authenticateToken, async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.goalId);

        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        // Check ownership
        if (goal.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        goal.isActive = false;
        await goal.save();

        res.json({ message: 'Goal deleted' });
    } catch (error) {
        console.error('Delete goal error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
