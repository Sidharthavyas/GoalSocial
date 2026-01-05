import express from 'express';
import Task from '../models/Task.js';
import { authenticateToken } from '../middleware/auth.js';
import { calculateStreak } from '../utils/streakCalculator.js';

const router = express.Router();

// Get weekly insights
router.get('/weekly', authenticateToken, async (req, res) => {
    try {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStr = weekAgo.toISOString().split('T')[0];

        const today = new Date().toISOString().split('T')[0];

        // Get all tasks from the past week
        const tasks = await Task.find({
            userId: req.user._id,
            date: { $gte: weekAgoStr, $lte: today }
        }).populate('goalId');

        if (tasks.length === 0) {
            return res.json({
                weekStart: weekAgoStr,
                weekEnd: today,
                bestDay: null,
                worstDay: null,
                streakMaintained: false,
                consistencyPercent: 0,
                totalGoalsCompleted: 0,
                averageCompletion: 0,
                daysActive: 0
            });
        }

        // Group tasks by date
        const dayMap = {};
        tasks.forEach(task => {
            const dateKey = task.date;
            if (!dayMap[dateKey]) {
                dayMap[dateKey] = [];
            }
            dayMap[dateKey].push(task);
        });

        // Calculate daily completion rates
        const dailyStats = Object.keys(dayMap).map(date => {
            const dayTasks = dayMap[date];
            const completed = dayTasks.filter(t => t.completed || t.percentage === 100).length;
            const total = dayTasks.length;
            const completion = total > 0 ? Math.round((completed / total) * 100) : 0;

            return { date, completion, completed, total };
        });

        // Find best and worst days
        const sortedByCompletion = [...dailyStats].sort((a, b) => b.completion - a.completion);
        const bestDay = sortedByCompletion[0];
        const worstDay = sortedByCompletion[sortedByCompletion.length - 1];

        // Calculate consistency (days with any progress)
        const daysWithProgress = dailyStats.filter(d => d.completion > 0).length;
        const totalDays = 7;
        const consistencyPercent = Math.round((daysWithProgress / totalDays) * 100);

        // Calculate average completion
        const averageCompletion = Math.round(
            dailyStats.reduce((sum, d) => sum + d.completion, 0) / dailyStats.length
        );

        // Total goals completed
        const totalGoalsCompleted = tasks.filter(t => t.completed || t.percentage === 100).length;

        // Check if streak was maintained (at least some progress each day)
        const streakMaintained = consistencyPercent >= 85;

        // Get all user tasks for streak calculation
        const allTasks = await Task.find({ userId: req.user._id });
        const currentStreak = calculateStreak(allTasks);

        res.json({
            weekStart: weekAgoStr,
            weekEnd: today,
            bestDay: bestDay ? {
                date: bestDay.date,
                completion: bestDay.completion,
                completed: bestDay.completed,
                total: bestDay.total
            } : null,
            worstDay: worstDay ? {
                date: worstDay.date,
                completion: worstDay.completion,
                completed: worstDay.completed,
                total: worstDay.total
            } : null,
            streakMaintained,
            consistencyPercent,
            totalGoalsCompleted,
            averageCompletion,
            daysActive: daysWithProgress,
            currentStreak
        });
    } catch (error) {
        console.error('Get weekly insights error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
