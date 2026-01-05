import confetti from 'canvas-confetti';

/**
 * Celebration utilities for micro-interactions
 */

// Confetti on 100% completion
export const celebrateCompletion = () => {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#8b5cf6', '#10b981']
    });
};

// Confetti on streak milestone
export const celebrateStreak = (days) => {
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
        confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#f59e0b', '#ef4444']
        });
        confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#f59e0b', '#ef4444']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    };

    frame();
};

// Subtle success animation
export const celebrateSuccess = () => {
    confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#10b981', '#6366f1'],
        scalar: 0.8
    });
};

// Get streak milestone message
export const getStreakMessage = (days) => {
    if (days >= 30) return { emoji: '💎', text: 'Diamond Streak!', color: '#6366f1' };
    if (days >= 7) return { emoji: '⭐', text: 'One Week Strong!', color: '#8b5cf6' };
    if (days >= 3) return { emoji: '🔥', text: 'On Fire!', color: '#f59e0b' };
    return null;
};

// Trigger appropriate celebration
export const triggerCelebration = (type, data = {}) => {
    switch (type) {
        case 'completion':
            celebrateCompletion();
            break;
        case 'streak':
            celebrateStreak(data.days);
            break;
        case 'success':
            celebrateSuccess();
            break;
        default:
            break;
    }
};
