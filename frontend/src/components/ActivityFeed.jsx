import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';

const ActivityFeed = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const { events } = useSocket();

    useEffect(() => {
        loadActivities();
    }, []);

    useEffect(() => {
        const latestEvent = events[events.length - 1];
        if (latestEvent && latestEvent.type === 'activity.new') {
            loadActivities();
        }
    }, [events]);

    const loadActivities = async () => {
        try {
            const response = await api.get('/activity?limit=20');
            setActivities(response.data.activities || []);
        } catch (error) {
            console.error('Failed to load activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActivityText = (activity) => {
        switch (activity.type) {
            case 'goal.created':
                return `created a new goal: "${activity.goal?.title}"`;
            case 'progress.updated':
                return `updated progress on "${activity.goal?.title}"`;
            case 'comment.created':
                return `commented on a ${activity.comment?.targetType}`;
            default:
                return 'performed an action';
        }
    };

    const getActivityIcon = (type) => {
        const icons = {
            'goal.created': '🎯',
            'progress.updated': '📈',
            'comment.created': '💬'
        };
        return icons[type] || '📌';
    };

    const getTimeAgo = (timestamp) => {
        const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);

        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    if (loading) {
        return (
            <div className="card">
                <h3>Activity Feed</h3>
                <div className="loading text-center">Loading activities...</div>
            </div>
        );
    }

    return (
        <div className="card">
            <h3 className="mb-md">Friend Activity</h3>

            {activities.length === 0 ? (
                <p className="text-secondary text-sm">
                    No recent activity. Add friends to see their progress!
                </p>
            ) : (
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {activities.map((activity, index) => (
                        <div
                            key={index}
                            className="flex gap-md p-md"
                            style={{
                                borderTop: index > 0 ? '1px solid var(--border-color)' : 'none',
                                alignItems: 'flex-start'
                            }}
                        >
                            <div style={{ fontSize: '1.25rem', flexShrink: 0 }}>{getActivityIcon(activity.type)}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="text-sm" style={{ wordBreak: 'break-word' }}>
                                    <span style={{ fontWeight: 600 }}>{activity.user?.username}</span>{' '}
                                    <span className="text-secondary">{getActivityText(activity)}</span>
                                </div>
                                <div className="text-tertiary text-sm mt-sm">
                                    {getTimeAgo(activity.timestamp)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ActivityFeed;
