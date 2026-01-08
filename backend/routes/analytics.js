import express from 'express';
import Task from '../models/Task.js';
import Goal from '../models/Goal.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get weekly analytics (last 7 days)
router.get('/weekly', authenticateToken, async (req, res) => {
    try {
        const days = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dateObj = new Date(dateStr);

            // Only count goals that were created before or on this day
            const goals = await Goal.find({
                userId: req.user._id,
                createdAt: { $lte: dateObj }
            });

            const tasks = await Task.find({
                userId: req.user._id,
                date: dateStr
            });

            const totalGoals = goals.length;

            // Get unique completed goal IDs
            const completedGoalIds = new Set(
                tasks
                    .filter(t => t.completed || t.percentage === 100)
                    .map(t => t.goalId.toString())
            );

            const completionPercent = totalGoals > 0
                ? Math.round((completedGoalIds.size / totalGoals) * 100)
                : 0;

            days.push({
                date: dateStr,
                completionPercent,
                totalGoals,
                completedGoals: completedGoalIds.size
            });
        }

        res.json({ days });
    } catch (error) {
        console.error('Error fetching weekly analytics:', error);
        res.status(500).json({ error: 'Failed to fetch weekly analytics' });
    }
});

// Get monthly analytics (current month's daily completion)
router.get('/monthly', authenticateToken, async (req, res) => {
    try {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            const dateObj = new Date(dateStr);

            // Don't fetch future dates
            if (date > today) break;

            // Only count goals that were created before or on this day
            const goals = await Goal.find({
                userId: req.user._id,
                createdAt: { $lte: dateObj }
            });

            const tasks = await Task.find({
                userId: req.user._id,
                date: dateStr
            });

            const totalGoals = goals.length;
            const completedGoalIds = new Set(
                tasks
                    .filter(t => t.completed || t.percentage === 100)
                    .map(t => t.goalId.toString())
            );

            const completionPercent = totalGoals > 0
                ? Math.round((completedGoalIds.size / totalGoals) * 100)
                : 0;

            days.push({
                date: dateStr,
                completionPercent,
                totalGoals,
                completedGoals: completedGoalIds.size
            });
        }

        res.json({ days, month: month + 1, year });
    } catch (error) {
        console.error('Error fetching monthly analytics:', error);
        res.status(500).json({ error: 'Failed to fetch monthly analytics' });
    }
});

// Get yearly analytics (last 12 months)
router.get('/yearly', authenticateToken, async (req, res) => {
    try {
        const months = [];
        const today = new Date();

        for (let i = 11; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const year = date.getFullYear();
            const month = date.getMonth();
            const monthStart = new Date(year, month, 1);
            const monthEnd = new Date(year, month + 1, 0);

            // Get all tasks for this month
            const monthStartStr = monthStart.toISOString().split('T')[0];
            const monthEndStr = monthEnd.toISOString().split('T')[0];

            const tasks = await Task.find({
                userId: req.user._id,
                date: { $gte: monthStartStr, $lte: monthEndStr }
            });

            // Calculate average completion for the month
            const daysInMonth = monthEnd.getDate();
            let totalCompletion = 0;
            let daysWithData = 0;

            for (let day = 1; day <= daysInMonth; day++) {
                const dayDate = new Date(year, month, day);
                if (dayDate > today) break;

                const dayDateStr = dayDate.toISOString().split('T')[0];
                const dayDateObj = new Date(dayDateStr);

                // Only count goals that existed on that day
                const goalsOnDay = await Goal.find({
                    userId: req.user._id,
                    createdAt: { $lte: dayDateObj }
                });

                const dayTasks = tasks.filter(t => t.date === dayDateStr);

                if (goalsOnDay.length > 0) {
                    const completedGoalIds = new Set(
                        dayTasks
                            .filter(t => t.completed || t.percentage === 100)
                            .map(t => t.goalId.toString())
                    );

                    totalCompletion += (completedGoalIds.size / goalsOnDay.length) * 100;
                    daysWithData++;
                }
            }

            const avgCompletionPercent = daysWithData > 0
                ? Math.round(totalCompletion / daysWithData)
                : 0;

            months.push({
                month: month + 1,
                year,
                monthName: date.toLocaleString('default', { month: 'short' }),
                avgCompletionPercent
            });
        }

        res.json({ months });
    } catch (error) {
        console.error('Error fetching yearly analytics:', error);
        res.status(500).json({ error: 'Failed to fetch yearly analytics' });
    }
});

export default router;
