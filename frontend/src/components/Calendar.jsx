import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns';
import DayModal from './DayModal';

const Calendar = ({ goals, tasks, challenges = [], challengeCompletions = [], onUpdate, readOnly = false }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const getTasksForDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        return tasks.filter(task => task.date === dateString || task.date.startsWith(dateString));
    };

    const getChallengeCompletionsForDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        return challengeCompletions.filter(c => c.date === dateString || c.date.startsWith(dateString));
    };

    const getDayProgress = (date) => {
        // Normalize date to start of day for comparison
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);

        // Find all goals that were active on this date
        const activeGoalsForDate = goals.filter(goal => {
            const startDate = new Date(goal.startDate);
            startDate.setHours(0, 0, 0, 0);

            // Not active if goal starts in future
            if (startDate > checkDate) return false;

            // Check end date if it exists
            if (goal.endDate) {
                const endDate = new Date(goal.endDate);
                endDate.setHours(23, 59, 59, 999);
                if (endDate < checkDate) return false;
            }

            return true;
        });

        if (activeGoalsForDate.length === 0) return 0;

        const dayTasks = getTasksForDate(date);

        // Calculate total progress across ALL active goals
        const totalProgress = activeGoalsForDate.reduce((sum, goal) => {
            // Find task for this specific goal on this date
            const task = dayTasks.find(t => (t.goalId._id || t.goalId) === goal._id);

            if (task) {
                return sum + (task.percentage || (task.completed ? 100 : 0));
            }
            return sum;
        }, 0);

        return Math.round(totalProgress / activeGoalsForDate.length);
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    return (
        <>
            <div className="calendar">
                <div className="calendar-header" style={{ gap: 'var(--space-sm)' }}>
                    <button onClick={prevMonth} className="btn btn-secondary btn-sm" aria-label="Previous month">‹</button>
                    <h3 style={{ margin: 0, flex: 1, textAlign: 'center' }}>{format(currentDate, 'MMMM yyyy')}</h3>
                    <button onClick={nextMonth} className="btn btn-secondary btn-sm" aria-label="Next month">›</button>
                </div>

                <div className="calendar-grid">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="calendar-day-name">{day}</div>
                    ))}

                    {days.map(day => {
                        const progress = getDayProgress(day);
                        const dayTasks = getTasksForDate(day);
                        const dayChallengeCompletions = getChallengeCompletionsForDate(day);
                        const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                        const isFuture = day > new Date();
                        const isPerfectDay = progress === 100 && dayTasks.length > 0;
                        const isMissedDay = dayTasks.length > 0 && progress === 0;
                        const hasChallengeActivity = dayChallengeCompletions.length > 0;

                        // Calculate streak (simple version - 3+ consecutive days)
                        const yesterday = new Date(day);
                        yesterday.setDate(yesterday.getDate() - 1);
                        const dayBeforeYesterday = new Date(day);
                        dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);

                        const yesterdayProgress = getDayProgress(yesterday);
                        const dayBeforeProgress = getDayProgress(dayBeforeYesterday);
                        const isStreakDay = progress > 0 && yesterdayProgress > 0 && dayBeforeProgress > 0 && !isFuture;

                        return (
                            <div
                                key={day.toString()}
                                className={`calendar-day ${isToday(day) ? 'today' : ''} ${progress > 0 ? 'has-progress' : ''}`}
                                onClick={() => isCurrentMonth && !isFuture && setSelectedDate(day)}
                                style={{
                                    opacity: isFuture ? 0.3 : (isCurrentMonth ? 1 : 0.4),
                                    cursor: isCurrentMonth && !isFuture ? 'pointer' : 'default',
                                    position: 'relative',
                                    background: progress > 0
                                        ? `linear-gradient(135deg, rgba(99, 102, 241, ${progress / 300}) 0%, rgba(139, 92, 246, ${progress / 250}) 100%)`
                                        : hasChallengeActivity && !isFuture
                                            ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(244, 114, 182, 0.1) 100%)'
                                            : 'var(--bg-tertiary)',
                                    minHeight: window.innerWidth < 768 ? '60px' : 'auto',
                                    borderLeft: hasChallengeActivity && !isFuture ? '3px solid var(--pink, #ec4899)' : 'none'
                                }}
                                title={`${dayTasks.length > 0 ? `${progress}% complete • ${dayTasks.length} task${dayTasks.length > 1 ? 's' : ''}` : ''}${hasChallengeActivity ? ` • ${dayChallengeCompletions.length} challenge${dayChallengeCompletions.length > 1 ? 's' : ''}` : ''}`}
                            >
                                <div className="date" style={{
                                    fontSize: window.innerWidth < 768 ? '0.875rem' : '0.875rem',
                                    fontWeight: isToday(day) ? 700 : 400
                                }}>
                                    {format(day, 'd')}
                                </div>

                                {/* Completion Percentage */}
                                {!isFuture && progress > 0 && (
                                    <div className="completion-percent" style={{
                                        fontSize: window.innerWidth < 768 ? '0.7rem' : '0.75rem',
                                        fontWeight: 600,
                                        color: progress === 100 ? 'var(--success)' : 'var(--text-primary)',
                                        marginTop: '2px'
                                    }}>
                                        {progress}%
                                    </div>
                                )}

                                {/* Status Icons */}
                                {!isFuture && (
                                    <div style={{ fontSize: window.innerWidth < 768 ? '0.75rem' : '0.5rem', marginTop: '2px' }}>
                                        {isStreakDay && '🔥'}
                                        {isPerfectDay && '⭐'}
                                        {isMissedDay && '⚠️'}
                                        {hasChallengeActivity && '🏆'}
                                    </div>
                                )}

                                {(dayTasks.length > 0 || hasChallengeActivity) && window.innerWidth >= 768 && (
                                    <div className="meta" style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                                        {dayTasks.length > 0 && `${dayTasks.length} task${dayTasks.length > 1 ? 's' : ''}`}
                                        {dayTasks.length > 0 && hasChallengeActivity && ' • '}
                                        {hasChallengeActivity && `${dayChallengeCompletions.length} 🏆`}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedDate && (
                <DayModal
                    date={selectedDate}
                    goals={goals}
                    tasks={getTasksForDate(selectedDate)}
                    challenges={challenges}
                    challengeCompletions={getChallengeCompletionsForDate(selectedDate)}
                    onClose={() => setSelectedDate(null)}
                    onUpdate={onUpdate}
                    readOnly={readOnly}
                />
            )}
        </>
    );
};

export default Calendar;

