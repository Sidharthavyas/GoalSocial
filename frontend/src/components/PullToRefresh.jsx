import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const PullToRefresh = ({ onRefresh, children }) => {
    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const containerRef = useRef(null);

    const THRESHOLD = 80;

    const handleTouchStart = (e) => {
        if (containerRef.current && containerRef.current.scrollTop === 0) {
            setStartY(e.touches[0].clientY);
        }
    };

    const handleTouchMove = (e) => {
        if (refreshing || (containerRef.current && containerRef.current.scrollTop > 0)) return;

        const touchY = e.touches[0].clientY;
        const diff = touchY - startY;

        if (diff > 0 && startY > 0) {
            setCurrentY(Math.min(diff * 0.5, THRESHOLD * 1.5));
        }
    };

    const handleTouchEnd = async () => {
        if (currentY > THRESHOLD && !refreshing) {
            setRefreshing(true);
            setCurrentY(60);
            try {
                await onRefresh();
            } finally {
                setTimeout(() => {
                    setRefreshing(false);
                    setCurrentY(0);
                }, 500);
            }
        } else {
            setCurrentY(0);
        }
        setStartY(0);
    };

    return (
        <div
            className="pull-to-refresh-container"
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ height: '100%', overflowY: 'auto', position: 'relative' }}
        >
            <motion.div
                style={{
                    height: currentY,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%'
                }}
                initial={false}
                animate={{ height: currentY }}
            >
                {refreshing ? (
                    <div className="loading-spinner" />
                ) : (
                    <div style={{ transform: `rotate(${currentY * 3}deg)`, opacity: currentY / THRESHOLD }}>
                        ⬇️
                    </div>
                )}
            </motion.div>
            {children}
        </div>
    );
};

export default PullToRefresh;
