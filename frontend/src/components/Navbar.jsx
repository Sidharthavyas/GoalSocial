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
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

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
                        <ul className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
                            <li>
                                <Link to="/dashboard" className="nav-link" onClick={closeMobileMenu}>Dashboard</Link>
                            </li>
                            <li>
                                <Link to="/goals" className="nav-link" onClick={closeMobileMenu}>Goals</Link>
                            </li>
                            <li>
                                <Link to="/friends" className="nav-link" onClick={closeMobileMenu}>Friends</Link>
                            </li>
                            <li>
                                <Link to="/pomodoro" className="nav-link" onClick={closeMobileMenu}>
                                    ⏱️ Focus
                                </Link>
                            </li>
                            {/* Mobile only actions */}
                            <li style={{ borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-md)', marginTop: 'var(--space-md)' }} className="mobile-only">
                                <button
                                    onClick={() => { toggleTheme(); closeMobileMenu(); }}
                                    className="btn btn-secondary"
                                    style={{ width: '100%', justifyContent: 'center' }}
                                >
                                    {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
                                </button>
                            </li>
                            <li className="mobile-only">
                                <button
                                    onClick={() => { handleLogout(); closeMobileMenu(); }}
                                    className="btn btn-secondary"
                                    style={{ width: '100%', justifyContent: 'center' }}
                                >
                                    Logout ({user?.username})
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div className="flex items-center gap-md desktop-only">
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
                    <button
                        className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>
            {/* Mobile menu overlay */}
            {mobileMenuOpen && (
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
            )}
        </nav>
    );
};

export default Navbar;