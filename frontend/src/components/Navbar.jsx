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
                            fontSize: '1.5rem'
                        }}>
                            GoalTracker
                        </h1>
                    </Link>

                    {/* Desktop Navigation */}
                    <ul className="nav-links desktop-only">
                        <li>
                            <Link to="/dashboard" className="nav-link">Dashboard</Link>
                        </li>
                        <li>
                            <Link to="/goals" className="nav-link">Goals</Link>
                        </li>
                        <li>
                            <Link to="/friends" className="nav-link">Friends</Link>
                        </li>
                        <li>
                            <Link to="/pomodoro" className="nav-link">
                                ⏱️ Focus
                            </Link>
                        </li>
                    </ul>

                    {/* Right Side - Always Visible */}
                    <div className="flex items-center gap-md">
                        {/* Notifications - Always Visible */}
                        <NotificationCenter />

                        {/* Theme Toggle - Desktop Only */}
                        <button
                            onClick={toggleTheme}
                            className="btn btn-secondary btn-sm desktop-only"
                            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                            style={{
                                padding: '8px 12px',
                                minWidth: '44px',
                                minHeight: '44px'
                            }}
                        >
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>

                        {/* Username - Always Visible */}
                        <span
                            className="text-secondary text-sm"
                            style={{
                                display: 'none'
                            }}
                        >
                            {user?.username}
                        </span>

                        {/* User Avatar/Initial - Always Visible */}
                        <div
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'var(--accent-gradient)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '1rem',
                                cursor: 'pointer'
                            }}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            title={user?.username}
                        >
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>

                        {/* Logout - Desktop Only */}
                        <button
                            onClick={handleLogout}
                            className="btn btn-secondary btn-sm desktop-only"
                            style={{
                                minWidth: '44px',
                                minHeight: '44px'
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
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
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            padding: '16px',
                            zIndex: 100,
                            minWidth: '200px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
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
