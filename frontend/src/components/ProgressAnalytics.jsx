import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../hooks/useTheme';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const ProgressAnalytics = () => {
    const [activeTab, setActiveTab] = useState('weekly');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { events } = useSocket();
    const { theme } = useTheme();

    const loadData = useCallback(async () => {
        if (loading) return; // Prevent duplicate calls

        setLoading(true);
        setError(null);

        try {
            console.log(`📊 Fetching /analytics/${activeTab}`);
            const response = await api.get(`/analytics/${activeTab}`);
            console.log(`📊 Response:`, response.data);

            // Validate the response
            if (response.data) {
                setData(response.data);
            } else {
                setError('Invalid response format');
            }
        } catch (err) {
            console.error('Error loading analytics:', err);
            setError(err.message || 'Failed to load analytics');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    // Load data on tab change
    useEffect(() => {
        setData(null);
        loadData();
    }, [activeTab, loadData]);

    // Refresh when page becomes visible
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                loadData();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [loadData]);

    // Refresh on socket events
    useEffect(() => {
        if (events.length === 0) return;

        const latestEvent = events[events.length - 1];
        const relevantEvents = [
            'progress.updated',
            'progress.updated.success',
            'goal.created',
            'goal.created.success',
            'goal.updated',
            'goal.updated.success',
            'goal.deleted',
            'goal.deleted.success'
        ];

        if (latestEvent && relevantEvents.includes(latestEvent.type)) {
            console.log('📊 Refreshing due to event:', latestEvent.type);
            const timeoutId = setTimeout(loadData, 500);
            return () => clearTimeout(timeoutId);
        }
    }, [events, loadData]);

    const getSummaryStats = () => {
        if (!data) return null;

        if (activeTab === 'weekly' || activeTab === 'monthly') {
            const days = data.days || [];
            if (days.length === 0) return null;

            const validDays = days.filter(d => d.totalGoals > 0);
            if (validDays.length === 0) {
                return { avg: 0, best: 0, perfectDays: 0, totalDays: days.length };
            }

            const total = validDays.reduce((sum, d) => sum + (d.completionPercent || 0), 0);
            const avg = Math.round(total / validDays.length);
            const best = Math.max(...days.map(d => d.completionPercent || 0));
            const perfectDays = days.filter(d => d.completionPercent === 100).length;

            return { avg, best, perfectDays, totalDays: days.length };
        } else if (activeTab === 'yearly') {
            const months = data.months || [];
            if (months.length === 0) return null;

            const total = months.reduce((sum, m) => sum + (m.avgCompletionPercent || 0), 0);
            const avg = Math.round(total / months.length);
            const best = Math.max(...months.map(m => m.avgCompletionPercent || 0));
            const perfectMonths = months.filter(m => m.avgCompletionPercent === 100).length;

            return { avg, best, perfectMonths, totalMonths: months.length };
        }
        return null;
    };

    const chartData = useMemo(() => {
        if (!data) {
            console.log('📊 chartData: No data');
            return null;
        }

        if (activeTab === 'weekly') {
            const days = data.days;
            if (!Array.isArray(days) || days.length === 0) {
                console.log('📊 chartData: No weekly days');
                return null;
            }

            console.log('📊 Building weekly chart with days:', days);

            return {
                labels: days.map(d => {
                    const parts = d.date.split('-');
                    const date = new Date(
                        parseInt(parts[0], 10),
                        parseInt(parts[1], 10) - 1,
                        parseInt(parts[2], 10)
                    );
                    return date.toLocaleDateString('en-US', { weekday: 'short' });
                }),
                datasets: [{
                    label: 'Completion %',
                    data: days.map(d => d.completionPercent || 0),
                    borderColor: 'rgb(124, 179, 138)',
                    backgroundColor: 'rgba(124, 179, 138, 0.15)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: days.map(d =>
                        d.completionPercent === 100 ? 'rgb(34, 197, 94)' :
                            d.completionPercent > 0 ? 'rgb(124, 179, 138)' :
                                'rgb(156, 163, 175)'
                    ),
                    pointBorderColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                    pointBorderWidth: 2
                }]
            };
        } else if (activeTab === 'monthly') {
            const days = data.days;
            if (!Array.isArray(days) || days.length === 0) return null;

            return {
                labels: days.map(d => parseInt(d.date.split('-')[2], 10)),
                datasets: [{
                    label: 'Daily Completion %',
                    data: days.map(d => d.completionPercent || 0),
                    borderColor: 'rgb(106, 159, 181)',
                    backgroundColor: 'rgba(106, 159, 181, 0.15)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    pointBackgroundColor: 'rgb(106, 159, 181)',
                    pointBorderColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                    pointBorderWidth: 1
                }]
            };
        } else if (activeTab === 'yearly') {
            const months = data.months;
            if (!Array.isArray(months) || months.length === 0) return null;

            return {
                labels: months.map(m => m.monthName?.slice(0, 3) || ''),
                datasets: [{
                    label: 'Monthly Avg %',
                    data: months.map(m => m.avgCompletionPercent || 0),
                    borderColor: 'rgb(139, 92, 246)',
                    backgroundColor: 'rgba(139, 92, 246, 0.15)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: 'rgb(139, 92, 246)',
                    pointBorderColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                    pointBorderWidth: 2
                }]
            };
        }
        return null;
    }, [data, activeTab, theme]);

    const chartOptions = useMemo(() => {
        const isDark = theme === 'dark';
        const textColor = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(26, 26, 26, 0.7)';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

        return {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: isDark ? 'rgba(10, 10, 10, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    padding: 12,
                    titleColor: 'rgb(124, 179, 138)',
                    bodyColor: isDark ? '#fff' : '#1a1a1a',
                    borderColor: 'rgba(124, 179, 138, 0.3)',
                    borderWidth: 1,
                    displayColors: false,
                    callbacks: {
                        label: (context) => {
                            const dataIndex = context.dataIndex;
                            const days = data?.days;
                            if (days && days[dataIndex]) {
                                const day = days[dataIndex];
                                return [
                                    `Completion: ${context.parsed.y}%`,
                                    `Completed: ${day.completedGoals}/${day.totalGoals} goals`
                                ];
                            }
                            return `${context.parsed.y}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: (value) => value + '%',
                        color: textColor,
                        font: { size: 10 },
                        stepSize: 25
                    },
                    grid: {
                        color: gridColor,
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        color: textColor,
                        font: { size: 9 },
                        maxRotation: 0
                    },
                    grid: { display: false }
                }
            }
        };
    }, [theme, data]);

    const stats = getSummaryStats();

    return (
        <div className="card" style={{ padding: '12px', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                flexWrap: 'wrap',
                gap: '8px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                        Progress Analytics
                    </h3>
                    <button
                        onClick={loadData}
                        disabled={loading}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            padding: '4px',
                            fontSize: '0.875rem',
                            color: 'var(--text-secondary)',
                            opacity: loading ? 0.5 : 1
                        }}
                        title="Refresh analytics"
                    >
                        {loading ? '⏳' : '↻'}
                    </button>
                </div>
                <div style={{
                    display: 'flex',
                    gap: '2px',
                    background: 'var(--bg-secondary)',
                    padding: '3px',
                    borderRadius: '6px'
                }}>
                    {['weekly', 'monthly', 'yearly'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '4px 10px',
                                fontSize: '0.7rem',
                                borderRadius: '4px',
                                border: 'none',
                                background: activeTab === tab ? 'var(--bg-card)' : 'transparent',
                                color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-tertiary)',
                                cursor: 'pointer',
                                fontWeight: activeTab === tab ? 600 : 400
                            }}
                        >
                            {tab === 'weekly' ? '7D' : tab === 'monthly' ? '1M' : '1Y'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="loading-spinner"></div>
                </div>
            ) : error ? (
                <div style={{
                    height: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '8px',
                    color: 'var(--error)'
                }}>
                    <span>❌ {error}</span>
                    <button onClick={loadData} style={{
                        padding: '4px 12px',
                        background: 'var(--bg-secondary)',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}>
                        Retry
                    </button>
                </div>
            ) : !chartData ? (
                <div style={{
                    height: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-tertiary)',
                    flexDirection: 'column',
                    gap: '8px'
                }}>
                    <span style={{ fontSize: '1.5rem' }}>📊</span>
                    <span style={{ fontSize: '0.85rem' }}>No data yet. Start tracking your goals!</span>
                </div>
            ) : (
                <>
                    {/* Stats Row */}
                    {stats && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '8px',
                            marginBottom: '12px'
                        }}>
                            <div style={{
                                padding: '8px',
                                background: 'var(--bg-secondary)',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Avg</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{stats.avg}%</div>
                            </div>
                            <div style={{
                                padding: '8px',
                                background: 'var(--bg-secondary)',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Best</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success)' }}>{stats.best}%</div>
                            </div>
                            <div style={{
                                padding: '8px',
                                background: 'var(--bg-secondary)',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Perfect</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                                    {activeTab === 'yearly' ? stats.perfectMonths : stats.perfectDays}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Chart */}
                    <div style={{ height: '180px', width: '100%', position: 'relative' }}>
                        <Line
                            key={`chart-${activeTab}-${theme}-${Date.now()}`}
                            data={chartData}
                            options={chartOptions}
                        />
                    </div>

                    {/* Debug info - remove in production */}
                    {process.env.NODE_ENV === 'development' && data?.days && (
                        <div style={{
                            marginTop: '8px',
                            fontSize: '0.6rem',
                            color: 'var(--text-tertiary)',
                            background: 'var(--bg-secondary)',
                            padding: '4px 8px',
                            borderRadius: '4px'
                        }}>
                            {data.days.map(d => (
                                <span key={d.date} style={{ marginRight: '8px' }}>
                                    {d.date.slice(-2)}: {d.completedGoals}/{d.totalGoals}
                                </span>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ProgressAnalytics;