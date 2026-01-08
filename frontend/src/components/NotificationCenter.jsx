import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationCenter = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getNotificationIcon = (type) => {
        const icons = {
            streak_rescue: '🔥',
            future_self_reminder: '💭',
            almost_there: '🎯',
            silent_miss: '⏰',
            consistency_over_perfection: '💪',
            friend_pressure: '👥',
            one_tap_return: '⚡',
            friend_online: '🟢'
        };
        return icons[type] || '📢';
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            await markAsRead(notification._id);
        }

        // Navigate based on notification type
        if (notification.type === 'friend_online' && notification.metadata?.friendId) {
            navigate(`/friends/${notification.metadata.friendId}`);
        } else {
            navigate('/dashboard');
        }

        setIsOpen(false);
    };

    const handleDelete = async (e, notificationId) => {
        e.stopPropagation();
        await deleteNotification(notificationId);
    };

    const displayCount = unreadCount > 9 ? '9+' : unreadCount;

    const handleBellClick = () => {
        console.log('🔔 Notification bell clicked! Current isOpen:', isOpen);
        setIsOpen(!isOpen);
        console.log('🔔 Setting isOpen to:', !isOpen);
    };

    return (
        <div className="notification-center" ref={dropdownRef}>
            <button
                className="notification-bell"
                onClick={handleBellClick}
                aria-label="Notifications"
                style={{ position: 'relative', zIndex: 1001 }}
            >
                🔔
                {unreadCount > 0 && (
                    <span className="notification-badge">{displayCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                className="btn btn-sm btn-secondary"
                                onClick={markAllAsRead}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="notification-empty">
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification._id}
                                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="notification-icon">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="notification-content">
                                        <div className="notification-title">
                                            {notification.title}
                                        </div>
                                        <div className="notification-message">
                                            {notification.message}
                                        </div>
                                        <div className="notification-time">
                                            {new Date(notification.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: 'numeric',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                    <button
                                        className="notification-delete"
                                        onClick={(e) => handleDelete(e, notification._id)}
                                        aria-label="Delete notification"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
