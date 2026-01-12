import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import confetti from 'canvas-confetti';
import { showConfirm, showSuccess, showError } from '../utils/modal';

const Challenges = () => {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedChallenge, setSelectedChallenge] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [userProgress, setUserProgress] = useState({}); // Track user's progress per challenge

    // New Challenge Form State
    const [newTitle, setNewTitle] = useState('');
    const [newType, setNewType] = useState('streak');
    const [newTarget, setNewTarget] = useState(0);

    useEffect(() => {
        loadChallenges();
    }, []);

    const loadChallenges = async () => {
        try {
            const res = await api.get('/challenges');
            setChallenges(res.data);

            // Load progress for each challenge
            for (const challenge of res.data) {
                loadUserProgress(challenge._id);
            }
        } catch (error) {
            console.error('Failed to load challenges', error);
        } finally {
            setLoading(false);
        }
    };

    const loadUserProgress = async (challengeId) => {
        try {
            const res = await api.get(`/challenges/${challengeId}/my-progress`);
            setUserProgress(prev => ({
                ...prev,
                [challengeId]: res.data
            }));
        } catch (error) {
            console.error('Failed to load progress', error);
        }
    };

    const loadLeaderboard = async (challengeId) => {
        try {
            const res = await api.get(`/challenges/${challengeId}/leaderboard`);
            setLeaderboard(res.data.leaderboard);
        } catch (error) {
            console.error('Failed to load leaderboard', error);
        }
    };

    const handleJoin = async (id, e) => {
        e.stopPropagation();

        const confirmed = await showConfirm(
            'Join this challenge and compete with friends?',
            'Join Challenge',
            'confirm'
        );

        if (!confirmed) return;

        try {
            await api.post(`/challenges/${id}/join`);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            await showSuccess('Successfully joined the challenge! 🎉');
            loadChallenges();
        } catch (error) {
            await showError(error.response?.data?.error || 'Failed to join challenge');
        }
    };

    const handleLeave = async (id, e) => {
        e.stopPropagation();

        const confirmed = await showConfirm(
            'Are you sure you want to leave this challenge? Your progress will be lost.',
            'Leave Challenge',
            'warning'
        );

        if (!confirmed) return;

        try {
            await api.post(`/challenges/${id}/leave`);
            await showSuccess('Left the challenge');
            loadChallenges();
        } catch (error) {
            await showError(error.response?.data?.error || 'Failed to leave challenge');
        }
    };

    const handleCompleteToday = async (id, e) => {
        e.stopPropagation();

        try {
            await api.post(`/challenges/${id}/complete-today`);
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 }
            });
            await showSuccess('Daily task completed! Keep up the streak! 🔥');
            loadUserProgress(id);
            if (selectedChallenge?._id === id) {
                loadLeaderboard(id);
            }
        } catch (error) {
            await showError(error.response?.data?.error || 'Failed to complete task');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            // Default 30 days duration
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 30);

            await api.post('/challenges', {
                title: newTitle,
                type: newType,
                targetValue: newTarget,
                startDate,
                endDate
            });
            setShowCreateModal(false);
            setNewTitle('');
            setNewType('streak');
            setNewTarget(0);
            await showSuccess('Challenge created successfully!');
            loadChallenges();
        } catch (error) {
            await showError('Failed to create challenge');
        }
    };

    return (
        <div className="container mt-lg mb-lg">
            <div className="flex justify-between items-center mb-lg">
                <h1>Social Challenges 🏆</h1>
                <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
                    + Create Challenge
                </button>
            </div>

            <div className="grid grid-2">
                {/* Challenge List */}
                <div className="challenges-list">
                    {challenges.map(challenge => {
                        const progress = userProgress[challenge._id];
                        const isParticipant = progress?.isParticipant;
                        const completedToday = progress?.completedToday;

                        return (
                            <motion.div
                                key={challenge._id}
                                className={`card ${selectedChallenge?._id === challenge._id ? 'card-glass' : ''}`}
                                onClick={() => {
                                    setSelectedChallenge(challenge);
                                    loadLeaderboard(challenge._id);
                                }}
                                whileHover={{ scale: 1.02 }}
                                style={{ cursor: 'pointer', marginBottom: 'var(--space-md)' }}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3>{challenge.title}</h3>
                                        <p className="text-sm text-secondary">
                                            {challenge.participants.length} participants • {challenge.type}
                                        </p>
                                        {isParticipant && progress && (
                                            <div className="mt-sm">
                                                <span className="badge badge-success">
                                                    🔥 {progress.streak} day streak
                                                </span>
                                                <span className="badge badge-info ml-sm">
                                                    ✅ {progress.totalDays} days completed
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-sm" style={{ flexDirection: 'column' }}>
                                        {!isParticipant ? (
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={(e) => handleJoin(challenge._id, e)}
                                            >
                                                Join
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    className={`btn btn-sm ${completedToday ? 'btn-secondary' : 'btn-success'}`}
                                                    onClick={(e) => handleCompleteToday(challenge._id, e)}
                                                    disabled={completedToday}
                                                >
                                                    {completedToday ? '✓ Done Today' : 'Complete Today'}
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={(e) => handleLeave(challenge._id, e)}
                                                >
                                                    Leave
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Leaderboard View */}
                <div className="leaderboard-view card">
                    {selectedChallenge ? (
                        <>
                            <h2 className="mb-md">Leaderboard: {selectedChallenge.title}</h2>
                            <div className="leaderboard-list">
                                {leaderboard.map((entry, index) => (
                                    <div key={entry.user._id} className="flex justify-between items-center p-sm border-bottom">
                                        <div className="flex items-center gap-sm">
                                            <span className="text-xl font-bold">#{index + 1}</span>
                                            <span>{entry.user.username}</span>
                                        </div>
                                        <div className="flex gap-sm items-center">
                                            <span className="badge badge-success">{entry.score} days</span>
                                            <span className="badge badge-warning">🔥 {entry.streak}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-secondary p-lg">
                            Select a challenge to view leaderboard
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Create Challenge</h2>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label>Title</label>
                                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Type</label>
                                <select value={newType} onChange={e => setNewType(e.target.value)}>
                                    <option value="streak">Maintain Streak</option>
                                    <option value="completion">Complete Tasks</option>
                                    <option value="count">Reach Target Count</option>
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Challenges;
