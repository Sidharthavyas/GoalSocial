import toast from 'react-hot-toast';

// Theme-aware toast notifications
export const showToast = {
    success: (message) => {
        toast.success(message, {
            duration: 3000,
            style: {
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--success)',
            },
            iconTheme: {
                primary: 'var(--success)',
                secondary: 'var(--bg-secondary)',
            },
        });
    },

    error: (message) => {
        toast.error(message, {
            duration: 4000,
            style: {
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--error)',
            },
            iconTheme: {
                primary: 'var(--error)',
                secondary: 'var(--bg-secondary)',
            },
        });
    },

    loading: (message) => {
        return toast.loading(message, {
            style: {
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
            },
        });
    },

    promise: (promise, messages) => {
        return toast.promise(
            promise,
            {
                loading: messages.loading,
                success: messages.success,
                error: messages.error,
            },
            {
                style: {
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                },
                success: {
                    iconTheme: {
                        primary: 'var(--success)',
                        secondary: 'var(--bg-secondary)',
                    },
                },
                error: {
                    iconTheme: {
                        primary: 'var(--error)',
                        secondary: 'var(--bg-secondary)',
                    },
                },
            }
        );
    },

    custom: (message, icon = '📢') => {
        toast(message, {
            icon,
            duration: 3000,
            style: {
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--accent-primary)',
            },
        });
    },
};

export default showToast;
