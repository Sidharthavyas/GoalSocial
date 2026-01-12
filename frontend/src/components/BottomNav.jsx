import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { hapticImpactLight } from '../utils/haptics';

const BottomNav = () => {
    const navigate = useNavigate();
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/goals', label: 'Goals', icon: '🎯' },
        { path: '/challenges', label: 'Challenges', icon: '🏆' },
        { path: '/pomodoro', label: 'Focus', icon: '⏱️' },
        { path: '/friends', label: 'Friends', icon: '👥' },
    ];

    const handleTouchStart = (e) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const threshold = 50;

        if (Math.abs(distance) > threshold) {
            const currentIndex = navItems.findIndex(item => window.location.pathname === item.path);

            if (distance > 0 && currentIndex < navItems.length - 1) {
                // Swipe left - go to next
                navigate(navItems[currentIndex + 1].path);
                hapticImpactLight();
            } else if (distance < 0 && currentIndex > 0) {
                // Swipe right - go to previous
                navigate(navItems[currentIndex - 1].path);
                hapticImpactLight();
            }
        }

        setTouchStart(0);
        setTouchEnd(0);
    };

    return (
        <nav
            className="bottom-nav mobile-only"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'var(--bg-secondary)',
                borderTop: '1px solid var(--border-color)',
                padding: '8px 16px 24px 16px',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                zIndex: 1000,
                boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
                touchAction: 'pan-x'
            }}
        >
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
                                        bottom: '4px',
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
