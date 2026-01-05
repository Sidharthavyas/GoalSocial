import React from 'react';
import { getStreakMessage } from '../utils/celebrations';

const StreakBadge = ({ days }) => {
    const milestone = getStreakMessage(days);

    if (!milestone || days < 3) return null;

    return (
        <div
            className="badge"
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
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
        >
            <span style={{ fontSize: '1.25rem' }}>{milestone.emoji}</span>
            <span>{days} Day Streak - {milestone.text}</span>
        </div>
    );
};

export default StreakBadge;
