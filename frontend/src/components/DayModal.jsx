import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../utils/api';
import Comments from './Comments';
import Reactions from './Reactions';

const DayModal = ({ date, goals, tasks, onClose, onUpdate, readOnly = false }) => {
    const [selectedGoalId, setSelectedGoalId] = useState('');
    const [completed, setCompleted] = useState(false);
    const [value, setValue] = useState(0);
    const [percentage, setPercentage] = useState(0);
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

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
            await api.post('/tasks', {
                goalId: selectedGoalId,
                date: date.toISOString(),
                completed,
                value,
                percentage,
                notes
            });

            onUpdate();
            onClose();
        } catch (error) {
            console.error('Failed to save task:', error);
            alert('Failed to save progress');
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
