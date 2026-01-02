import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import Calendar from '../components/Calendar';
import GoalCard from '../components/GoalCard';

const FriendProfile = () => {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [goals, setGoals] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'goals'

    useEffect(() => {
        loadData();
    }, [userId]);

    const loadData = async () => {
        try {
            const [userRes, goalsRes, tasksRes] = await Promise.all([
                api.get(`/users/${userId}`),
                api.get(`/users/${userId}/goals`),
                api.get(`/users/${userId}/tasks`)
            ]);

            setUser(userRes.data.user);
            setGoals(goalsRes.data.goals || []);
            setTasks(tasksRes.data.tasks || []);
        } catch (error) {
            console.error('Failed to load friend profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container mt-lg">
                <div className="loading text-center">Loading profile...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mt-lg">
                <div className="card text-center">
                    <h3>User not found</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-lg mb-lg">
            <div className="card mb-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h1>{user.username}'s Profile</h1>
                        <p className="text-tertiary">{user.uuid}</p>
                    </div>
                    <div className="flex gap-sm">
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        >
                            📅 Calendar
                        </button>
                        <button
                            onClick={() => setViewMode('goals')}
                            className={`btn ${viewMode === 'goals' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        >
                            🎯 Goals
                        </button>
                    </div>
                </div>
            </div>

            {viewMode === 'calendar' ? (
                <>
                    <h2 className="mb-md">Progress Calendar</h2>
                    <div className="card">
                        <Calendar
                            goals={goals}
                            tasks={tasks}
                            onUpdate={loadData}
                            readOnly={true}
                        />
                    </div>
                </>
            ) : (
                <>
                    <h2 className="mb-md">Goals ({goals.length})</h2>
                    {goals.length === 0 ? (
                        <div className="card text-center">
                            <p className="text-secondary">No active goals</p>
                        </div>
                    ) : (
                        <div className="grid grid-2">
                            {goals.map(goal => (
                                <GoalCard key={goal._id} goal={goal} readOnly />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default FriendProfile;
