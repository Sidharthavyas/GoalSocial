import React from 'react';
import { motion } from 'framer-motion';
import { getStreakMessage } from '../utils/celebrations';

const StreakBadge = ({ days }) => {
    const milestone = getStreakMessage(days);

    if (!milestone || days < 3) return null;

    return (
        <motion.div
            className="badge"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            style={{
                background: `${milestone.color}20`,
                color: milestone.color,
                padding: 'var(--space-sm) var(--space-md)',
                fontSize: '0.875rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-xs)',
                borderRadius: 'var(--border-radius-md)',
                // animation removed in favor of motion
                boxShadow: `0 0 15px ${milestone.color}40`
            }}
        >
            <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                style={{ fontSize: '1.25rem', display: 'inline-block' }}
            >
                {milestone.emoji}
            </motion.span>
            <span>{days} Day Streak - {milestone.text}</span>
        </motion.div>
    );
};

export default StreakBadge;
