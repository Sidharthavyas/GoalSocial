import express from 'express';
import PublicProfile from '../models/PublicProfile.js';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Goal from '../models/Goal.js';
import { authenticateToken } from '../middleware/auth.js';
import { calculateStreak } from '../utils/streakCalculator.js';

const router = express.Router();

// Enable public profile (authenticated)
router.post('/enable', authenticateToken, async (req, res) => {
    try {
        let profile = await PublicProfile.findOne({ userId: req.user._id });

        if (!profile) {
            profile = new PublicProfile({
                userId: req.user._id,
                enabled: true
            });
        } else {
            profile.enabled = true;
        }

        await profile.save();

        res.json({
            message: 'Public profile enabled',
            shareId: profile.shareId,
            shareUrl: `${process.env.FRONTEND_URL}/public/${profile.shareId}`
        });
    } catch (error) {
        console.error('Enable public profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Disable public profile (authenticated)
router.post('/disable', authenticateToken, async (req, res) => {
    try {
        const profile = await PublicProfile.findOne({ userId: req.user._id });

        if (profile) {
            profile.enabled = false;
            await profile.save();
        }

        res.json({ message: 'Public profile disabled' });
    } catch (error) {
        console.error('Disable public profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update settings (authenticated)
router.put('/settings', authenticateToken, async (req, res) => {
    try {
        const { showStreaks, showConsistency, showGoalCount, showBadges } = req.body;

        let profile = await PublicProfile.findOne({ userId: req.user._id });

        if (!profile) {
            return res.status(404).json({ error: 'Public profile not found' });
        }

        if (showStreaks !== undefined) profile.settings.showStreaks = showStreaks;
        if (showConsistency !== undefined) profile.settings.showConsistency = showConsistency;
        if (showGoalCount !== undefined) profile.settings.showGoalCount = showGoalCount;
        if (showBadges !== undefined) profile.settings.showBadges = showBadges;

        await profile.save();

        res.json({ message: 'Settings updated', profile });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get my public profile info (authenticated)
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const profile = await PublicProfile.findOne({ userId: req.user._id });

        res.json({
            profile,
            shareUrl: profile ? `${process.env.FRONTEND_URL}/public/${profile.shareId}` : null
        });
    } catch (error) {
        console.error('Get my profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get public profile by shareId (NO AUTH REQUIRED)
router.get('/:shareId', async (req, res) => {
    try {
        const { shareId } = req.params;

        const profile = await PublicProfile.findOne({ shareId, enabled: true })
            .populate('userId', 'username');

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found or disabled' });
        }

        const user = profile.userId;

        // Get user's tasks for stats
        const tasks = await Task.find({ userId: user._id });
        const goals = await Goal.find({ userId: user._id, isActive: true });

        // Calculate streak
        const currentStreak = calculateStreak(tasks);

        // Calculate longest streak (simplified)
        const longestStreak = currentStreak; // TODO: Implement proper longest streak calculation

        // Calculate consistency (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

        const recentTasks = tasks.filter(t => t.date >= thirtyDaysAgoStr);
        const daysWithProgress = new Set(
            recentTasks.filter(t => t.completed || t.percentage > 0).map(t => t.date)
        ).size;
        const consistencyRate = Math.round((daysWithProgress / 30) * 100);

        // Calculate total completed goals
        const totalCompleted = tasks.filter(t => t.completed || t.percentage === 100).length;

        // Build response based on settings
        const publicData = {
            username: user.username,
            joinedDate: user.createdAt
        };

        if (profile.settings.showStreaks) {
            publicData.currentStreak = currentStreak;
            publicData.longestStreak = longestStreak;
        }

        if (profile.settings.showConsistency) {
            publicData.consistencyRate = consistencyRate;
        }

        if (profile.settings.showGoalCount) {
            publicData.totalGoals = goals.length;
            publicData.activeGoals = goals.length;
            publicData.totalCompleted = totalCompleted;
        }

        if (profile.settings.showBadges) {
            const badges = [];
            if (currentStreak >= 30) badges.push('💎 30 Day Streak');
            if (currentStreak >= 7) badges.push('⭐ 7 Day Streak');
            if (currentStreak >= 3) badges.push('🔥 3 Day Streak');
            if (totalCompleted >= 100) badges.push('🏆 100 Goals');
            if (totalCompleted >= 50) badges.push('🎯 50 Goals');
            publicData.badges = badges;
        }

        res.json(publicData);
    } catch (error) {
        console.error('Get public profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
