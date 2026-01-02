import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
};

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [events, setEvents] = useState([]);
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setConnected(false);
            }
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) return;

        const newSocket = io(WS_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        newSocket.on('connect', () => {
            console.log('✅ WebSocket connected');
            setConnected(true);

            // Authenticate
            newSocket.emit('authenticate', { token });
        });

        newSocket.on('authenticated', (data) => {
            console.log('✅ WebSocket authenticated:', data.user.username);
        });

        newSocket.on('disconnect', () => {
            console.log('❌ WebSocket disconnected');
            setConnected(false);
        });

        newSocket.on('error', (error) => {
            console.error('WebSocket error:', error);
        });

        // Listen to all server events
        [
            'user.online',
            'user.offline',
            'friend.accepted',
            'friend.requested',
            'goal.created',
            'goal.updated',
            'goal.deleted',
            'progress.updated',
            'comment.created',
            'reaction.created',
            'activity.new'
        ].forEach(eventName => {
            newSocket.on(eventName, (data) => {
                console.log(`📡 Received: ${eventName}`, data);
                setEvents(prev => [...prev, { type: eventName, data, timestamp: Date.now() }]);
            });
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [isAuthenticated, user]);

    const emit = (event, data) => {
        if (socket && connected) {
            socket.emit(event, data);
        } else {
            console.warn('Socket not connected, cannot emit:', event);
        }
    };

    const on = (event, callback) => {
        if (socket) {
            socket.on(event, callback);
            return () => socket.off(event, callback);
        }
    };

    const value = {
        socket,
        connected,
        emit,
        on,
        events
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
