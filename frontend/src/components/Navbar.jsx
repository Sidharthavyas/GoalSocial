// components/Navbar.jsx
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
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
                    <div className="flex items-center gap-lg">
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
                        <ul className="nav-links">
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
                    </div>
                    <div className="flex items-center gap-md">
                        <button
                            onClick={toggleTheme}
                            className="btn btn-secondary btn-sm"
                            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                            style={{ padding: '8px 12px' }}
                        >
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>
                        <span className="text-secondary text-sm">
                            {user?.username}
                        </span>
                        <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;