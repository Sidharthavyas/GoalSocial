import express from 'express';
import Task from '../models/Task.js';
import { authenticateToken } from '../middleware/auth.js';
import { calculateStreak, getDailySummary } from '../utils/streakCalculator.js';

const router = express.Router();

// Get daily summary
router.get('/day/:date', authenticateToken, async (req, res) => {
    try {
        const { date } = req.params;

        // Get all tasks for this user on this date
        const tasks = await Task.find({
            userId: req.user._id,
            date: { $regex: `^${date}` }
        }).populate('goalId');

        // Get all user tasks for streak calculation
        const allTasks = await Task.find({
            userId: req.user._id
        });

        const summary = getDailySummary(tasks);
        const streakDays = calculateStreak(allTasks);

        res.json({
            ...summary,
            streakDays,
            date
        });
    } catch (error) {
        console.error('Get daily summary error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get month summary
router.get('/month', authenticateToken, async (req, res) => {
    try {
        const { year, month } = req.query;

        if (!year || !month) {
            return res.status(400).json({ error: 'Year and month required' });
        }

        // Get start and end of month
        const startDate = `${year}-${month.padStart(2, '0')}-01`;
        const endDay = new Date(year, parseInt(month), 0).getDate();
        const endDate = `${year}-${month.padStart(2, '0')}-${endDay}`;

        // Get all tasks for this month
        const tasks = await Task.find({
            userId: req.user._id,
            date: { $gte: startDate, $lte: endDate }
        });

        // Group by date
        const dayMap = {};
        tasks.forEach(task => {
            const dateKey = task.date.split('T')[0];
            if (!dayMap[dateKey]) {
                dayMap[dateKey] = [];
            }
            dayMap[dateKey].push(task);
        });

        // Calculate summary for each day
        const days = Object.keys(dayMap).map(date => {
            const dayTasks = dayMap[date];
            const summary = getDailySummary(dayTasks);
            const flags = [];

            if (summary.completion === 100) flags.push('perfect');
            if (summary.goalsMissed > 0 && summary.completion === 0) flags.push('missed');
            if (summary.streakActive) flags.push('streak');

            return {
                date,
                completion: summary.completion,
                tasks: dayTasks.length,
                flags
            };
        });

        res.json({ days });
    } catch (error) {
        console.error('Get month summary error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
