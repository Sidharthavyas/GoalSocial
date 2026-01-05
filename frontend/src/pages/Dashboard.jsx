import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Calendar from '../components/Calendar';
import ActivityFeed from '../components/ActivityFeed';
import StreakBadge from '../components/StreakBadge';
import { useSocket } from '../context/SocketContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { syncQueue, getPendingCount } from '../utils/offlineQueue';

const Dashboard = () => {
    const [goals, setGoals] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState({ total: 0, completed: 0, percentage: 0 });
    const [streakDays, setStreakDays] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const { connected, events } = useSocket();
    const isOnline = useOnlineStatus();

    useEffect(() => {
        loadData();
    }, []);

    // Auto-sync when coming online
    useEffect(() => {
        if (isOnline) {
            handleSync();
        }
        setPendingCount(getPendingCount());
    }, [isOnline]);

    // Listen for real-time updates
    useEffect(() => {
        const latestEvent = events[events.length - 1];
        if (latestEvent) {
            if (latestEvent.type === 'progress.updated' || latestEvent.type === 'goal.created') {
                loadData(true);
            }
        }
    }, [events]);

    const handleSync = async () => {
        try {
            await syncQueue(api);
            setPendingCount(getPendingCount());
            loadData(true);
        } catch (error) {
            console.error('Sync failed:', error);
        }
    };

    const loadData = async (silent = false) => {
        if (!silent) {
            setRefreshing(true);
        }

        try {
            const today = new Date().toISOString().split('T')[0];

            const [goalsRes, tasksRes, dailySummary] = await Promise.all([
                api.get('/goals'),
                api.get('/tasks'),
                api.get(`/calendar/day/${today}`).catch(() => ({ data: { streakDays: 0 } }))
            ]);

            setGoals(goalsRes.data.goals || []);
            setTasks(tasksRes.data.tasks || []);
            setStreakDays(dailySummary.data.streakDays || 0);

            // Calculate stats
            const todayDate = new Date();
            const todayStr = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate())
                .toISOString().split('T')[0];

            const todayTasks = (tasksRes.data.tasks || []).filter(t => {
                return t.date === todayStr || t.date.startsWith(todayStr);
            });

            // Goal-based stats: count goals, not tasks
            const activeGoals = goalsRes.data.goals || [];
            const total = activeGoals.length;

            const completedGoalIds = new Set(
                todayTasks
                    .filter(t => t.completed || t.percentage === 100)
                    .map(t => t.goalId._id || t.goalId)
            );
            const completed = completedGoalIds.size;

            setStats({
                total,
                completed,
                percentage: total > 0 ? Math.round((completed / total) * 100) : 0
            });
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleManualRefresh = () => {
        loadData();
    };

    if (loading) {
        return (
            <div className="container mt-lg">
                <div className="loading text-center">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="container mt-lg mb-lg">
            <div className="flex items-center justify-between mb-lg">
                <div>
                    <h1>Dashboard</h1>
                    <p className="text-secondary">Track your goals and monitor progress</p>
                </div>
                <div className="flex items-center gap-sm">
                    {!isOnline && pendingCount > 0 && (
                        <button
                            onClick={handleSync}
                            className="btn btn-secondary btn-sm"
                            disabled
                            title={`${pendingCount} actions pending sync`}
                        >
                            ⏳ {pendingCount} Pending
                        </button>
                    )}
                    <button
                        onClick={handleManualRefresh}
                        className="btn btn-secondary btn-sm"
                        disabled={refreshing}
                        title="Refresh data"
                    >
                        {refreshing ? '🔄' : '↻'} Refresh
                    </button>
                    <span className={`badge ${isOnline ? 'badge-success' : 'badge-error'}`}>
                        {isOnline ? '🟢 Online' : '🔴 Offline'}
                    </span>
                    {connected && (
                        <span className="badge badge-success">
                            ⚡ Live
                        </span>
                    )}
                </div>
            </div>

            {/* Streak Badge */}
            {streakDays >= 3 && (
                <div className="mb-lg">
                    <StreakBadge days={streakDays} />
                </div>
            )}

            {/* Daily Progress Bar */}
            <div className="card mb-lg" style={{ padding: 'var(--space-lg)' }}>
                <div className="flex items-center justify-between mb-sm">
                    <h3 style={{ margin: 0, fontSize: '1rem' }}>Today's Progress</h3>
                    <span className="progress-number text-xl" style={{ fontWeight: 700, color: stats.percentage === 100 ? 'var(--success)' : 'var(--text-primary)' }}>
                        {stats.percentage}%
                    </span>
                </div>

                <div className="progress-bar" style={{ height: '12px', marginBottom: 'var(--space-sm)' }}>
                    <div className="progress-fill" style={{ width: `${stats.percentage}%` }}></div>
                </div>

                <div className="flex justify-between text-sm text-tertiary">
                    <span>{stats.completed} completed</span>
                    {stats.total === 0 ? (
                        <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            Complete one task to start today's streak
                        </span>
                    ) : (
                        <span>{stats.total - stats.completed} remaining</span>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-3 mb-lg">
                <div className="card">
                    <div className="text-tertiary text-sm mb-sm">Active Goals</div>
                    <div className="text-xl" style={{ fontWeight: 700 }}>
                        <span className="progress-number">{goals.length}</span>
                    </div>
                    {goals.length === 0 && (
                        <p className="text-sm text-muted mt-sm" style={{ margin: 0 }}>
                            Create your first goal to get started
                        </p>
                    )}
                </div>
                <div className="card">
                    <div className="text-tertiary text-sm mb-sm">Today's Progress</div>
                    <div className="text-xl" style={{ fontWeight: 700 }}>
                        <span className="progress-number">{stats.completed}</span> / <span className="progress-number">{stats.total}</span>
                    </div>
                </div>
                <div className="card">
                    <div className="text-tertiary text-sm mb-sm">Completion Rate</div>
                    <div className="text-xl" style={{ fontWeight: 700 }}>
                        <span className="progress-number">{stats.percentage}</span>%
                    </div>
                    <div className="progress-bar mt-sm">
                        <div className="progress-fill" style={{ width: `${stats.percentage}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-2">
                <div>
                    <Calendar goals={goals} tasks={tasks} onUpdate={loadData} />
                </div>
                <div>
                    <ActivityFeed />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
