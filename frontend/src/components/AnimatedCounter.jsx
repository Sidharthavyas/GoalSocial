import React, { useEffect, useState } from 'react';
import { animate } from 'framer-motion';

const AnimatedCounter = ({ from = 0, to, duration = 1, onUpdate }) => {
    const [displayValue, setDisplayValue] = useState(from);

    useEffect(() => {
        const controls = animate(from, to, {
            duration,
            onUpdate: (value) => {
                setDisplayValue(Math.round(value));
                if (onUpdate) onUpdate(Math.round(value));
            }
        });

        return () => controls.stop();
    }, [from, to, duration, onUpdate]);

    return <>{displayValue}</>;
};

export default AnimatedCounter;
