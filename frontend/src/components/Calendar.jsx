import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns';
import DayModal from './DayModal';

const Calendar = ({ goals, tasks, onUpdate }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const getTasksForDate = (date) => {
        return tasks.filter(task => {
            const taskDate = new Date(task.date);
            taskDate.setHours(0, 0, 0, 0);
            const compareDate = new Date(date);
            compareDate.setHours(0, 0, 0, 0);
            return taskDate.getTime() === compareDate.getTime();
        });
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
                <div className="calendar-header">
                    <button onClick={prevMonth} className="btn btn-secondary btn-sm">‹</button>
                    <h3 style={{ margin: 0 }}>{format(currentDate, 'MMMM yyyy')}</h3>
                    <button onClick={nextMonth} className="btn btn-secondary btn-sm">›</button>
                </div>

                <div className="calendar-grid">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="calendar-day-name">{day}</div>
                    ))}

                    {days.map(day => {
                        const progress = getDayProgress(day);
                        const dayTasks = getTasksForDate(day);
                        const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                        return (
                            <div
                                key={day.toString()}
                                className={`calendar-day ${isToday(day) ? 'today' : ''} ${progress > 0 ? 'has-progress' : ''}`}
                                onClick={() => isCurrentMonth && setSelectedDate(day)}
                                style={{
                                    opacity: isCurrentMonth ? 1 : 0.4,
                                    cursor: isCurrentMonth ? 'pointer' : 'default',
                                    position: 'relative'
                                }}
                            >
                                <div style={{ fontSize: '0.875rem', fontWeight: isToday(day) ? 700 : 400 }}>
                                    {format(day, 'd')}
                                </div>
                                {dayTasks.length > 0 && (
                                    <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                                        {dayTasks.length} task{dayTasks.length > 1 ? 's' : ''}
                                    </div>
                                )}
                                {progress > 0 && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            height: '4px',
                                            background: `linear-gradient(90deg, var(--accent-primary) ${progress}%, var(--bg-tertiary) ${progress}%)`
                                        }}
                                    />
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
                />
            )}
        </>
    );
};

export default Calendar;
