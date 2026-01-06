import React, { useState, useEffect } from 'react';
import { getRandomMessage } from '../utils/motivationalMessages';

const MotivationalLoader = ({ maxDuration = 1000 }) => {
    const [message] = useState(getRandomMessage());
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
        }, maxDuration);

        return () => clearTimeout(timer);
    }, [maxDuration]);

    if (!visible) return null;

    return (
        <div className="motivational-loader">
            <div className="motivational-loader-content">
                <div className="motivational-loader-icon">✨</div>
                <p className="motivational-loader-message">{message}</p>
            </div>
        </div>
    );
};

export default MotivationalLoader;
