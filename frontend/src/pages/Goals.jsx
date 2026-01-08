import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import GoalForm from '../components/GoalForm';
import GoalCard from '../components/GoalCard';
import { useSocket } from '../context/SocketContext';

const Goals = () => {
    const [goals, setGoals] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedGoals, setSelectedGoals] = useState([]);
    const { events } = useSocket();

    useEffect(() => {
        loadGoals();
    }, []);

    useEffect(() => {
        const latestEvent = events[events.length - 1];
        if (latestEvent && ['goal.created', 'goal.updated', 'goal.deleted'].includes(latestEvent.type)) {
            loadGoals();
        }
    }, [events]);

    const loadGoals = async () => {
        try {
            const response = await api.get('/goals');
            setGoals(response.data.goals || []);
        } catch (error) {
            console.error('Failed to load goals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (goal) => {
        setEditingGoal(goal);
        setShowForm(true);
    };

    const handleDelete = async (goalId) => {
        if (!confirm('Are you sure you want to delete this goal?')) return;

        try {
            await api.delete(`/goals/${goalId}`);
            loadGoals();
        } catch (error) {
            console.error('Failed to delete goal:', error);
            alert('Failed to delete goal');
        }
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingGoal(null);
        loadGoals();
    };

    const handleToggleSelect = (goalId) => {
        setSelectedGoals(prev =>
            prev.includes(goalId)
                ? prev.filter(id => id !== goalId)
                : [...prev, goalId]
        );
    };

    const handleSelectAll = () => {
        setSelectedGoals(selectedGoals.length === goals.length ? [] : goals.map(g => g._id));
    };

    const handleBulkComplete = async () => {
        if (selectedGoals.length === 0) return;
        try {
            await Promise.all(selectedGoals.map(id => api.put(`/goals/${id}`, { completed: true })));
            setSelectedGoals([]);
            loadGoals();
        } catch (error) {
            console.error('Failed to mark goals complete:', error);
            alert('Failed to mark goals complete');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedGoals.length === 0) return;
        if (!confirm(`Delete ${selectedGoals.length} goal(s)?`)) return;

        try {
            await Promise.all(selectedGoals.map(id => api.delete(`/goals/${id}`)));
            setSelectedGoals([]);
            loadGoals();
        } catch (error) {
            console.error('Failed to delete goals:', error);
            alert('Failed to delete goals');
        }
    };

    if (loading) {
        return (
            <div className="container mt-lg">
                <div className="loading text-center">Loading goals...</div>
            </div>
        );
    }

    return (
        <div className="container mt-lg mb-lg">
            <div className="flex items-center justify-between mb-lg">
                <div>
                    <h1>My Goals</h1>
                    <p className="text-secondary">Create and manage your goals and habits</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn btn-primary">
                    + New Goal
                </button>
            </div>

            {goals.length > 0 && (
                <div className="card mb-md" style={{ padding: 'var(--space-md)' }}>
                    <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                        <label className="flex items-center gap-sm" style={{ cursor: 'pointer', margin: 0 }}>
                            <input
                                type="checkbox"
                                checked={selectedGoals.length === goals.length}
                                onChange={handleSelectAll}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <span>{selectedGoals.length > 0 ? `${selectedGoals.length} selected` : 'Select All'}</span>
                        </label>
                        {selectedGoals.length > 0 && (
                            <div className="flex gap-sm">
                                <button onClick={handleBulkComplete} className="btn btn-success btn-sm">
                                    ✓ Complete
                                </button>
                                <button onClick={handleBulkDelete} className="btn btn-danger btn-sm">
                                    🗑 Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {goals.length === 0 ? (
                <div className="card text-center">
                    <h3>No goals yet</h3>
                    <p className="text-secondary mb-lg">Create your first goal to get started!</p>
                    <button onClick={() => setShowForm(true)} className="btn btn-primary">
                        Create Goal
                    </button>
                </div>
            ) : (
                <div className="grid grid-2">
                    {goals.map(goal => (
                        <GoalCard
                            key={goal._id}
                            goal={goal}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            isSelected={selectedGoals.includes(goal._id)}
                            onToggleSelect={handleToggleSelect}
                        />
                    ))}
                </div>
            )}

            {showForm && (
                <GoalForm
                    goal={editingGoal}
                    onClose={handleFormClose}
                />
            )}
        </div>
    );
};

export default Goals;
