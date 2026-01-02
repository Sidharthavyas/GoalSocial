import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const GoalForm = ({ goal, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('one-time');
    const [targetValue, setTargetValue] = useState('');
    const [unit, setUnit] = useState('');
    const [endDate, setEndDate] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (goal) {
            setTitle(goal.title);
            setDescription(goal.description || '');
            setType(goal.type);
            setTargetValue(goal.targetValue || '');
            setUnit(goal.unit || '');
            setEndDate(goal.endDate ? goal.endDate.split('T')[0] : '');
        }
    }, [goal]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const goalData = {
            title,
            description,
            type,
            targetValue: targetValue ? parseFloat(targetValue) : null,
            unit,
            endDate: endDate || null
        };

        try {
            if (goal) {
                await api.put(`/goals/${goal._id}`, goalData);
            } else {
                await api.post('/goals', goalData);
            }
            onClose();
        } catch (error) {
            console.error('Failed to save goal:', error);
            alert('Failed to save goal');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{ margin: 0 }}>{goal ? 'Edit Goal' : 'Create Goal'}</h2>
                    <button onClick={onClose} className="btn btn-secondary btn-sm">✕</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Title *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="E.g., Read 30 books this year"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add more details about your goal..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Goal Type *</label>
                            <select value={type} onChange={(e) => setType(e.target.value)} required>
                                <option value="one-time">One-time Goal</option>
                                <option value="recurring">Recurring Habit</option>
                                <option value="series">Series / Chained Tasks</option>
                                <option value="numeric">Numeric Goal (km, hours, etc.)</option>
                                <option value="percentage">Percentage-based</option>
                            </select>
                            <div className="text-sm text-tertiary mt-sm">
                                {type === 'one-time' && 'Complete once and mark as done'}
                                {type === 'recurring' && 'Track daily or regularly'}
                                {type === 'series' && 'Multiple related tasks to complete'}
                                {type === 'numeric' && 'Track numbers like kilometers, hours, or count'}
                                {type === 'percentage' && 'Track progress from 0-100%'}
                            </div>
                        </div>

                        {(type === 'numeric' || type === 'percentage') && (
                            <div className="grid grid-2">
                                {type === 'numeric' && (
                                    <>
                                        <div className="form-group">
                                            <label>Target Value</label>
                                            <input
                                                type="number"
                                                value={targetValue}
                                                onChange={(e) => setTargetValue(e.target.value)}
                                                placeholder="100"
                                                step="0.01"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Unit</label>
                                            <input
                                                type="text"
                                                value={unit}
                                                onChange={(e) => setUnit(e.target.value)}
                                                placeholder="km, hours, pages..."
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        <div className="form-group">
                            <label>End Date (Optional)</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : (goal ? 'Update Goal' : 'Create Goal')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GoalForm;
