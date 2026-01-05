import { useState } from 'react';

/**
 * Pomodoro Timer Hook - Opens/closes timer modal
 */
export const useFocusMode = () => {
    const [pomodoroOpen, setPomodoroOpen] = useState(false);

    const toggleFocusMode = () => {
        setPomodoroOpen(prev => !prev);
    };

    const closeFocusMode = () => {
        setPomodoroOpen(false);
    };

    return {
        focusMode: pomodoroOpen,
        toggleFocusMode,
        closeFocusMode
    };
};
