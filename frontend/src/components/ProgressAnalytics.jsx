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
import Skeleton from 'react-loading-skeleton';

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

    useEffect(() => {
        // Reset data when switching tabs to prevent race conditions
        setData(null);
        loadData();
    }, [activeTab]);

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
                    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                }),
                datasets: [
                    {
                        label: 'Completion %',
                        data: days.map(d => d.completionPercent || 0),
                        borderColor: 'rgb(124, 179, 138)',
                        backgroundColor: 'rgba(124, 179, 138, 0.15)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointBackgroundColor: 'rgb(124, 179, 138)',
                        pointBorderColor: '#0a0a0a',
                        pointBorderWidth: 2
                    }
                ]
            };
        } else if (activeTab === 'monthly') {
            const days = data.days;
            if (!Array.isArray(days) || days.length === 0) return null;

            return {
                labels: days.map(d => {
                    const date = new Date(d.date);
                    return date.getDate();
                }),
                datasets: [
                    {
                        label: 'Daily Completion %',
                        data: days.map(d => d.completionPercent || 0),
                        borderColor: 'rgb(106, 159, 181)',
                        backgroundColor: 'rgba(106, 159, 181, 0.15)',
                        fill: true,
                        tension: 0.3,
                        pointRadius: 3,
                        pointHoverRadius: 6,
                        pointBackgroundColor: 'rgb(106, 159, 181)',
                        pointBorderColor: '#0a0a0a',
                        pointBorderWidth: 2
                    }
                ]
            };
        } else if (activeTab === 'yearly') {
            const months = data.months;
            if (!Array.isArray(months) || months.length === 0) return null;

            return {
                labels: months.map(m => m.monthName || ''),
                datasets: [
                    {
                        label: 'Monthly Avg %',
                        data: months.map(m => m.avgCompletionPercent || 0),
                        borderColor: 'rgb(139, 92, 246)',
                        backgroundColor: 'rgba(139, 92, 246, 0.15)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointBackgroundColor: 'rgb(139, 92, 246)',
                        pointBorderColor: '#0a0a0a',
                        pointBorderWidth: 2
                    }
                ]
            };
        }
        return null;
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(10, 10, 10, 0.95)',
                padding: 16,
                titleColor: 'rgb(124, 179, 138)',
                titleFont: {
                    size: 14,
                    weight: 600
                },
                bodyColor: '#fff',
                bodyFont: {
                    size: 13
                },
                borderColor: 'rgba(124, 179, 138, 0.3)',
                borderWidth: 1,
                displayColors: false,
                callbacks: {
                    label: function (context) {
                        return `Completion: ${context.parsed.y}%`;
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
                    color: 'rgba(255, 255, 255, 0.6)',
                    font: {
                        size: 12
                    },
                    stepSize: 25
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false
                },
                border: {
                    display: false
                }
            },
            x: {
                ticks: {
                    color: 'rgba(255, 255, 255, 0.6)',
                    font: {
                        size: window.innerWidth < 768 ? 10 : 12
                    },
                    maxRotation: 45,
                    minRotation: 0
                },
                grid: {
                    display: false
                },
                border: {
                    display: false
                }
            }
        }
    };

    const stats = getSummaryStats();

    return (
        <div className="card" style={{ padding: 'var(--space-lg)' }}>
            <div className="flex items-center justify-between mb-lg" style={{ flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <h3 style={{ margin: 0 }}>Progress Analytics</h3>
                <div className="analytics-tabs">
                    <button
                        className={`analytics-tab ${activeTab === 'weekly' ? 'active' : ''}`}
                        onClick={() => setActiveTab('weekly')}
                    >
                        7 Days
                    </button>
                    <button
                        className={`analytics-tab ${activeTab === 'monthly' ? 'active' : ''}`}
                        onClick={() => setActiveTab('monthly')}
                    >
                        Month
                    </button>
                    <button
                        className={`analytics-tab ${activeTab === 'yearly' ? 'active' : ''}`}
                        onClick={() => setActiveTab('yearly')}
                    >
                        Year
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            {stats && !loading && (
                <div className="grid" style={{
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: 'var(--space-md)',
                    marginBottom: 'var(--space-lg)'
                }}>
                    <div style={{
                        padding: 'var(--space-md)',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--border-radius-md)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                            Average
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                            {stats.avg}%
                        </div>
                    </div>
                    <div style={{
                        padding: 'var(--space-md)',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--border-radius-md)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                            Best Day
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>
                            {stats.best}%
                        </div>
                    </div>
                    <div style={{
                        padding: 'var(--space-md)',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--border-radius-md)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                            Perfect {activeTab === 'yearly' ? 'Months' : 'Days'}
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning)' }}>
                            {activeTab === 'yearly' ? stats.perfectMonths : stats.perfectDays}
                        </div>
                    </div>
                </div>
            )}

            <div className="analytics-chart-container" style={{ height: '300px' }}>
                {loading ? (
                    <Skeleton height={300} />
                ) : data && getChartData() ? (
                    <Line data={getChartData()} options={chartOptions} />
                ) : (
                    <div className="text-center text-secondary" style={{ paddingTop: '120px' }}>
                        <div style={{ fontSize: '2rem', marginBottom: 'var(--space-md)' }}>📊</div>
                        <div>No analytics data yet</div>
                        <div style={{ fontSize: '0.875rem', marginTop: 'var(--space-sm)' }}>
                            Complete some goals to see your progress!
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProgressAnalytics;
