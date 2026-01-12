import React, { useState, useEffect } from 'react';
import CustomModal from './CustomModal';

const ModalProvider = () => {
    const [modalProps, setModalProps] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        showCancel: false,
        confirmText: 'OK',
        cancelText: 'Cancel',
        onConfirm: null,
        onClose: null
    });

    useEffect(() => {
        const handleShowModal = (event) => {
            setModalProps({
                ...event.detail,
                onClose: () => {
                    if (event.detail.onClose) event.detail.onClose();
                    setModalProps(prev => ({ ...prev, isOpen: false }));
                }
            });
        };

        window.addEventListener('showCustomModal', handleShowModal);
        return () => window.removeEventListener('showCustomModal', handleShowModal);
    }, []);

    return <CustomModal {...modalProps} />;
};

export default ModalProvider;
