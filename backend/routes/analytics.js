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

            // Fetch tasks for this day to see what was done
            const tasksOnDay = await Task.find({
                userId: req.user._id,
                date: dateStr
            });

            // Get all tasks ever to check for previous completions of one-time goals
            const allUserTasks = await Task.find({
                userId: req.user._id,
                completed: true
            });

            // Filter relevant goals for this specific day
            const goals = await Goal.find({
                userId: req.user._id,
                startDate: { $lte: dateObj }, // Started on or before today
                $or: [
                    { endDate: null },
                    { endDate: { $gte: dateObj } } // Not ended yet
                ]
            });

            let activeGoalCount = 0;
            const completedGoalIds = new Set(
                tasksOnDay
                    .filter(t => t.completed || t.percentage === 100)
                    .map(t => t.goalId.toString())
            );

            // Refined Filtering Logic - Count only goals that should be active on this specific day
            for (const goal of goals) {
                // Check if goal was created on or before this day
                const goalCreatedDate = new Date(goal.createdAt);
                goalCreatedDate.setHours(0, 0, 0, 0);
                if (goalCreatedDate > dateObj) {
                    continue; // Goal wasn't created yet on this day
                }

                // Get tasks for this specific goal only
                const goalTasks = await Task.find({
                    userId: req.user._id,
                    goalId: goal._id
                });

                // 1. Recurring goals count if they are active (checked by query above)
                if (goal.type === 'recurring' || goal.type === 'series') {
                    activeGoalCount++;
                }
                // 2. One-time goals count only if they were NOT completed before this day
                else if (goal.type === 'one-time') {
                    const previouslyCompleted = goalTasks.some(t =>
                        t.date < dateStr && // Completed before this day
                        (t.completed || t.percentage === 100)
                    );

                    if (!previouslyCompleted) {
                        activeGoalCount++;
                    }
                }
                // 3. Numeric/Percentage goals count if they haven't reached target
                else if (goal.type === 'numeric' || goal.type === 'percentage') {
                    // Check if goal was completed before this day
                    const completedBefore = goalTasks.some(t =>
                        t.date < dateStr &&
                        (t.completed || t.percentage === 100 || (goal.targetValue && t.value >= goal.targetValue))
                    );

                    if (!completedBefore) {
                        activeGoalCount++;
                    }
                }
            }

            const completionPercent = activeGoalCount > 0
                ? Math.round((completedGoalIds.size / activeGoalCount) * 100)
                : 0;

            days.push({
                date: dateStr,
                completionPercent: Math.min(completionPercent, 100), // Cap at 100
                totalGoals: activeGoalCount,
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

            // Fetch tasks for this day to see what was done
            const tasksOnDay = await Task.find({
                userId: req.user._id,
                date: dateStr
            });

            // Filter relevant goals for this specific day
            // Only count goals that were actually created on or before this day AND are active
            const goals = await Goal.find({
                userId: req.user._id,
                createdAt: { $lte: new Date(dateObj.getTime() + 24 * 60 * 60 * 1000) }, // Created on or before this day
                startDate: { $lte: dateObj }, // Started on or before this day
                isActive: true, // Only active goals
                $or: [
                    { endDate: null },
                    { endDate: { $gte: dateObj } } // Not ended yet
                ]
            });

            let activeGoalCount = 0;
            const completedGoalIds = new Set(
                tasksOnDay
                    .filter(t => t.completed || t.percentage === 100)
                    .map(t => t.goalId.toString())
            );

            // Refined Filtering Logic - Count only goals that should be active on this specific day
            for (const goal of goals) {
                // Check if goal was created on or before this day
                const goalCreatedDate = new Date(goal.createdAt);
                goalCreatedDate.setHours(0, 0, 0, 0);
                if (goalCreatedDate > dateObj) {
                    continue; // Goal wasn't created yet on this day
                }

                // Get tasks for this specific goal only
                const goalTasks = await Task.find({
                    userId: req.user._id,
                    goalId: goal._id
                });

                // 1. Recurring goals count if they are active (checked by query above)
                if (goal.type === 'recurring' || goal.type === 'series') {
                    activeGoalCount++;
                }
                // 2. One-time goals count only if they were NOT completed before this day
                else if (goal.type === 'one-time') {
                    const previouslyCompleted = goalTasks.some(t =>
                        t.date < dateStr && // Completed before this day
                        (t.completed || t.percentage === 100)
                    );

                    if (!previouslyCompleted) {
                        activeGoalCount++;
                    }
                }
                // 3. Numeric/Percentage goals count if they haven't reached target
                else if (goal.type === 'numeric' || goal.type === 'percentage') {
                    // Check if goal was completed before this day
                    const completedBefore = goalTasks.some(t =>
                        t.date < dateStr &&
                        (t.completed || t.percentage === 100 || (goal.targetValue && t.value >= goal.targetValue))
                    );

                    if (!completedBefore) {
                        activeGoalCount++;
                    }
                }
            }

            const completionPercent = activeGoalCount > 0
                ? Math.round((completedGoalIds.size / activeGoalCount) * 100)
                : 0;

            days.push({
                date: dateStr,
                completionPercent: Math.min(completionPercent, 100), // Cap at 100,
                totalGoals: activeGoalCount,
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

                // Count goals that were active on that day
                // Only count goals that were actually created on or before this day
                const goalsOnDay = await Goal.find({
                    userId: req.user._id,
                    createdAt: { $lte: new Date(dayDateObj.getTime() + 24 * 60 * 60 * 1000) }, // Created on or before this day
                    startDate: { $lte: dayDateObj },
                    isActive: true,
                    $or: [
                        { endDate: null },
                        { endDate: { $gte: dayDateObj } }
                    ]
                });

                const dayTasks = tasks.filter(t => t.date === dayDateStr);

                // Count active goals for this day (similar to weekly/monthly logic)
                let activeGoalCount = 0;
                for (const goal of goalsOnDay) {
                    // Check if goal was created on or before this day
                    const goalCreatedDate = new Date(goal.createdAt);
                    goalCreatedDate.setHours(0, 0, 0, 0);
                    if (goalCreatedDate > dayDateObj) {
                        continue; // Goal wasn't created yet on this day
                    }

                    // Get tasks for this specific goal only
                    const goalTasks = tasks.filter(t => 
                        t.goalId.toString() === goal._id.toString()
                    );

                    if (goal.type === 'recurring' || goal.type === 'series') {
                        activeGoalCount++;
                    } else if (goal.type === 'one-time') {
                        const previouslyCompleted = goalTasks.some(t =>
                            t.date < dayDateStr &&
                            (t.completed || t.percentage === 100)
                        );
                        if (!previouslyCompleted) {
                            activeGoalCount++;
                        }
                    } else if (goal.type === 'numeric' || goal.type === 'percentage') {
                        const completedBefore = goalTasks.some(t =>
                            t.date < dayDateStr &&
                            (t.completed || t.percentage === 100 || (goal.targetValue && t.value >= goal.targetValue))
                        );
                        if (!completedBefore) {
                            activeGoalCount++;
                        }
                    }
                }

                if (activeGoalCount > 0) {
                    const completedGoalIds = new Set(
                        dayTasks
                            .filter(t => t.completed || t.percentage === 100)
                            .map(t => t.goalId.toString())
                    );

                    totalCompletion += (completedGoalIds.size / activeGoalCount) * 100;
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
