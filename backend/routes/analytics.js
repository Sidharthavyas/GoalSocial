import express from 'express';
import Task from '../models/Task.js';
import Goal from '../models/Goal.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper function to count active goals for a specific date
async function countActiveGoalsForDate(userId, dateStr, dateObj, tasksOnDay) {
    // Get all goal IDs that have tasks on this date
    const goalIdsWithTasks = [...new Set(tasksOnDay.map(t => t.goalId.toString()))];

    // Find goals that are active OR have tasks on this date
    const goals = await Goal.find({
        userId: userId,
        isActive: true,
        $or: [
            {
                startDate: { $lte: dateObj },
                $or: [
                    { endDate: null },
                    { endDate: { $gte: dateObj } }
                ]
            },
            { _id: { $in: goalIdsWithTasks } }
        ]
    });

    let activeGoalCount = 0;
    const completedGoalIds = new Set(
        tasksOnDay
            .filter(t => t.completed || t.percentage === 100)
            .map(t => t.goalId.toString())
    );

    for (const goal of goals) {
        const goalIdStr = goal._id.toString();

        // Check if this goal has a task on this specific date
        const hasTaskOnThisDate = tasksOnDay.some(t => t.goalId.toString() === goalIdStr);

        // If goal has a task on this date, it WAS being tracked on this date
        // So we should count it, regardless of createdAt
        if (hasTaskOnThisDate) {
            // Get all tasks for this goal to check previous completions
            const allGoalTasks = await Task.find({
                userId: userId,
                goalId: goal._id
            });

            // For one-time goals, only count if not completed BEFORE this date
            if (goal.type === 'one-time') {
                const previouslyCompleted = allGoalTasks.some(t =>
                    t.date < dateStr && (t.completed || t.percentage === 100)
                );
                if (!previouslyCompleted) {
                    activeGoalCount++;
                }
            }
            // For numeric/percentage goals
            else if (goal.type === 'numeric' || goal.type === 'percentage') {
                const completedBefore = allGoalTasks.some(t =>
                    t.date < dateStr &&
                    (t.completed || t.percentage === 100 || (goal.targetValue && t.value >= goal.targetValue))
                );
                if (!completedBefore) {
                    activeGoalCount++;
                }
            }
            // Recurring/series goals always count if they have tasks
            else {
                activeGoalCount++;
            }
        }
        // No task on this date - check if goal should still be counted
        else {
            // Check if goal was created on or before this day
            const goalCreatedDate = new Date(goal.createdAt);
            goalCreatedDate.setHours(0, 0, 0, 0);

            if (goalCreatedDate > dateObj) {
                continue; // Goal wasn't created yet on this day
            }

            // Check goal start date
            const goalStartDate = new Date(goal.startDate);
            goalStartDate.setHours(0, 0, 0, 0);

            if (goalStartDate > dateObj) {
                continue; // Goal hadn't started yet
            }

            // Get tasks for this specific goal
            const allGoalTasks = await Task.find({
                userId: userId,
                goalId: goal._id
            });

            if (goal.type === 'recurring' || goal.type === 'series') {
                activeGoalCount++;
            }
            else if (goal.type === 'one-time') {
                const previouslyCompleted = allGoalTasks.some(t =>
                    t.date < dateStr && (t.completed || t.percentage === 100)
                );
                if (!previouslyCompleted) {
                    activeGoalCount++;
                }
            }
            else if (goal.type === 'numeric' || goal.type === 'percentage') {
                const completedBefore = allGoalTasks.some(t =>
                    t.date < dateStr &&
                    (t.completed || t.percentage === 100 || (goal.targetValue && t.value >= goal.targetValue))
                );
                if (!completedBefore) {
                    activeGoalCount++;
                }
            }
        }
    }

    // IMPORTANT FIX: If we have completed goals but activeGoalCount is still 0,
    // it means the tasks reference goals that passed our filters incorrectly.
    // In this case, count the goals that have completed tasks.
    if (activeGoalCount === 0 && completedGoalIds.size > 0) {
        console.log(`⚠️ Warning: ${dateStr} has ${completedGoalIds.size} completed goals but activeGoalCount=0. Fixing...`);
        activeGoalCount = completedGoalIds.size;
    }

    return {
        activeGoalCount,
        completedGoalIds
    };
}

// Get weekly analytics (last 7 days)
router.get('/weekly', authenticateToken, async (req, res) => {
    try {
        console.log('🔍 Analytics /weekly called for user:', req.user.username, 'userId:', req.user._id);

        const days = [];

        // Get current date in UTC to avoid timezone issues
        const now = new Date();

        for (let i = 6; i >= 0; i--) {
            // Calculate date by subtracting days from today
            const date = new Date(now);
            date.setDate(now.getDate() - i);

            // Format date in YYYY-MM-DD using local date components
            // This matches how the frontend sends dates
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            // Create a date object at midnight local time for comparison
            const dateObj = new Date(year, date.getMonth(), date.getDate(), 0, 0, 0, 0);

            // Fetch tasks for this day
            const tasksOnDay = await Task.find({
                userId: req.user._id,
                date: dateStr
            });

            console.log(`📊 ${dateStr}: Found ${tasksOnDay.length} tasks`);

            const { activeGoalCount, completedGoalIds } = await countActiveGoalsForDate(
                req.user._id,
                dateStr,
                date,
                tasksOnDay
            );

            const completionPercent = activeGoalCount > 0
                ? Math.round((completedGoalIds.size / activeGoalCount) * 100)
                : 0;

            const dayData = {
                date: dateStr,
                completionPercent: Math.min(completionPercent, 100),
                totalGoals: activeGoalCount,
                completedGoals: completedGoalIds.size
            };

            console.log(`✅ ${dateStr}: ${dayData.completedGoals}/${dayData.totalGoals} = ${dayData.completionPercent}%`);
            days.push(dayData);
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
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];

        for (let day = 1; day <= daysInMonth; day++) {
            // Create date object at midnight local time
            const date = new Date(year, month, day, 0, 0, 0, 0);

            // Don't process future dates
            if (date > now) break;

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            const tasksOnDay = await Task.find({
                userId: req.user._id,
                date: dateStr
            });

            const { activeGoalCount, completedGoalIds } = await countActiveGoalsForDate(
                req.user._id,
                dateStr,
                date,
                tasksOnDay
            );

            const completionPercent = activeGoalCount > 0
                ? Math.round((completedGoalIds.size / activeGoalCount) * 100)
                : 0;

            days.push({
                date: dateStr,
                completionPercent: Math.min(completionPercent, 100),
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
        const now = new Date();

        for (let i = 11; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const year = monthStart.getFullYear();
            const month = monthStart.getMonth();
            const monthEnd = new Date(year, month + 1, 0);
            const daysInMonth = monthEnd.getDate();

            let totalCompletion = 0;
            let daysWithData = 0;

            for (let day = 1; day <= daysInMonth; day++) {
                // Create date object at midnight local time
                const date = new Date(year, month, day, 0, 0, 0, 0);
                if (date > now) break;

                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                const tasksOnDay = await Task.find({
                    userId: req.user._id,
                    date: dateStr
                });

                const { activeGoalCount, completedGoalIds } = await countActiveGoalsForDate(
                    req.user._id,
                    dateStr,
                    date,
                    tasksOnDay
                );

                if (activeGoalCount > 0) {
                    const dayPercent = (completedGoalIds.size / activeGoalCount) * 100;
                    totalCompletion += dayPercent;
                    daysWithData++;
                }
            }

            const avgCompletionPercent = daysWithData > 0
                ? Math.round(totalCompletion / daysWithData)
                : 0;

            months.push({
                month: month + 1,
                year,
                monthName: monthStart.toLocaleString('default', { month: 'short' }),
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