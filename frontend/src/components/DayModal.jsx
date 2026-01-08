import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../utils/api';
import { triggerCelebration } from '../utils/celebrations';
import { addToQueue } from '../utils/offlineQueue';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import toast from 'react-hot-toast';
import Comments from './Comments';
import Reactions from './Reactions';

const DayModal = ({ date, goals, tasks, onClose, onUpdate, readOnly = false }) => {
    const [selectedGoalId, setSelectedGoalId] = useState('');
    const [completed, setCompleted] = useState(false);
    const [value, setValue] = useState(0);
    const [percentage, setPercentage] = useState(0);
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const isOnline = useOnlineStatus();

    useEffect(() => {
        if (tasks.length > 0 && goals.length > 0) {
            const task = tasks[0];
            setSelectedGoalId(task.goalId._id || task.goalId);
            setCompleted(task.completed);
            setValue(task.value);
            setPercentage(task.percentage);
            setNotes(task.notes || '');
        } else if (goals.length > 0) {
            setSelectedGoalId(goals[0]._id);
        }
    }, [tasks, goals]);

    const handleSave = async () => {
        if (!selectedGoalId) {
            alert('Please select a goal');
            return;
        }

        setSaving(true);

        try {
            // Format date as YYYY-MM-DD in local timezone
            const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const dateString = localDate.toISOString().split('T')[0];

            const taskData = {
                goalId: selectedGoalId,
                date: dateString,
                completed,
                value,
                percentage,
                notes
            };

            // If offline, add to queue
            if (!isOnline) {
                addToQueue('CREATE_TASK', taskData);
                alert('Saved offline. Will sync when online.');
                onUpdate();
                onClose();
                return;
            }

            await api.post('/tasks', taskData);

            // Trigger celebration for 100% completion
            if (completed || percentage === 100) {
                triggerCelebration('completion');
            }

            onUpdate();
            onClose();
        } catch (error) {
            console.error('Failed to save task:', error);
            alert('Failed to save progress');
        } finally {
            setSaving(false);
        }
    };

    const handleBulkComplete = async () => {
        if (!window.confirm('Complete all goals for today?')) {
            return;
        }

        setSaving(true);

        try {
            // Format date as YYYY-MM-DD in local timezone
            const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const dateString = localDate.toISOString().split('T')[0];

            const goalIds = goals.map(g => g._id);

            // If offline, add to queue
            if (!isOnline) {
                addToQueue('BULK_COMPLETE', { date: dateString, goalIds });
                alert('Saved offline. Will sync when online.');
                onUpdate();
                onClose();
                return;
            }

            await api.post('/tasks/bulk-complete', {
                date: dateString,
                goalIds
            });

            // Trigger celebration
            triggerCelebration('completion');
            toast.success('All goals completed! 🎉');

            onUpdate();
            onClose();
        } catch (error) {
            console.error('Failed to bulk complete:', error);
            alert('Failed to complete all goals');
        } finally {
            setSaving(false);
        }
    };

    const selectedGoal = goals.find(g => g._id === selectedGoalId);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2 style={{ margin: 0 }}>{format(date, 'MMMM d, yyyy')}</h2>
                        <p className="text-secondary text-sm" style={{ margin: 0 }}>{format(date, 'EEEE')}</p>
                    </div>
                    <button onClick={onClose} className="btn btn-secondary btn-sm">✕</button>
                </div>

                <div className="modal-body">
                    {/* Bulk Complete Button */}
                    {goals.length > 0 && !readOnly && (
                        <div className="mb-md">
                            <button
                                onClick={handleBulkComplete}
                                className="btn btn-success"
                                style={{ width: '100%' }}
                                disabled={saving}
                            >
                                ✓ Complete All Today
                            </button>
                        </div>
                    )}

                    {goals.length === 0 ? (
                        <p className="text-secondary">No active goals. Create a goal first!</p>
                    ) : (
                        <>
                            {/* Goal Completion Checkboxes */}
                            <div className="form-group">
                                <label style={{ marginBottom: 'var(--space-sm)', fontWeight: 600 }}>Today's Goals</label>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 'var(--space-sm)',
                                    maxHeight: window.innerWidth < 768 ? '300px' : '400px',
                                    overflowY: 'auto',
                                    padding: 'var(--space-sm)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--border-radius-md)'
                                }}>
                                    {goals.map(goal => {
                                        const goalTask = tasks.find(t => (t.goalId._id || t.goalId) === goal._id);
                                        const isCompleted = goalTask?.completed || false;

                                        return (
                                            <label
                                                key={goal._id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 'var(--space-sm)',
                                                    cursor: readOnly ? 'default' : 'pointer',
                                                    padding: 'var(--space-sm)',
                                                    borderRadius: 'var(--border-radius-sm)',
                                                    background: isCompleted ? 'rgba(106, 191, 123, 0.1)' : 'var(--bg-tertiary)',
                                                    border: '1px solid ' + (isCompleted ? 'var(--success)' : 'transparent'),
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isCompleted}
                                                    onChange={async (e) => {
                                                        if (readOnly) return;

                                                        const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                                                        const dateString = localDate.toISOString().split('T')[0];

                                                        try {
                                                            await api.post('/tasks', {
                                                                goalId: goal._id,
                                                                date: dateString,
                                                                completed: e.target.checked,
                                                                value: 0,
                                                                percentage: e.target.checked ? 100 : 0,
                                                                notes: ''
                                                            });
                                                            onUpdate();
                                                        } catch (error) {
                                                            console.error('Failed to update goal:', error);
                                                            alert('Failed to update goal');
                                                        }
                                                    }}
                                                    disabled={readOnly}
                                                    style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        cursor: readOnly ? 'default' : 'pointer',
                                                        accentColor: 'var(--success)',
                                                        flexShrink: 0
                                                    }}
                                                />
                                                <span style={{
                                                    flex: 1,
                                                    textDecoration: isCompleted ? 'line-through' : 'none',
                                                    opacity: isCompleted ? 0.7 : 1,
                                                    fontSize: window.innerWidth < 768 ? '0.9rem' : '1rem'
                                                }}>
                                                    {goal.title}
                                                </span>
                                                {isCompleted && (
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        color: 'var(--success)',
                                                        fontWeight: 600,
                                                        flexShrink: 0
                                                    }}>
                                                        ✓
                                                    </span>
                                                )}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Notes Section */}
                            <div className="form-group">
                                <label>Notes for Today</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder={readOnly ? "No notes" : "Add any notes or reflections for today..."}
                                    disabled={readOnly}
                                    rows={3}
                                />
                            </div>
                            )}

                            {/* Show comments and reactions for existing tasks */}
                            {tasks.length > 0 && (
                                <div className="mt-lg">
                                    <h4>Comments & Reactions</h4>
                                    <Comments targetType="task" targetId={tasks[0]._id} />
                                    <Reactions targetType="task" targetId={tasks[0]._id} />
                                </div>
                            )}
                        </>
                    )}
                </div>

                {!readOnly && (
                    <div className="modal-footer">
                        <button onClick={onClose} className="btn btn-primary" style={{ width: '100%' }}>Close</button>
                    </div>
                )}
                {readOnly && (
                    <div className="modal-footer">
                        <button onClick={onClose} className="btn btn-primary">Close</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DayModal;
