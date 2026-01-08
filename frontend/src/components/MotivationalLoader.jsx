import React, { useState, useEffect } from 'react';
import { getRandomMessage } from '../utils/motivationalMessages';

const MotivationalLoader = ({ maxDuration = 1000 }) => {
    const [message] = useState(getRandomMessage());
    const [visible, setVisible] = useState(true);

    // Array of motivational gradient backgrounds that rotate each time
    const backgrounds = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)',
        'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
        'linear-gradient(135deg, #3f51b1 0%, #5a55ae 13%, #7b5fac 25%, #8f6aae 38%, #a86aa4 50%, #cc6b8e 62%, #f18271 75%, #f3a469 87%, #f7c978 100%)'
    ];

    const [background] = useState(backgrounds[Math.floor(Math.random() * backgrounds.length)]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
        }, maxDuration);

        return () => clearTimeout(timer);
    }, [maxDuration]);

    if (!visible) return null;

    return (
        <div className="motivational-loader" style={{ background }}>
            <div className="motivational-loader-content">
                <div className="motivational-loader-icon">🚀</div>
                <p className="motivational-loader-message">{message}</p>
                <div className="motivational-spinner"></div>
            </div>
        </div>
    );
};

export default MotivationalLoader;
