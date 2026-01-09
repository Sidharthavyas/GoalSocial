import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { hapticImpactLight } from '../utils/haptics';
import { hapticImpactLight } from '../utils/haptics';

const BottomNav = () => {
    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/goals', label: 'Goals', icon: '🎯' },
        { path: '/pomodoro', label: 'Focus', icon: '⏱️' },
        { path: '/friends', label: 'Friends', icon: '👥' },
    ];

    return (
        <nav className="bottom-nav mobile-only" style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderTop: '1px solid var(--glass-border)',
            padding: '8px 16px 24px 16px', // Extra bottom padding for safe area
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            zIndex: 1000,
            boxShadow: '0 -4px 20px rgba(0,0,0,0.2)'
        }}>
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    onClick={hapticImpactLight}
                    to={item.path}
                    style={({ isActive }) => ({
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                        color: isActive ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        gap: '4px',
                        flex: 1,
                        padding: '8px',
                        transition: 'color 0.3s ease'
                    })}
                >
                    {({ isActive }) => (
                        <>
                            <motion.span
                                initial={{ scale: 1 }}
                                animate={{ scale: isActive ? 1.2 : 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                style={{ fontSize: '1.5rem', marginBottom: '2px' }}
                            >
                                {item.icon}
                            </motion.span>
                            <span>{item.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="bottomNavIndicator"
                                    style={{
                                        position: 'absolute',
                                        bottom: '4px', // Position indicator
                                        width: '4px',
                                        height: '4px',
                                        background: 'var(--accent-primary)',
                                        borderRadius: '50%'
                                    }}
                                />
                            )}
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    );
};

export default BottomNav;
