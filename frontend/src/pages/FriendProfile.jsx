import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import GoalCard from '../components/GoalCard';

const FriendProfile = () => {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [userId]);

    const loadData = async () => {
        try {
            const [userRes, goalsRes] = await Promise.all([
                api.get(`/users/${userId}`),
                api.get(`/users/${userId}/goals`)
            ]);

            setUser(userRes.data.user);
            setGoals(goalsRes.data.goals || []);
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
                <h1>{user.username}'s Profile</h1>
                <p className="text-tertiary">{user.uuid}</p>
            </div>

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
        </div>
    );
};

export default FriendProfile;
