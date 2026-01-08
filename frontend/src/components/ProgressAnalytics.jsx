import React, { useState, useEffect } from 'react';
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

// Register Chart.js components
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
    const { events } = useSocket();
    const { theme } = useTheme();

    // Load data on tab change
    useEffect(() => {
        setData(null);
        loadData();
    }, [activeTab]);

    // Refresh when page becomes visible (user returns to tab)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                loadData();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [activeTab]);

    // Refresh when goals/tasks are updated via socket or HTTP
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
            console.log('📊 Progress analytics: Refreshing due to event:', latestEvent.type);
            // Small delay to ensure backend has processed the update
            const timeoutId = setTimeout(() => {
                loadData();
            }, 300);
            return () => clearTimeout(timeoutId);
        }
    }, [events, activeTab]);


    const loadData = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/analytics/${activeTab}`);
            setData(response.data);
        } catch (error) {
            console.error('Error loading analytics:', error);
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    const getSummaryStats = () => {
        if (!data) return null;

        if (activeTab === 'weekly' || activeTab === 'monthly') {
            const days = data.days || [];
            if (days.length === 0) return null;

            const total = days.reduce((sum, d) => sum + (d.completionPercent || 0), 0);
            const avg = Math.round(total / days.length);
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

    const getChartData = () => {
        if (!data) return null;

        if (activeTab === 'weekly') {
            const days = data.days;
            if (!Array.isArray(days) || days.length === 0) return null;

            return {
                labels: days.map(d => {
                    const date = new Date(d.date);
                    return date.toLocaleDateString('en-US', { weekday: 'short' });
                }),
                datasets: [{
                    label: 'Completion %',
                    data: days.map(d => d.completionPercent || 0),
                    borderColor: 'rgb(124, 179, 138)',
                    backgroundColor: 'rgba(124, 179, 138, 0.15)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: 'rgb(124, 179, 138)',
                    pointBorderColor: '#0a0a0a',
                    pointBorderWidth: 2
                }]
            };
        } else if (activeTab === 'monthly') {
            const days = data.days;
            if (!Array.isArray(days) || days.length === 0) return null;

            return {
                labels: days.map(d => new Date(d.date).getDate()),
                datasets: [{
                    label: 'Daily Completion %',
                    data: days.map(d => d.completionPercent || 0),
                    borderColor: 'rgb(106, 159, 181)',
                    backgroundColor: 'rgba(106, 159, 181, 0.15)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 2,
                    pointHoverRadius: 5,
                    pointBackgroundColor: 'rgb(106, 159, 181)',
                    pointBorderColor: '#0a0a0a',
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
                    pointBorderColor: '#0a0a0a',
                    pointBorderWidth: 2
                }]
            };
        }
        return null;
    };

    // Get theme-aware colors
    const isDark = theme === 'dark';
    const textColor = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(26, 26, 26, 0.6)';
    const textColorSecondary = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(26, 26, 26, 0.5)';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    const tooltipBg = isDark ? 'rgba(10, 10, 10, 0.95)' : 'rgba(255, 255, 255, 0.95)';
    const tooltipText = isDark ? '#fff' : '#1a1a1a';

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: tooltipBg,
                padding: 12,
                titleColor: 'rgb(124, 179, 138)',
                titleFont: { size: 12, weight: 600 },
                bodyColor: tooltipText,
                bodyFont: { size: 11 },
                borderColor: 'rgba(124, 179, 138, 0.3)',
                borderWidth: 1,
                displayColors: false,
                callbacks: {
                    label: (context) => `${context.parsed.y}%`
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
                },
                border: { 
                    display: true,
                    color: textColor
                }
            },
            x: {
                ticks: {
                    color: textColorSecondary,
                    font: { size: 9 },
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 7
                },
                grid: { display: false },
                border: { 
                    display: true,
                    color: textColorSecondary
                }
            }
        }
    };

    const stats = getSummaryStats();
    const chartData = getChartData();

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
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Progress</h3>
                    <button
                        onClick={() => loadData()}
                        disabled={loading}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            padding: '4px',
                            fontSize: '0.875rem',
                            color: 'var(--text-secondary)',
                            opacity: loading ? 0.5 : 1,
                            transition: 'transform 0.2s'
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
                                fontWeight: activeTab === tab ? 600 : 400,
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab === 'weekly' ? '7D' : tab === 'monthly' ? '1M' : '1Y'}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="loading-spinner"></div>
                </div>
            ) : !data || !chartData ? (
                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '1.5rem' }}>📊</span>
                    <span style={{ fontSize: '0.85rem' }}>No data yet</span>
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
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginBottom: '2px' }}>Avg</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.avg}%</div>
                            </div>
                            <div style={{
                                padding: '8px',
                                background: 'var(--bg-secondary)',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginBottom: '2px' }}>Best</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success)' }}>{stats.best}%</div>
                            </div>
                            <div style={{
                                padding: '8px',
                                background: 'var(--bg-secondary)',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginBottom: '2px' }}>Perfect</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                                    {activeTab === 'yearly' ? stats.perfectMonths : stats.perfectDays}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Chart */}
                    <div style={{ height: '180px', width: '100%', position: 'relative' }}>
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </>
            )}
        </div>
    );
};

export default ProgressAnalytics;
