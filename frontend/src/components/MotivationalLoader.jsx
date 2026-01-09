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

        <div className="motivational-loader" style={{
            background: 'var(--bg-primary)',
            backgroundImage: 'radial-gradient(circle at 50% 50%, var(--bg-secondary), var(--bg-primary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'fixed',
            inset: 0,
            zIndex: 9999
        }}>
            <div className="motivational-loader-content" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
                padding: '2rem',
                textAlign: 'center'
            }}>
                <div className="motivational-loader-icon" style={{ fontSize: '3rem', marginBottom: '1rem', textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>🚀</div>
                <p className="motivational-loader-message" style={{
                    fontSize: '1.2rem',
                    fontWeight: 500,
                    marginBottom: '2rem',
                    maxWidth: '400px',
                    lineHeight: 1.5,
                    color: 'var(--text-primary)'
                }}>
                    {message}
                </p>
                <div className="motivational-spinner" style={{ borderTopColor: 'var(--accent-primary)' }}></div>
            </div>
        </div>
    );

};

export default MotivationalLoader;
