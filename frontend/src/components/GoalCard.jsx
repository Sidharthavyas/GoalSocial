import React from 'react';

const GoalCard = ({ goal, onEdit, onDelete, readOnly = false, onToggleComplete }) => {
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
        <div className="card" style={{
            opacity: goal.completed ? 0.7 : 1
        }}>
            <div className="flex items-center justify-between mb-md">
                <div className="flex items-center gap-md">
                    {!readOnly && onToggleComplete && (
                        <input
                            type="checkbox"
                            checked={goal.completed || false}
                            onChange={() => onToggleComplete(goal._id, goal.completed)}
                            style={{
                                width: '20px',
                                height: '20px',
                                cursor: 'pointer',
                                accentColor: 'var(--success)'
                            }}
                            title={goal.completed ? "Mark as incomplete" : "Mark as complete"}
                        />
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
                    {goal.completed && (
                        <span
                            className="badge badge-success"
                            style={{
                                background: 'rgba(106, 191, 123, 0.15)',
                                color: 'var(--success)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            ✓ Completed
                        </span>
                    )}
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

            <h3 style={{ marginBottom: 'var(--space-sm)', textDecoration: goal.completed ? 'line-through' : 'none' }}>{goal.title}</h3>

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
