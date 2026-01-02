import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Calendar from '../components/Calendar';
import ActivityFeed from '../components/ActivityFeed';
import { useSocket } from '../context/SocketContext';

const Dashboard = () => {
    const [goals, setGoals] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState({ total: 0, completed: 0, percentage: 0 });
    const [loading, setLoading] = useState(true);
    const { connected, events } = useSocket();

    useEffect(() => {
        loadData();
    }, []);

    // Listen for real-time updates
    useEffect(() => {
        const latestEvent = events[events.length - 1];
        if (latestEvent) {
            if (latestEvent.type === 'progress.updated' || latestEvent.type === 'goal.created') {
                loadData();
            }
        }
    }, [events]);

    const loadData = async () => {
        try {
            const [goalsRes, tasksRes] = await Promise.all([
                api.get('/goals'),
                api.get('/tasks')
            ]);

            setGoals(goalsRes.data.goals || []);
            setTasks(tasksRes.data.tasks || []);

            // Calculate stats
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayTasks = (tasksRes.data.tasks || []).filter(t => {
                const taskDate = new Date(t.date);
                taskDate.setHours(0, 0, 0, 0);
                return taskDate.getTime() === today.getTime();
            });

            const completed = todayTasks.filter(t => t.completed || t.percentage === 100).length;
            const total = todayTasks.length;

            setStats({
                total,
                completed,
                percentage: total > 0 ? Math.round((completed / total) * 100) : 0
            });
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
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
                    <span className={`badge ${connected ? 'badge-success' : 'badge-error'}`}>
                        {connected ? '🟢 Live' : '🔴 Offline'}
                    </span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-3 mb-lg">
                <div className="card">
                    <div className="text-tertiary text-sm mb-sm">Active Goals</div>
                    <div className="text-xl" style={{ fontWeight: 700 }}>{goals.length}</div>
                </div>
                <div className="card">
                    <div className="text-tertiary text-sm mb-sm">Today's Progress</div>
                    <div className="text-xl" style={{ fontWeight: 700 }}>{stats.completed} / {stats.total}</div>
                </div>
                <div className="card">
                    <div className="text-tertiary text-sm mb-sm">Completion Rate</div>
                    <div className="text-xl" style={{ fontWeight: 700 }}>{stats.percentage}%</div>
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
