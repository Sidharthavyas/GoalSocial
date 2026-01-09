import React, { useState, useEffect } from 'react';
import { getRandomMessage } from '../utils/motivationalMessages';

const MotivationalLoader = ({ maxDuration = 1000 }) => {
    const [message] = useState(getRandomMessage());
    const [visible, setVisible] = useState(true);

    // Array of motivational background images
    const backgrounds = [
        '/images/motivational/bg1.jpg',
        '/images/motivational/bg2.jpg',
        '/images/motivational/bg3.jpg',
        '/images/motivational/bg4.jpg',
        '/images/motivational/bg5.jpg'
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

        <div className="motivational-loader">
            {/* Ambient Blurred Background */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${background})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(30px)',
                    opacity: 0.6,
                    transform: 'scale(1.1)', // Prevent blur edges
                    zIndex: -1
                }}
            />

            {/* Content Container */}
            <div className="motivational-loader-content" style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1
            }}>
                {/* Main Image (Contained) */}
                <div
                    style={{
                        position: 'absolute',
                        inset: '20px',
                        backgroundImage: `url(${background})`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        zIndex: -1
                    }}
                />

                <div className="motivational-loader-icon" style={{ fontSize: '3rem', marginBottom: '1rem', textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>🚀</div>
                <div className="motivational-spinner" style={{ borderTopColor: 'var(--accent-primary)' }}></div>
            </div>
        </div>
    );

};

export default MotivationalLoader;
