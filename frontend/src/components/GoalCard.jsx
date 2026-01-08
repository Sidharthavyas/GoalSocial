import React from 'react';

const GoalCard = ({ goal, onEdit, onDelete, readOnly = false }) => {
    const getGoalTypeColor = (type) => {
        const colors = {
            'one-time': 'var(--info)',
            'recurring': 'var(--success)',
            'series': 'var(--warning)',
            'numeric': 'var(--accent-primary)',
            'percentage': 'var(--accent-secondary)'
        };
        return colors[type] || 'var(--text-tertiary)';
    };

    const getGoalTypeLabel = (type) => {
        const labels = {
            'one-time': 'One-time',
            'recurring': 'Recurring',
            'series': 'Series',
            'numeric': 'Numeric',
            'percentage': 'Percentage'
        };
        return labels[type] || type;
    };

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-md">
                <div className="flex items-center gap-md">
                    {!readOnly && (
                        <button
                            onClick={() => onEdit && onEdit({ ...goal, completed: !goal.completed })}
                            className="goal-checkbox"
                            style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '6px',
                                border: `2px solid ${goal.completed ? 'var(--success)' : 'var(--border-color)'}`,
                                background: goal.completed ? 'var(--success)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                flexShrink: 0,
                                position: 'relative'
                            }}
                            title={goal.completed ? 'Mark as incomplete' : 'Mark as complete'}
                            aria-label={goal.completed ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                            {goal.completed && (
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 14 14"
                                    fill="none"
                                    style={{ animation: 'checkmark 0.3s ease-in-out' }}
                                >
                                    <path
                                        d="M2 7L5.5 10.5L12 3"
                                        stroke="#0a0a0a"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            )}
                        </button>
                    )}
                    <span
                        className="badge"
                        style={{
                            background: `${getGoalTypeColor(goal.type)}20`,
                            color: getGoalTypeColor(goal.type)
                        }}
                    >
                        {getGoalTypeLabel(goal.type)}
                    </span>
                </div>
                {!readOnly && (
                    <div className="flex gap-sm">
                        <button onClick={() => onEdit(goal)} className="btn btn-secondary btn-sm">
                            Edit
                        </button>
                        <button onClick={() => onDelete(goal._id)} className="btn btn-danger btn-sm">
                            Delete
                        </button>
                    </div>
                )}
            </div>

            <h3 style={{ marginBottom: 'var(--space-sm)' }}>{goal.title}</h3>

            {goal.description && (
                <p className="text-secondary text-sm mb-md">{goal.description}</p>
            )}

            {(goal.type === 'numeric' || goal.type === 'percentage') && goal.targetValue && (
                <div className="text-sm text-tertiary">
                    Target: {goal.targetValue} {goal.unit}
                </div>
            )}

            {goal.endDate && (
                <div className="text-sm text-tertiary mt-sm">
                    Deadline: {new Date(goal.endDate).toLocaleDateString()}
                </div>
            )}
        </div>
    );
};

export default GoalCard;
