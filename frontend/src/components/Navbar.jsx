// components/Navbar.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import NotificationCenter from './NotificationCenter';
import BottomNav from './BottomNav';
import { useTheme } from '../hooks/useTheme';
import api from '../utils/api';
import { isNative } from '../utils/capacitorConfig';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [latestAndroidApkUrl, setLatestAndroidApkUrl] = useState(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        if (!isNative) return;

        let cancelled = false;

        const loadUpdateInfo = async () => {
            try {
                const res = await api.get('/app/updates?platform=android');
                const apkUrl = res?.data?.latest?.apkUrl || null;
                if (!cancelled) setLatestAndroidApkUrl(apkUrl);
            } catch {
                if (!cancelled) setLatestAndroidApkUrl(null);
            }
        };

        loadUpdateInfo();

        return () => {
            cancelled = true;
        };
    }, []);

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    // Hide navbar on pomodoro page for immersive experience
    const isPomodoroPage = location.pathname === '/pomodoro';

    if (isPomodoroPage) {
        return null;
    }

    return (
        <nav className="navbar">
            <div className="container">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                        <h1 style={{
                            margin: 0,
                            background: 'var(--accent-gradient)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontSize: '1.5rem',
                            fontWeight: 700
                        }}>
                            GoalTracker
                        </h1>
                    </Link>

                    {/* Right Side */}
                    <div className="flex items-center gap-md">
                        {/* Notifications */}
                        <NotificationCenter />

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="btn btn-secondary btn-sm"
                            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                            style={{
                                padding: '10px 14px',
                                minWidth: '44px',
                                minHeight: '44px'
                            }}
                        >
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>

                        {/* Hamburger Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="btn btn-secondary btn-sm"
                            style={{
                                padding: '10px 14px',
                                minWidth: '44px',
                                minHeight: '44px'
                            }}
                            aria-label="Menu"
                        >
                            {mobileMenuOpen ? '✕' : '☰'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Hamburger Menu Dropdown - For All Devices */}
            {mobileMenuOpen && (
                <>
                    {/* Overlay */}
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 99
                        }}
                        onClick={closeMobileMenu}
                    />

                    {/* Menu */}
                    <div
                        style={{
                            position: 'fixed',
                            top: '60px',
                            right: '16px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            padding: '16px',
                            zIndex: 100,
                            minWidth: '220px',
                            maxWidth: '280px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                        }}
                    >
                        {/* User Info */}
                        <div style={{
                            padding: '12px',
                            borderBottom: '1px solid var(--border-color)',
                            marginBottom: '12px'
                        }}>
                            <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                                {user?.username}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                {user?.email}
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <Link
                                to="/dashboard"
                                onClick={closeMobileMenu}
                                style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    color: 'var(--text-primary)',
                                    background: location.pathname === '/dashboard' ? 'var(--bg-tertiary)' : 'transparent'
                                }}
                            >
                                📊 Dashboard
                            </Link>
                            <Link
                                to="/goals"
                                onClick={closeMobileMenu}
                                style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    color: 'var(--text-primary)',
                                    background: location.pathname === '/goals' ? 'var(--bg-tertiary)' : 'transparent'
                                }}
                            >
                                🎯 Goals
                            </Link>
                            <Link
                                to="/friends"
                                onClick={closeMobileMenu}
                                style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    color: 'var(--text-primary)',
                                    background: location.pathname === '/friends' ? 'var(--bg-tertiary)' : 'transparent'
                                }}
                            >
                                👥 Friends
                            </Link>
                            <Link
                                to="/pomodoro"
                                onClick={closeMobileMenu}
                                style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    color: 'var(--text-primary)',
                                    background: location.pathname === '/pomodoro' ? 'var(--bg-tertiary)' : 'transparent'
                                }}
                            >
                                ⏱️ Focus Mode
                            </Link>
                        </div>

                        {/* Actions */}
                        <div style={{
                            borderTop: '1px solid var(--border-color)',
                            marginTop: '12px',
                            paddingTop: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                        }}>
                            {isNative && latestAndroidApkUrl && (
                                <button
                                    onClick={() => {
                                        window.open(latestAndroidApkUrl, '_blank', 'noopener,noreferrer');
                                        closeMobileMenu();
                                    }}
                                    className="btn btn-primary"
                                    style={{
                                        width: '100%',
                                        justifyContent: 'center',
                                        minHeight: '44px'
                                    }}
                                >
                                    Update App
                                </button>
                            )}
                            <button
                                onClick={() => { toggleTheme(); closeMobileMenu(); }}
                                className="btn btn-secondary"
                                style={{
                                    width: '100%',
                                    justifyContent: 'center',
                                    minHeight: '44px'
                                }}
                            >
                                {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
                            </button>
                            <button
                                onClick={() => { handleLogout(); closeMobileMenu(); }}
                                className="btn btn-danger"
                                style={{
                                    width: '100%',
                                    justifyContent: 'center',
                                    minHeight: '44px'
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </>
            )}
            {/* Mobile Bottom Navigation */}
            <BottomNav />
        </nav>
    );
};

export default Navbar;
