/**
 * Streak calculation utilities
 */

// Calculate current streak for a user
export const calculateStreak = (tasks) => {
    if (!tasks || tasks.length === 0) return 0;

    // Sort tasks by date descending
    const sortedTasks = tasks
        .filter(t => t.completed || t.percentage > 0)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (sortedTasks.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Count backwards from today
    for (let i = 0; i < 365; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const hasProgressToday = sortedTasks.some(t =>
            t.date.startsWith(dateStr) && (t.completed || t.percentage > 0)
        );

        if (hasProgressToday) {
            streak++;
        } else if (i > 0) {
            // Allow one day gap for today
            break;
        }

        // Move to previous day
        currentDate.setDate(currentDate.getDate() - 1);
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
