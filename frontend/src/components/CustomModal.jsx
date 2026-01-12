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
                    <motion.div
                        className="modal-overlay"
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
                            background: 'rgba(0, 0, 0, 0.5)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    />
                    <motion.div
                        className="custom-modal"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--space-lg)',
                            maxWidth: '400px',
                            width: '90%',
                            zIndex: 10000,
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                        }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: 'var(--space-md)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-sm)' }}>
                                {getIcon()}
                            </div>
                            {title && (
                                <h3 style={{
                                    margin: 0,
                                    marginBottom: 'var(--space-sm)',
                                    color: 'var(--text-primary)',
                                    fontSize: '1.25rem',
                                    fontWeight: 600
                                }}>
                                    {title}
                                </h3>
                            )}
                            <p style={{
                                margin: 0,
                                color: 'var(--text-secondary)',
                                fontSize: '0.95rem',
                                lineHeight: 1.5
                            }}>
                                {message}
                            </p>
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: 'var(--space-sm)',
                            justifyContent: 'center',
                            marginTop: 'var(--space-lg)'
                        }}>
                            {showCancel && (
                                <button
                                    onClick={onClose}
                                    className="btn btn-secondary"
                                    style={{ flex: 1, maxWidth: '150px' }}
                                >
                                    {cancelText}
                                </button>
                            )}
                            <button
                                onClick={handleConfirm}
                                className="btn btn-primary"
                                style={{ flex: 1, maxWidth: '150px' }}
                                autoFocus
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CustomModal;
