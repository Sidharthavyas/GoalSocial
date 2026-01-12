import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns';
import DayModal from './DayModal';

const Calendar = ({ goals, tasks, onUpdate, readOnly = false }) => {
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

    const getDayProgress = (date) => {
        const dayTasks = getTasksForDate(date);
        if (dayTasks.length === 0) return 0;

        const totalProgress = dayTasks.reduce((sum, task) => {
            return sum + (task.percentage || (task.completed ? 100 : 0));
        }, 0);

        return Math.round(totalProgress / dayTasks.length);
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
                        const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                        const isFuture = day > new Date();
                        const isPerfectDay = progress === 100 && dayTasks.length > 0;
                        const isMissedDay = dayTasks.length > 0 && progress === 0;

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
                                        : 'var(--bg-tertiary)',
                                    minHeight: window.innerWidth < 768 ? '60px' : 'auto'
                                }}
                                title={dayTasks.length > 0 ? `${progress}% complete • ${dayTasks.length} task${dayTasks.length > 1 ? 's' : ''}` : ''}
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
                                    </div>
                                )}

                                {dayTasks.length > 0 && window.innerWidth >= 768 && (
                                    <div className="meta" style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                                        {dayTasks.length} task{dayTasks.length > 1 ? 's' : ''}
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
                    onClose={() => setSelectedDate(null)}
                    onUpdate={onUpdate}
                    readOnly={readOnly}
                />
            )}
        </>
    );
};

export default Calendar;
