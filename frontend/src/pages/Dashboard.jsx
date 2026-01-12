import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import Calendar from '../components/Calendar';
import ActivityFeed from '../components/ActivityFeed';
import StreakBadge from '../components/StreakBadge';
import ProgressAnalytics from '../components/ProgressAnalytics';
import { useSocket } from '../context/SocketContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { syncQueue, getPendingCount } from '../utils/offlineQueue';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const DASHBOARD_WIDGETS_STORAGE_KEY = 'dashboard.widgets.v1';

const Dashboard = () => {
    const [goals, setGoals] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState({ total: 0, completed: 0, percentage: 0 });
    const [streakDays, setStreakDays] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [widgetsOpen, setWidgetsOpen] = useState(false);
    const { connected, events } = useSocket();
    const isOnline = useOnlineStatus();

    const defaultWidgetConfig = useMemo(() => ({
        order: ['streak', 'todayProgress', 'stats', 'analytics', 'calendar', 'activity'],
        enabled: {
            streak: true,
            todayProgress: true,
            stats: true,
            analytics: true,
            calendar: true,
            activity: true
        }
    }), []);

    const [widgetConfig, setWidgetConfig] = useState(() => {
        try {
            const raw = localStorage.getItem(DASHBOARD_WIDGETS_STORAGE_KEY);
            if (!raw) return defaultWidgetConfig;
            const parsed = JSON.parse(raw);
            if (!parsed || !Array.isArray(parsed.order) || typeof parsed.enabled !== 'object' || parsed.enabled === null) {
                return defaultWidgetConfig;
            }
            const knownIds = new Set(defaultWidgetConfig.order);
            const normalizedOrder = parsed.order.filter(id => knownIds.has(id));
            for (const id of defaultWidgetConfig.order) {
                if (!normalizedOrder.includes(id)) normalizedOrder.push(id);
            }
            const normalizedEnabled = { ...defaultWidgetConfig.enabled };
            for (const id of Object.keys(defaultWidgetConfig.enabled)) {
                if (typeof parsed.enabled[id] === 'boolean') normalizedEnabled[id] = parsed.enabled[id];
            }
            return { order: normalizedOrder, enabled: normalizedEnabled };
        } catch {
            return defaultWidgetConfig;
        }
    });

    useEffect(() => {
        localStorage.setItem(DASHBOARD_WIDGETS_STORAGE_KEY, JSON.stringify(widgetConfig));
    }, [widgetConfig]);

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
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const today = `${year}-${month}-${day}`;

            const [goalsRes, tasksRes, dailySummary] = await Promise.all([
                api.get('/goals'),
                api.get('/tasks'),
                api.get(`/calendar/day/${today}`).catch(() => ({ data: { streakDays: 0 } }))
            ]);

            setGoals(goalsRes.data.goals || []);
            setTasks(tasksRes.data.tasks || []);
            setStreakDays(dailySummary.data.streakDays || 0);



            // Use the same date string for filtering tasks
            const todayStr = today;

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

    const widgetLabels = useMemo(() => ({
        streak: 'Streak Badge',
        todayProgress: "Today's Progress",
        stats: 'Stats',
        analytics: 'Progress Analytics',
        calendar: 'Calendar',
        activity: 'Activity Feed'
    }), []);

    const setWidgetEnabled = (id, enabled) => {
        setWidgetConfig(prev => ({
            ...prev,
            enabled: {
                ...prev.enabled,
                [id]: enabled
            }
        }));
    };

    const moveWidget = (id, direction) => {
        setWidgetConfig(prev => {
            const index = prev.order.indexOf(id);
            if (index === -1) return prev;
            const nextIndex = direction === 'up' ? index - 1 : index + 1;
            if (nextIndex < 0 || nextIndex >= prev.order.length) return prev;
            const nextOrder = [...prev.order];
            const tmp = nextOrder[index];
            nextOrder[index] = nextOrder[nextIndex];
            nextOrder[nextIndex] = tmp;
            return { ...prev, order: nextOrder };
        });
    };

    const resetWidgets = () => {
        setWidgetConfig(defaultWidgetConfig);
    };

    if (loading) {
        return (
            <div className="container mt-lg mb-lg">
                <div className="flex items-center justify-between mb-lg">
                    <div>
                        <Skeleton width={200} height={40} />
                        <Skeleton width={300} height={20} style={{ marginTop: '8px' }} />
                    </div>
                    <div className="flex items-center gap-sm">
                        <Skeleton width={80} height={36} />
                        <Skeleton width={80} height={24} />
                    </div>
                </div>

                {/* Streak Badge Skeleton */}
                <Skeleton width={250} height={48} style={{ marginBottom: '24px' }} />

                {/* Daily Progress Bar Skeleton */}
                <div className="card mb-lg" style={{ padding: 'var(--space-lg)' }}>
                    <Skeleton width={150} height={24} />
                    <Skeleton height={12} style={{ marginTop: '16px' }} />
                    <div className="flex justify-between" style={{ marginTop: '8px' }}>
                        <Skeleton width={100} height={16} />
                        <Skeleton width={100} height={16} />
                    </div>
                </div>

                {/* Stats Cards Skeleton */}
                <div className="grid grid-3 mb-lg">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="card">
                            <Skeleton width={120} height={16} />
                            <Skeleton width={60} height={32} style={{ marginTop: '8px' }} />
                        </div>
                    ))}
                </div>

                {/* Calendar & Activity Skeleton */}
                <div className="grid grid-2">
                    <Skeleton height={400} />
                    <Skeleton height={400} />
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-lg mb-lg">
            <div className="flex items-center justify-between mb-lg" style={{ flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <div>
                    <h1 style={{ marginBottom: 'var(--space-xs)' }}>Dashboard</h1>
                    <p className="text-secondary" style={{ margin: 0 }}>Track your goals and monitor progress</p>
                </div>
                <div className="flex items-center gap-sm" style={{ flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setWidgetsOpen(true)}
                        className="btn btn-secondary btn-sm"
                        title="Customize widgets"
                    >
                        ⚙
                    </button>
                    {!isOnline && pendingCount > 0 && (
                        <button
                            onClick={handleSync}
                            className="btn btn-secondary btn-sm"
                            disabled
                            title={`${pendingCount} actions pending sync`}
                        >
                            ⏳ {pendingCount}
                        </button>
                    )}
                    <button
                        onClick={handleManualRefresh}
                        className="btn btn-secondary btn-sm"
                        disabled={refreshing}
                        title="Refresh data"
                    >
                        {refreshing ? '🔄' : '↻'}
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

            <div className="dashboard-widgets">
                {(() => {
                    const enabled = widgetConfig.enabled;
                    const calendarIndex = widgetConfig.order.indexOf('calendar');
                    const activityIndex = widgetConfig.order.indexOf('activity');
                    const renderCalendarActivityTogether = Boolean(enabled.calendar && enabled.activity);
                    const firstGridId = renderCalendarActivityTogether
                        ? (calendarIndex < activityIndex ? 'calendar' : 'activity')
                        : null;

                    const itemVariants = {
                        hidden: { y: 20, opacity: 0 },
                        visible: { y: 0, opacity: 1 }
                    };

                    return (
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                visible: { transition: { staggerChildren: 0.1 } }
                            }}
                        >
                            {widgetConfig.order.map((id) => {
                                if (!enabled[id]) return null;
                                if (renderCalendarActivityTogether && id !== firstGridId && (id === 'calendar' || id === 'activity')) {
                                    return null;
                                }

                                if (id === 'streak') {
                                    if (streakDays < 3) return null;
                                    return (
                                        <motion.div key={id} variants={itemVariants} className="mb-lg">
                                            <StreakBadge days={streakDays} />
                                        </motion.div>
                                    );
                                }

                                if (id === 'todayProgress') {
                                    return (
                                        <motion.div key={id} variants={itemVariants} className="card mb-lg" style={{ padding: 'var(--space-lg)' }}>
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
                                        </motion.div>
                                    );
                                }

                                if (id === 'stats') {
                                    return (
                                        <motion.div key={id} variants={itemVariants} className="grid grid-3 mb-lg">
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
                                        </motion.div>
                                    );
                                }

                                if (id === 'analytics') {
                                    return (
                                        <motion.div key={id} variants={itemVariants} className="mb-lg">
                                            <ProgressAnalytics />
                                        </motion.div>
                                    );
                                }

                                if (renderCalendarActivityTogether && id === firstGridId) {
                                    return (
                                        <motion.div key="calendarActivity" variants={itemVariants} className="grid grid-2 mb-lg">
                                            <div>
                                                <Calendar goals={goals} tasks={tasks} onUpdate={loadData} />
                                            </div>
                                            <div>
                                                <ActivityFeed />
                                            </div>
                                        </motion.div>
                                    );
                                }

                                if (id === 'calendar') {
                                    return (
                                        <motion.div key={id} variants={itemVariants} className="mb-lg">
                                            <Calendar goals={goals} tasks={tasks} onUpdate={loadData} />
                                        </motion.div>
                                    );
                                }

                                if (id === 'activity') {
                                    return (
                                        <motion.div key={id} variants={itemVariants} className="mb-lg">
                                            <ActivityFeed />
                                        </motion.div>
                                    );
                                }

                                return null;
                            })}
                        </motion.div>
                    );
                })()}
            </div>

            {widgetsOpen && (
                <div className="modal-overlay" onClick={() => setWidgetsOpen(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2 style={{ margin: 0 }}>Customize Widgets</h2>
                                <p className="text-secondary text-sm" style={{ margin: 0 }}>Choose what appears on your Dashboard</p>
                            </div>
                            <button onClick={() => setWidgetsOpen(false)} className="btn btn-secondary btn-sm">✕</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                {widgetConfig.order.map((id, index) => (
                                    <div
                                        key={id}
                                        className="card"
                                        style={{
                                            padding: 'var(--space-md)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: 'var(--space-md)'
                                        }}
                                    >
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', cursor: 'pointer', flex: 1 }}>
                                            <input
                                                type="checkbox"
                                                checked={Boolean(widgetConfig.enabled[id])}
                                                onChange={(e) => setWidgetEnabled(id, e.target.checked)}
                                                style={{ width: '18px', height: '18px' }}
                                            />
                                            <span style={{ fontWeight: 600 }}>{widgetLabels[id] || id}</span>
                                        </label>
                                        <div className="flex items-center gap-sm">
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => moveWidget(id, 'up')}
                                                disabled={index === 0}
                                                title="Move up"
                                                style={{ minWidth: '44px', minHeight: '44px', padding: 0, justifyContent: 'center' }}
                                            >
                                                ↑
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => moveWidget(id, 'down')}
                                                disabled={index === widgetConfig.order.length - 1}
                                                title="Move down"
                                                style={{ minWidth: '44px', minHeight: '44px', padding: 0, justifyContent: 'center' }}
                                            >
                                                ↓
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
                            <button className="btn btn-secondary" onClick={resetWidgets}>
                                Reset
                            </button>
                            <button className="btn btn-primary" onClick={() => setWidgetsOpen(false)}>
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
