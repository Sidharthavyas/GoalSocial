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

    // Custom checkbox styles that WILL be visible
    const checkboxContainerStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        minWidth: '28px',
        minHeight: '28px',
        borderRadius: '6px',
        border: goal.completed 
            ? '2px solid var(--success, #22c55e)' 
            : '2px solid var(--text-tertiary, #6b7280)',
        backgroundColor: goal.completed 
            ? 'var(--success, #22c55e)' 
            : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        flexShrink: 0
    };

    const checkmarkStyle = {
        color: 'white',
        fontSize: '16px',
        fontWeight: 'bold',
        lineHeight: 1
    };

    const handleCheckboxClick = (e) => {
        e.stopPropagation();
        if (onToggleComplete) {
            onToggleComplete(goal._id, goal.completed);
        }
    };

    return (
        <div 
            className="card" 
            style={{
                opacity: goal.completed ? 0.8 : 1,
                position: 'relative',
                transition: 'opacity 0.2s ease'
            }}
        >
            {/* Main Content Row */}
            <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                marginBottom: '12px'
            }}>
                {/* CHECKBOX - Always visible when not readOnly */}
                {!readOnly && onToggleComplete && (
                    <div
                        onClick={handleCheckboxClick}
                        style={checkboxContainerStyle}
                        role="checkbox"
                        aria-checked={goal.completed}
                        aria-label={goal.completed ? "Mark as incomplete" : "Mark as complete"}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleCheckboxClick(e);
                            }
                        }}
                    >
                        {goal.completed && (
                            <span style={checkmarkStyle}>✓</span>
                        )}
                    </div>
                )}

                {/* Goal Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Title */}
                    <h3 style={{ 
                        margin: '0 0 8px 0',
                        textDecoration: goal.completed ? 'line-through' : 'none',
                        color: goal.completed ? 'var(--text-tertiary)' : 'var(--text-primary)',
                        fontSize: '1.1rem',
                        lineHeight: 1.3,
                        wordBreak: 'break-word'
                    }}>
                        {goal.title}
                    </h3>

                    {/* Badges Row */}
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        marginBottom: '8px'
                    }}>
                        <span
                            className="badge"
                            style={{
                                background: `${getGoalTypeColor(goal.type)}20`,
                                color: getGoalTypeColor(goal.type),
                                fontSize: '0.75rem',
                                padding: '4px 8px'
                            }}
                        >
                            {getGoalTypeLabel(goal.type)}
                        </span>
                        
                        {goal.completed && (
                            <span
                                className="badge"
                                style={{
                                    background: 'rgba(34, 197, 94, 0.15)',
                                    color: '#22c55e',
                                    fontSize: '0.75rem',
                                    padding: '4px 8px'
                                }}
                            >
                                ✓ Done
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    {goal.description && (
                        <p style={{
                            margin: '0 0 8px 0',
                            color: 'var(--text-secondary)',
                            fontSize: '0.875rem',
                            lineHeight: 1.5
                        }}>
                            {goal.description}
                        </p>
                    )}

                    {/* Target Info */}
                    {(goal.type === 'numeric' || goal.type === 'percentage') && goal.targetValue && (
                        <div style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-tertiary)'
                        }}>
                            🎯 Target: {goal.targetValue} {goal.unit}
                        </div>
                    )}

                    {/* Deadline */}
                    {goal.endDate && (
                        <div style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-tertiary)',
                            marginTop: '4px'
                        }}>
                            📅 {new Date(goal.endDate).toLocaleDateString()}
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            {!readOnly && (
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-color, rgba(255,255,255,0.1))'
                }}>
                    <button 
                        onClick={() => onEdit(goal)} 
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1 }}
                    >
                        ✏️ Edit
                    </button>
                    <button 
                        onClick={() => onDelete(goal._id)} 
                        className="btn btn-danger btn-sm"
                        style={{ flex: 1 }}
                    >
                        🗑️ Delete
                    </button>
                </div>
            )}
        </div>
    );
};

export default GoalCard;