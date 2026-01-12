import express from 'express';
import Routine from '../models/Routine.js';
import { authenticateToken as auth } from '../middleware/auth.js';

const router = express.Router();

// Get all user routines
router.get('/', auth, async (req, res) => {
    try {
        const routines = await Routine.find({ userId: req.user.id })
            .populate('goals');
        res.json(routines);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new routine
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, emoji, goals, activeDays, reminderTime } = req.body;

        const routine = new Routine({
            userId: req.user.id,
            title,
            description,
            emoji,
            goals,
            activeDays,
            reminderTime
        });

        await routine.save();
        res.status(201).json(routine);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update a routine
router.put('/:id', auth, async (req, res) => {
    try {
        const routine = await Routine.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );
        if (!routine) return res.status(404).json({ error: 'Routine not found' });
        res.json(routine);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a routine
router.delete('/:id', auth, async (req, res) => {
    try {
        const routine = await Routine.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!routine) return res.status(404).json({ error: 'Routine not found' });
        res.json({ message: 'Routine deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
