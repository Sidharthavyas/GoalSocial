/**
 * Streak calculation utilities - IMPROVED ACCURACY
 */

// Calculate current streak for a user
export const calculateStreak = (tasks) => {
    if (!tasks || tasks.length === 0) return 0;

    // Group tasks by date and check if any goal was completed
    const dateMap = new Map();
    tasks.forEach(task => {
        const dateStr = task.date.split('T')[0]; // Normalize date
        if (!dateMap.has(dateStr)) {
            dateMap.set(dateStr, []);
        }
        dateMap.get(dateStr).push(task);
    });

    // Get sorted unique dates with at least one completion
    const completedDates = Array.from(dateMap.entries())
        .filter(([date, dayTasks]) =>
            dayTasks.some(t => t.completed || t.percentage === 100)
        )
        .map(([date]) => new Date(date))
        .sort((a, b) => b - a); // Sort descending (newest first)

    if (completedDates.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const mostRecentCompletion = new Date(completedDates[0]);
    mostRecentCompletion.setHours(0, 0, 0, 0);

    // Streak is broken if last completion was more than 1 day ago
    if (mostRecentCompletion < yesterday) {
        return 0;
    }

    // Count consecutive days backwards from most recent
    let streak = 1;
    let currentDate = new Date(mostRecentCompletion);

    for (let i = 1; i < completedDates.length; i++) {
        const prevDate = new Date(completedDates[i]);
        prevDate.setHours(0, 0, 0, 0);

        const expectedDate = new Date(currentDate);
        expectedDate.setDate(expectedDate.getDate() - 1);

        // Check if dates are consecutive
        if (prevDate.getTime() === expectedDate.getTime()) {
            streak++;
            currentDate = prevDate;
        } else {
            break; // Streak broken
        }
    }

    return streak;
};

// Get daily summary
export const getDailySummary = (tasks) => {
    const completed = tasks.filter(t => t.completed || t.percentage === 100).length;
    const total = tasks.length;
    const completion = total > 0 ? Math.round((completed / total) * 100) : 0;
    const missed = tasks.filter(t => !t.completed && t.percentage === 0).length;

    return {
        completion,
        goalsCompleted: completed,
        goalsMissed: missed,
        total,
        streakActive: completed > 0
    };
};
