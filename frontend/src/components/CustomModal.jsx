import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomModal = ({ isOpen, onClose, title, message, type = 'info', onConfirm, confirmText = 'OK', cancelText = 'Cancel', showCancel = false }) => {
    const getIcon = () => {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'confirm': return '❓';
            default: return 'ℹ️';
        }
    };

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            width: '100vw',
                            height: '100vh',
                            background: 'rgba(0, 0, 0, 0.6)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            zIndex: 99999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px',
                            boxSizing: 'border-box',
                            overflow: 'auto'
                        }}
                    >
                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            transition={{
                                type: 'spring',
                                damping: 30,
                                stiffness: 400,
                                mass: 0.8
                            }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                position: 'relative',
                                background: 'var(--bg-secondary)',
                                border: '2px solid var(--border-color)',
                                borderRadius: '16px',
                                padding: '28px 24px',
                                maxWidth: '420px',
                                width: '100%',
                                margin: 'auto',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                                boxSizing: 'border-box'
                            }}
                        >
                            {/* Icon and Content */}
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <div style={{
                                    fontSize: '3.5rem',
                                    marginBottom: '16px',
                                    lineHeight: 1
                                }}>
                                    {getIcon()}
                                </div>
                                {title && (
                                    <h3 style={{
                                        margin: '0 0 12px 0',
                                        color: 'var(--text-primary)',
                                        fontSize: '1.35rem',
                                        fontWeight: 700,
                                        lineHeight: 1.3
                                    }}>
                                        {title}
                                    </h3>
                                )}
                                <p style={{
                                    margin: 0,
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.95rem',
                                    lineHeight: 1.6,
                                    maxWidth: '90%',
                                    marginLeft: 'auto',
                                    marginRight: 'auto'
                                }}>
                                    {message}
                                </p>
                            </div>

                            {/* Buttons */}
                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                justifyContent: 'center',
                                marginTop: '24px',
                                flexWrap: 'wrap'
                            }}>
                                {showCancel && (
                                    <button
                                        onClick={onClose}
                                        className="btn btn-secondary"
                                        style={{
                                            flex: '1 1 auto',
                                            minWidth: '120px',
                                            maxWidth: '160px',
                                            padding: '12px 20px',
                                            fontSize: '0.95rem',
                                            fontWeight: 600
                                        }}
                                    >
                                        {cancelText}
                                    </button>
                                )}
                                <button
                                    onClick={handleConfirm}
                                    className="btn btn-primary"
                                    style={{
                                        flex: '1 1 auto',
                                        minWidth: '120px',
                                        maxWidth: '160px',
                                        padding: '12px 20px',
                                        fontSize: '0.95rem',
                                        fontWeight: 600
                                    }}
                                    autoFocus
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CustomModal;
