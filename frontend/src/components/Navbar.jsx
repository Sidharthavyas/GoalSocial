import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="container">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-lg">
                        <h1 style={{ margin: 0, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.5rem' }}>
                            GoalTracker
                        </h1>
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
                        </ul>
                    </div>
                    <div className="flex items-center gap-md">
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
