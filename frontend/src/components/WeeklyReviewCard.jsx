import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../utils/api';
import { triggerCelebration } from '../utils/celebrations';

const WeeklyReviewCard = ({ onClose }) => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInsights();
    }, []);

    const loadInsights = async () => {
        try {
            const res = await api.get('/insights/weekly');
            setInsights(res.data);

            // Trigger confetti if consistency is high
            if (res.data.consistencyPercent >= 80) {
                setTimeout(() => triggerCelebration('success'), 500);
            }
        } catch (error) {
            console.error('Failed to load insights:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="card" style={{ padding: 'var(--space-xl)', maxWidth: '600px', margin: '0 auto' }}>
                <h2>Loading your weekly review...</h2>
            </div>
        );
    }

    if (!insights) return null;

    const getMotivationalMessage = () => {
        const { consistencyPercent, streakMaintained } = insights;

        if (consistencyPercent >= 90) return "🌟 Outstanding! You're";
        /* ## Planning Phase
        - [x] Review existing codebase structure
        - [x] Create comprehensive implementation plan
        - [x] Get user approval on plan */
        if (consistencyPercent >= 70) return "💪 Great work! Keep the momentum going!";
        if (consistencyPercent >= 50) return "👍 Good progress! You're on the right track!";
        if (streakMaintained) return "🔥 Streak maintained! Don't break it now!";
        return "📈 Every day is a new opportunity!";
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal scale-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h2>📊 Weekly Review</h2>
                    <button onClick={onClose} className="btn-close">×</button>
                </div>

                <div className="modal-body">
                    {/* Motivational Message */}
                    <div className="card mb-md" style={{
                        background: 'var(--accent-gradient)',
                        color: 'white',
                        textAlign: 'center',
                        padding: 'var(--space-lg)'
                    }}>
                        <h3 style={{ margin: 0 }}>{getMotivationalMessage()}</h3>
                    </div>

                    {/* Key Stats */}
                    <div className="grid grid-3 mb-md">
                        <div className="card text-center">
                            <div className="text-tertiary text-sm">Consistency</div>
                            <div className="text-2xl font-bold count-up">{insights.consistencyPercent}%</div>
                        </div>
                        <div className="card text-center">
                            <div className="text-tertiary text-sm">Goals Completed</div>
                            <div className="text-2xl font-bold count-up">{insights.totalGoalsCompleted}</div>
                        </div>
                        <div className="card text-center">
                            <div className="text-tertiary text-sm">Current Streak</div>
                            <div className="text-2xl font-bold count-up">🔥 {insights.currentStreak}</div>
                        </div>
                    </div>

                    {/* Best & Worst Days */}
                    {insights.bestDay && (
                        <div className="grid grid-2 mb-md">
                            <div className="card">
                                <div className="text-sm text-tertiary mb-xs">⭐ Best Day</div>
                                <div className="font-bold">{format(new Date(insights.bestDay.date), 'EEEE, MMM d')}</div>
                                <div className="text-success">{insights.bestDay.completion}% complete</div>
                                <div className="text-sm text-tertiary">{insights.bestDay.completed}/{insights.bestDay.total} goals</div>
                            </div>

                            {insights.worstDay && insights.worstDay.date !== insights.bestDay.date && (
                                <div className="card">
                                    <div className="text-sm text-tertiary mb-xs">📉 Needs Work</div>
                                    <div className="font-bold">{format(new Date(insights.worstDay.date), 'EEEE, MMM d')}</div>
                                    <div className="text-warning">{insights.worstDay.completion}% complete</div>
                                    <div className="text-sm text-tertiary">{insights.worstDay.completed}/{insights.worstDay.total} goals</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Average Completion */}
                    <div className="card mb-md">
                        <div className="text-sm text-tertiary mb-sm">Average Daily Completion</div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${insights.averageCompletion}%` }}
                            />
                        </div>
                        <div className="text-center mt-xs font-bold">{insights.averageCompletion}%</div>
                    </div>

                    {/* Streak Status */}
                    <div className={`card ${insights.streakMaintained ? 'border-success' : 'border-warning'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-bold">
                                    {insights.streakMaintained ? '✅ Streak Maintained!' : '⚠️ Streak At Risk'}
                                </div>
                                <div className="text-sm text-tertiary">
                                    {insights.daysActive} out of 7 days active
                                </div>
                            </div>
                            <div className="text-3xl">
                                {insights.streakMaintained ? '🔥' : '💪'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button onClick={onClose} className="btn btn-primary">
                        Keep Going! 🚀
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WeeklyReviewCard;
