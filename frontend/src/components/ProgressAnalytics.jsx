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
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/analytics/${activeTab}`);
            setData(response.data);
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const getChartData = () => {
        if (!data) return null;

        if (activeTab === 'weekly') {
            return {
                labels: data.days.map(d => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })),
                datasets: [
                    {
                        label: 'Completion %',
                        data: data.days.map(d => d.completionPercent),
                        borderColor: 'rgb(99, 102, 241)',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            };
        } else if (activeTab === 'monthly') {
            return {
                labels: data.days.map(d => new Date(d.date).getDate()),
                datasets: [
                    {
                        label: 'Completion %',
                        data: data.days.map(d => d.completionPercent),
                        borderColor: 'rgb(139, 92, 246)',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            };
        } else if (activeTab === 'yearly') {
            return {
                labels: data.months.map(m => m.monthName),
                datasets: [
                    {
                        label: 'Avg Completion %',
                        data: data.months.map(m => m.avgCompletionPercent),
                        borderColor: 'rgb(168, 85, 247)',
                        backgroundColor: 'rgba(168, 85, 247, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            };
        }
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    callback: (value) => value + '%'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    return (
        <div className="card" style={{ padding: 'var(--space-lg)' }}>
            <div className="flex items-center justify-between mb-md">
                <h3 style={{ margin: 0 }}>Progress Analytics</h3>
                <div className="analytics-tabs">
                    <button
                        className={`analytics-tab ${activeTab === 'weekly' ? 'active' : ''}`}
                        onClick={() => setActiveTab('weekly')}
                    >
                        Weekly
                    </button>
                    <button
                        className={`analytics-tab ${activeTab === 'monthly' ? 'active' : ''}`}
                        onClick={() => setActiveTab('monthly')}
                    >
                        Monthly
                    </button>
                    <button
                        className={`analytics-tab ${activeTab === 'yearly' ? 'active' : ''}`}
                        onClick={() => setActiveTab('yearly')}
                    >
                        Yearly
                    </button>
                </div>
            </div>

            <div className="analytics-chart-container" style={{ height: '300px' }}>
                {loading ? (
                    <Skeleton height={300} />
                ) : data && getChartData() ? (
                    <Line data={getChartData()} options={chartOptions} />
                ) : (
                    <div className="text-center text-secondary" style={{ paddingTop: '100px' }}>
                        No data available
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProgressAnalytics;
