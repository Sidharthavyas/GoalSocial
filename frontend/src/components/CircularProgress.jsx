import React from 'react';
import { motion } from 'framer-motion';

const CircularProgress = ({
    value = 0,
    max = 100,
    size = 120,
    strokeWidth = 10,
    color = "var(--accent-primary)",
    trackColor = "var(--bg-tertiary)",
    showText = true,
    children
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = Math.min(Math.max(value / max, 0), 1);
    const strokeDashoffset = circumference - progress * circumference;

    return (
        <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                style={{ transform: 'rotate(-90deg)' }}
            >
                {/* Track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={trackColor}
                    strokeWidth={strokeWidth}
                />
                {/* Progress */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    strokeLinecap="round"
                />
            </svg>
            {showText && (
                <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {children || (
                        <span style={{ fontSize: size * 0.25, fontWeight: 'bold', color: 'var(--text-primary)' }}>
                            {Math.round(value)}%
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default CircularProgress;
