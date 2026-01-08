import React, { useState, useEffect } from 'react';
import { getRandomMessage } from '../utils/motivationalMessages';

const MotivationalLoader = ({ maxDuration = 1000 }) => {
    const [message] = useState(getRandomMessage());
    const [visible, setVisible] = useState(true);

    // Array of motivational background images
    const backgrounds = [
        '/images/motivational/bg1.png',
        '/images/motivational/bg2.png',
        '/images/motivational/bg3.png',
        '/images/motivational/bg4.png',
        '/images/motivational/bg5.png'
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
        <div
            className="motivational-loader"
            style={{
                backgroundImage: `url(${background})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            <div className="motivational-loader-content">
                <div className="motivational-loader-icon">🚀</div>
                <p className="motivational-loader-message">{message}</p>
                <div className="motivational-spinner"></div>
            </div>
        </div>
    );
};

export default MotivationalLoader;
