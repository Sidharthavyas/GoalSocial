import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../api/auth';
import { initPushNotifications } from '../utils/pushNotifications';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, []);

    const loadUser = async () => {
        try {
            const data = await getCurrentUser();
            setUser(data.user);

            // Initialize push notifications on mobile after user is loaded
            try {
                await initPushNotifications();
            } catch (error) {
                console.error('Failed to initialize push notifications:', error);
                // Don't fail user load if push notifications fail
            }
        } catch (error) {
            console.error('Failed to load user:', error);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (token, userData) => {
        localStorage.setItem('token', token);
        setUser(userData);

        // Initialize push notifications on mobile after login
        try {
            await initPushNotifications();
        } catch (error) {
            console.error('Failed to initialize push notifications:', error);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
