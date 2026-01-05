import { useState, useEffect } from 'react';

/**
 * Focus Mode Hook - Distraction-free view
 */
export const useFocusMode = () => {
    const [focusMode, setFocusMode] = useState(() => {
        const saved = localStorage.getItem('focusMode');
        return saved === 'true';
    });

    useEffect(() => {
        // Apply focus mode class to body
        if (focusMode) {
            document.body.classList.add('focus-mode');
        } else {
            document.body.classList.remove('focus-mode');
        }

        // Save to localStorage
        localStorage.setItem('focusMode', focusMode.toString());
    }, [focusMode]);

    // Keyboard shortcut: F key
    useEffect(() => {
        const handleKeyPress = (e) => {
            // Only trigger if not typing in an input
            if (e.key === 'f' && !e.ctrlKey && !e.metaKey &&
                e.target.tagName !== 'INPUT' &&
                e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                toggleFocusMode();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    const toggleFocusMode = () => {
        setFocusMode(prev => !prev);
    };

    return { focusMode, toggleFocusMode };
};
