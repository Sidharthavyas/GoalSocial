const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const Task = require('../models/Task');
const Goal = require('../models/Goal');
const auth = require('../middleware/auth');

// Get all public challenges
router.get('/', auth, async (req, res) => {
    try {
        const challenges = await Challenge.find({ isPublic: true })
            .populate('creator', 'username')
            .sort('-createdAt');
        res.json(challenges);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new challenge
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, type, startDate, endDate, targetValue } = req.body;

        const challenge = new Challenge({
            title,
            description,
            type,
            startDate,
            endDate,
            targetValue,
            creator: req.user.id,
            participants: [req.user.id] // Creator auto-joins
        });

        await challenge.save();
        res.status(201).json(challenge);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Join a challenge
router.post('/:id/join', auth, async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);
        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        if (challenge.participants.includes(req.user.id)) {
            return res.status(400).json({ error: 'Already joined' });
        }

        challenge.participants.push(req.user.id);
        await challenge.save();

        res.json(challenge);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Leaderboard
router.get('/:id/leaderboard', auth, async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id)
            .populate('participants', 'username avatar');

        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        // Calculate progress for each participant
        const leaderboard = [];
        const start = new Date(challenge.startDate);
        const end = new Date(challenge.endDate);

        // This is a simplified calculation. Real-world would be more complex/optimized.
        for (const user of challenge.participants) {
            // Find goals of this user that might match the challenge type
            // For now, we'll just count ALL completed tasks within the date range as a robust baseline
            // Ideally, we'd filter by linkedGoalKeyword if present

            let query = {
                userId: user._id,
                date: {
                    $gte: start.toISOString().split('T')[0],
                    $lte: end.toISOString().split('T')[0]
                },
                completed: true
            };

            const tasks = await Task.find(query);
            const score = tasks.length; // Simple count scoring

            leaderboard.push({
                user: {
                    _id: user._id,
                    username: user.username,
                    avatar: user.avatar
                },
                score
            });
        }

        // Sort by score descending
        leaderboard.sort((a, b) => b.score - a.score);

        res.json({ challenge, leaderboard });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
