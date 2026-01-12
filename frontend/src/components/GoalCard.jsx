import { motion, useMotionValue, useTransform } from 'framer-motion';
import { hapticImpactMedium, hapticSuccess } from '../utils/haptics';
import { showConfirm } from '../utils/modal';

const GoalCard = ({ goal, onEdit, onDelete, readOnly = false }) => {
    const x = useMotionValue(0);
    const background_opacity = useTransform(x, [-100, 0, 100], [1, 0, 1]);
    const background_color = useTransform(x, [-100, 0, 100], ['var(--error)', 'transparent', 'var(--success)']);

    const handleDragEnd = async (event, info) => {
        if (readOnly) return;

        if (info.offset.x > 100) {
            // Swiped Right - Complete
            hapticSuccess();
            onEdit({ ...goal, completed: !goal.completed });
        } else if (info.offset.x < -100) {
            // Swiped Left - Delete
            hapticImpactMedium();
            const confirmed = await showConfirm(
                'Are you sure you want to delete this goal?',
                'Delete Goal',
                'warning'
            );
            if (confirmed) {
                onDelete(goal._id);
            }
        }
    };

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
        <div style={{ position: 'relative', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
            {/* Background Actions */}
            <motion.div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: background_color,
                    opacity: background_opacity,
                    zIndex: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px',
                    borderRadius: 'var(--border-radius-lg)'
                }}
            >
                <span style={{ color: 'white', fontWeight: 'bold' }}>Delete 🗑️</span>
                <span style={{ color: 'white', fontWeight: 'bold' }}>{goal.completed ? 'Undo ↩️' : 'Complete ✅'}</span>
            </motion.div>

            {/* Foreground Card */}
            <motion.div
                className="card"
                drag={readOnly ? false : "x"}
                dragConstraints={{ left: 0, right: 0 }}
                style={{
                    x,
                    background: 'var(--bg-card)', // Ensure solid background
                    position: 'relative',
                    zIndex: 1,
                    opacity: goal.completed ? 0.7 : 1,
                    cursor: readOnly ? 'default' : 'grab'
                }}
                onDragEnd={handleDragEnd}
                whileTap={{ cursor: 'grabbing' }}
            >
                {/* Header with Type Badge and Actions */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                    flexWrap: 'wrap',
                    gap: '8px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span
                            className="badge"
                            style={{
                                background: `${getGoalTypeColor(goal.type)}20`,
                                color: getGoalTypeColor(goal.type),
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 600
                            }}
                        >
                            {getGoalTypeLabel(goal.type)}
                        </span>

                        {/* Priority Badge */}
                        {goal.priority && (
                            <span
                                className="badge"
                                style={{
                                    background: goal.priority === 'high' ? 'rgba(239, 68, 68, 0.15)' :
                                        goal.priority === 'medium' ? 'rgba(234, 179, 8, 0.15)' :
                                            'rgba(59, 130, 246, 0.15)',
                                    color: goal.priority === 'high' ? 'var(--error)' :
                                        goal.priority === 'medium' ? 'var(--warning)' :
                                            'var(--info)',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600
                                }}
                            >
                                {goal.priority === 'high' ? '🔥 High' :
                                    goal.priority === 'medium' ? '⚡ Med' :
                                        '🧊 Low'}
                            </span>
                        )}

                        {goal.completed && (
                            <span
                                style={{
                                    background: 'rgba(106, 191, 123, 0.15)',
                                    color: 'var(--success)',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
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
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => onEdit(goal)}
                                className="btn btn-secondary btn-sm"
                                style={{ minWidth: '44px', minHeight: '44px' }}
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => onDelete(goal._id)}
                                className="btn btn-danger btn-sm"
                                style={{ minWidth: '44px', minHeight: '44px' }}
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>

                {/* Goal Title */}
                <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    textDecoration: goal.completed ? 'line-through' : 'none'
                }}>
                    {goal.title}
                </h3>

                {/* Goal Description */}
                {goal.description && (
                    <p style={{
                        margin: '0 0 12px 0',
                        color: 'var(--text-secondary)',
                        fontSize: '0.875rem',
                        lineHeight: 1.5
                    }}>
                        {goal.description}
                    </p>
                )}

                {/* Goal Details */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '12px',
                    marginTop: '12px'
                }}>
                    {goal.type === 'numeric' && goal.targetValue && (
                        <div style={{
                            padding: '8px',
                            background: 'var(--bg-tertiary)',
                            borderRadius: '8px'
                        }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                                Target
                            </div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                {goal.targetValue} {goal.unit}
                            </div>
                        </div>
                    )}

                    {goal.frequency && (
                        <div style={{
                            padding: '8px',
                            background: 'var(--bg-tertiary)',
                            borderRadius: '8px'
                        }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                                Frequency
                            </div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'capitalize' }}>
                                {goal.frequency}
                            </div>
                        </div>
                    )}

                    {goal.startDate && (
                        <div style={{
                            padding: '8px',
                            background: 'var(--bg-tertiary)',
                            borderRadius: '8px'
                        }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                                Start Date
                            </div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                {new Date(goal.startDate).toLocaleDateString()}
                            </div>
                        </div>
                    )}

                    {goal.endDate && (
                        <div style={{
                            padding: '8px',
                            background: 'var(--bg-tertiary)',
                            borderRadius: '8px'
                        }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                                End Date
                            </div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                {new Date(goal.endDate).toLocaleDateString()}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default GoalCard;