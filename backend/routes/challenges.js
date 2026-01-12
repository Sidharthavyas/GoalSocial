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

// Complete today's challenge task
router.post('/:id/complete-today', auth, async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);
        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        if (!challenge.participants.includes(req.user.id)) {
            return res.status(403).json({ error: 'You must join the challenge first' });
        }

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // Check if already completed today
        const existingCompletion = challenge.dailyCompletions.find(
            dc => dc.userId.toString() === req.user.id && dc.date === today
        );

        if (existingCompletion) {
            return res.status(400).json({ error: 'Already completed today' });
        }

        // Add today's completion
        challenge.dailyCompletions.push({
            userId: req.user.id,
            date: today,
            completed: true,
            completedAt: new Date()
        });

        await challenge.save();

        res.json({
            message: 'Daily task completed!',
            challenge,
            todayCompleted: true
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user's progress in a challenge
router.get('/:id/my-progress', auth, async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);
        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        const userCompletions = challenge.dailyCompletions.filter(
            dc => dc.userId.toString() === req.user.id
        );

        const today = new Date().toISOString().split('T')[0];
        const completedToday = userCompletions.some(dc => dc.date === today);

        res.json({
            challenge,
            isParticipant: challenge.participants.includes(req.user.id),
            completions: userCompletions,
            completedToday,
            totalDays: userCompletions.length,
            streak: calculateStreak(userCompletions)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Leave a challenge
router.post('/:id/leave', auth, async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);
        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        const index = challenge.participants.indexOf(req.user.id);
        if (index === -1) {
            return res.status(400).json({ error: 'Not a participant' });
        }

        challenge.participants.splice(index, 1);
        await challenge.save();

        res.json({ message: 'Left challenge successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a challenge (creator only)
router.put('/:id', auth, async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);
        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        // Only creator can update
        if (challenge.creator.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Only the creator can update this challenge' });
        }

        const { title, description, type, targetValue, endDate } = req.body;

        if (title) challenge.title = title;
        if (description !== undefined) challenge.description = description;
        if (type) challenge.type = type;
        if (targetValue !== undefined) challenge.targetValue = targetValue;
        if (endDate) challenge.endDate = endDate;

        await challenge.save();
        res.json(challenge);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a challenge (creator only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);
        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        // Only creator can delete
        if (challenge.creator.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Only the creator can delete this challenge' });
        }

        await Challenge.findByIdAndDelete(req.params.id);
        res.json({ message: 'Challenge deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove a participant from challenge (creator only)
router.post('/:id/remove-participant', auth, async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);
        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        // Only creator can remove participants
        if (challenge.creator.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Only the creator can remove participants' });
        }

        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const index = challenge.participants.indexOf(userId);
        if (index === -1) {
            return res.status(400).json({ error: 'User is not a participant' });
        }

        challenge.participants.splice(index, 1);

        // Also remove their daily completions
        challenge.dailyCompletions = challenge.dailyCompletions.filter(
            dc => dc.userId.toString() !== userId
        );

        await challenge.save();
        res.json({ message: 'Participant removed successfully', challenge });
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

        // Calculate progress for each participant based on dailyCompletions
        const leaderboard = [];

        for (const user of challenge.participants) {
            const userCompletions = challenge.dailyCompletions.filter(
                dc => dc.userId.toString() === user._id.toString() && dc.completed
            );

            const score = userCompletions.length; // Number of days completed
            const streak = calculateStreak(userCompletions);

            leaderboard.push({
                user: {
                    _id: user._id,
                    username: user.username,
                    avatar: user.avatar
                },
                score,
                streak,
                lastCompleted: userCompletions.length > 0
                    ? userCompletions[userCompletions.length - 1].date
                    : null
            });
        }

        // Sort by score descending
        leaderboard.sort((a, b) => b.score - a.score);

        res.json({ challenge, leaderboard });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper function to calculate streak
function calculateStreak(completions) {
    if (completions.length === 0) return 0;

    // Sort by date descending
    const sorted = completions
        .map(c => c.date)
        .sort((a, b) => new Date(b) - new Date(a));

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < sorted.length; i++) {
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);
        const expectedDateStr = expectedDate.toISOString().split('T')[0];

        if (sorted[i] === expectedDateStr) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

export default router;
