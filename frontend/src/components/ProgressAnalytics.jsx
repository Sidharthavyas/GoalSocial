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
        layout: {
            padding: {
                left: window.innerWidth < 768 ? 5 : 10,
                right: window.innerWidth < 768 ? 5 : 10,
                top: 10,
                bottom: window.innerWidth < 768 ? 5 : 10
            }
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim() || 'rgba(10, 10, 10, 0.95)',
                padding: window.innerWidth < 768 ? 10 : 16,
                titleColor: 'rgb(124, 179, 138)',
                titleFont: {
                    size: window.innerWidth < 768 ? 11 : 14,
                    weight: 600
                },
                bodyColor: '#fff',
                bodyFont: {
                    size: window.innerWidth < 768 ? 10 : 13
                },
                borderColor: 'rgba(124, 179, 138, 0.3)',
                borderWidth: 1,
                displayColors: false,
                callbacks: {
                    label: function (context) {
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
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || 'rgba(255, 255, 255, 0.7)',
                    font: {
                        size: window.innerWidth < 768 ? 10 : 12
                    },
                    stepSize: window.innerWidth < 768 ? 50 : 25,
                    padding: window.innerWidth < 768 ? 4 : 8
                },
                grid: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false
                },
                border: {
                    display: false
                }
            },
            x: {
                ticks: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-tertiary').trim() || 'rgba(255, 255, 255, 0.6)',
                    font: {
                        size: window.innerWidth < 768 ? 9 : 12
                    },
                    maxRotation: window.innerWidth < 768 ? 45 : 0,
                    minRotation: window.innerWidth < 768 ? 45 : 0,
                    autoSkip: true,
                    maxTicksLimit: window.innerWidth < 768 ? 6 : undefined,
                    padding: window.innerWidth < 768 ? 2 : 5
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
        <div className="card" style={{ padding: 'var(--space-md)' }}>
            <div className="flex items-center justify-between mb-lg" style={{ flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Progress Analytics</h3>
                <div className="analytics-tabs" style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '8px' }}>
                    <button
                        className={`btn-tab ${activeTab === 'weekly' ? 'active' : ''}`}
                        onClick={() => setActiveTab('weekly')}
                        style={{ padding: '4px 12px', fontSize: '0.8rem', borderRadius: '6px', border: 'none', background: activeTab === 'weekly' ? 'var(--bg-card)' : 'transparent', color: activeTab === 'weekly' ? 'var(--text-primary)' : 'var(--text-tertiary)', cursor: 'pointer' }}
                    >
                        Week
                    </button>
                    <button
                        className={`btn-tab ${activeTab === 'monthly' ? 'active' : ''}`}
                        onClick={() => setActiveTab('monthly')}
                        style={{ padding: '4px 12px', fontSize: '0.8rem', borderRadius: '6px', border: 'none', background: activeTab === 'monthly' ? 'var(--bg-card)' : 'transparent', color: activeTab === 'monthly' ? 'var(--text-primary)' : 'var(--text-tertiary)', cursor: 'pointer' }}
                    >
                        Month
                    </button>
                    <button
                        className={`btn-tab ${activeTab === 'yearly' ? 'active' : ''}`}
                        onClick={() => setActiveTab('yearly')}
                        style={{ padding: '4px 12px', fontSize: '0.8rem', borderRadius: '6px', border: 'none', background: activeTab === 'yearly' ? 'var(--bg-card)' : 'transparent', color: activeTab === 'yearly' ? 'var(--text-primary)' : 'var(--text-tertiary)', cursor: 'pointer' }}
                    >
                        Year
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="loading-spinner"></div>
                </div>
            ) : !data ? (
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                    No data available
                </div>
            ) : (
                <>
                    {/* Summary Stats */}
                    {stats && (
                        <div className="grid" style={{
                            gridTemplateColumns: window.innerWidth < 480 ? 'repeat(3, 1fr)' : 'repeat(auto-fit, minmax(120px, 1fr))',
                            gap: window.innerWidth < 768 ? '8px' : 'var(--space-md)',
                            marginBottom: 'var(--space-lg)'
                        }}>
                            <div style={{
                                padding: window.innerWidth < 480 ? '8px' : 'var(--space-md)',
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--border-radius-md)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: window.innerWidth < 480 ? '0.65rem' : '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                                    Avg
                                </div>
                                <div style={{ fontSize: window.innerWidth < 480 ? '1.2rem' : '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {stats.avg}%
                                </div>
                            </div>
                            <div style={{
                                padding: window.innerWidth < 480 ? '8px' : 'var(--space-md)',
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--border-radius-md)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: window.innerWidth < 480 ? '0.65rem' : '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                                    Best
                                </div>
                                <div style={{ fontSize: window.innerWidth < 480 ? '1.2rem' : '1.5rem', fontWeight: 700, color: 'var(--success)' }}>
                                    {stats.best}%
                                </div>
                            </div>
                            <div style={{
                                padding: window.innerWidth < 480 ? '8px' : 'var(--space-md)',
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--border-radius-md)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: window.innerWidth < 480 ? '0.65rem' : '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                                    Perfect
                                </div>
                                <div style={{ fontSize: window.innerWidth < 480 ? '1.2rem' : '1.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                                    {activeTab === 'yearly' ? stats.perfectMonths : stats.perfectDays}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="analytics-chart-container" style={{ height: window.innerWidth < 768 ? '250px' : '300px', width: '100%', position: 'relative' }}>
                        <Line data={getChartData()} options={chartOptions} />
                    </div>
                </>
            )}
        </div>
    );
};

export default ProgressAnalytics;
