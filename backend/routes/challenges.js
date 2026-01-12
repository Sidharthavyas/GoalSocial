import express from 'express';
import Challenge from '../models/Challenge.js';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Goal from '../models/Goal.js';
import Friend from '../models/Friend.js';
import { createNotification } from '../services/notificationService.js';
import { authenticateToken as auth } from '../middleware/auth.js';

const router = express.Router();

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

        // Notify friends about joining challenge
        try {
            const friends = await Friend.find({
                $or: [{ requester: req.user._id }, { recipient: req.user._id }],
                status: 'accepted'
            });

            for (const friendship of friends) {
                const friendId = friendship.requester.toString() === req.user._id.toString()
                    ? friendship.recipient
                    : friendship.requester;

                await createNotification(friendId, 'friend_challenge_joined', {
                    friendName: req.user.username,
                    challengeTitle: challenge.title,
                    challengeId: challenge._id
                });
            }
        } catch (error) {
            console.error('Error sending challenge notifications:', error);
        }

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

export default router;
