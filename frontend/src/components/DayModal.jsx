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
                            <div className="form-group">
                                <label>Goal</label>
                                <select value={selectedGoalId} onChange={(e) => setSelectedGoalId(e.target.value)} disabled={readOnly}>
                                    {goals.map(goal => (
                                        <option key={goal._id} value={goal._id}>{goal.title}</option>
                                    ))}
                                </select>
                            </div>

                            {selectedGoal && (
                                <>
                                    {selectedGoal.type === 'one-time' || selectedGoal.type === 'recurring' ? (
                                        <div className="form-group">
                                            <label className="flex items-center gap-sm" style={{ cursor: readOnly ? 'default' : 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={completed}
                                                    onChange={(e) => setCompleted(e.target.checked)}
                                                    disabled={readOnly}
                                                />
                                                <span>Completed</span>
                                            </label>
                                            {!readOnly && (
                                                <div className="flex gap-sm mt-sm">
                                                    <button
                                                        type="button"
                                                        onClick={() => setCompleted(true)}
                                                        className="btn btn-success btn-sm"
                                                        disabled={completed}
                                                    >
                                                        ✓ Mark Done
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setCompleted(false)}
                                                        className="btn btn-secondary btn-sm"
                                                        disabled={!completed}
                                                    >
                                                        ↻ Undo
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : selectedGoal.type === 'numeric' ? (
                                        <div className="form-group">
                                            <label>Value {selectedGoal.unit && `(${selectedGoal.unit})`}</label>
                                            <input
                                                type="number"
                                                value={value}
                                                onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                                                step="0.01"
                                                disabled={readOnly}
                                            />
                                            {selectedGoal.targetValue && (
                                                <div className="text-sm text-tertiary mt-sm">
                                                    Target: {selectedGoal.targetValue} {selectedGoal.unit}
                                                </div>
                                            )}
                                        </div>
                                    ) : selectedGoal.type === 'percentage' ? (
                                        <div className="form-group">
                                            <label>Progress (%)</label>
                                            <input
                                                type="number"
                                                value={percentage}
                                                onChange={(e) => setPercentage(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                                                min="0"
                                                max="100"
                                                disabled={readOnly}
                                            />
                                            <div className="progress-bar mt-sm">
                                                <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
                                            </div>
                                            {!readOnly && (
                                                <div className="flex gap-sm mt-sm">
                                                    <button
                                                        type="button"
                                                        onClick={() => setPercentage(Math.min(100, percentage + 10))}
                                                        className="btn btn-secondary btn-sm"
                                                        disabled={percentage >= 100}
                                                    >
                                                        +10%
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setPercentage(Math.min(100, percentage + 25))}
                                                        className="btn btn-secondary btn-sm"
                                                        disabled={percentage >= 100}
                                                    >
                                                        +25%
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setPercentage(100)}
                                                        className="btn btn-success btn-sm"
                                                        disabled={percentage === 100}
                                                    >
                                                        ✓ Complete
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setPercentage(0)}
                                                        className="btn btn-secondary btn-sm"
                                                        disabled={percentage === 0}
                                                    >
                                                        ↻ Reset
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : null}

                                    <div className="form-group">
                                        <label>Notes</label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder={readOnly ? "No notes" : "Add any notes or reflections..."}
                                            disabled={readOnly}
                                        />
                                    </div>
                                </>
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

                {goals.length > 0 && !readOnly && (
                    <div className="modal-footer">
                        <button onClick={onClose} className="btn btn-secondary">Cancel</button>
                        <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Progress'}
                        </button>
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
