import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const BottomSheet = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <>
            <div
                className={`bottom-sheet-overlay ${isOpen ? 'open' : ''}`}
                onClick={onClose}
            />
            <div className={`bottom-sheet ${isOpen ? 'open' : ''}`}>
                <div className="bottom-sheet-handle" />
                {title && (
                    <div style={{ marginBottom: '16px', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        {title}
                    </div>
                )}
                <div className="bottom-sheet-content">
                    {children}
                </div>
            </div>
        </>,
        document.body
    );
};

export default BottomSheet;
