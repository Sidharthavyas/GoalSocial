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
