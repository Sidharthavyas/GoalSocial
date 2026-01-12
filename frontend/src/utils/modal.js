// Custom modal utility to replace browser alerts/confirms
let modalRoot = null;
let currentModal = null;

const createModalRoot = () => {
    if (!modalRoot) {
        modalRoot = document.createElement('div');
        modalRoot.id = 'custom-modal-root';
        document.body.appendChild(modalRoot);
    }
    return modalRoot;
};

export const showAlert = (message, title = 'Notice', type = 'info') => {
    return new Promise((resolve) => {
        const event = new CustomEvent('showCustomModal', {
            detail: {
                isOpen: true,
                title,
                message,
                type,
                showCancel: false,
                onConfirm: () => resolve(true),
                onClose: () => resolve(true)
            }
        });
        window.dispatchEvent(event);
    });
};

export const showConfirm = (message, title = 'Confirm', type = 'confirm') => {
    return new Promise((resolve) => {
        const event = new CustomEvent('showCustomModal', {
            detail: {
                isOpen: true,
                title,
                message,
                type,
                showCancel: true,
                confirmText: 'Yes',
                cancelText: 'No',
                onConfirm: () => resolve(true),
                onClose: () => resolve(false)
            }
        });
        window.dispatchEvent(event);
    });
};

export const showSuccess = (message, title = 'Success') => {
    return showAlert(message, title, 'success');
};

export const showError = (message, title = 'Error') => {
    return showAlert(message, title, 'error');
};

export const showWarning = (message, title = 'Warning') => {
    return showAlert(message, title, 'warning');
};

export default {
    alert: showAlert,
    confirm: showConfirm,
    success: showSuccess,
    error: showError,
    warning: showWarning
};
