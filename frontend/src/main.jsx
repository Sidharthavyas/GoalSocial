import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './micro-interactions.css';
import './styles/new-components.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <AuthProvider>
            <SocketProvider>
                <App />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: 'var(--bg-card)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)',
                        },
                        success: {
                            iconTheme: {
                                primary: 'var(--success)',
                                secondary: 'var(--bg-card)',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: 'var(--error)',
                                secondary: 'var(--bg-card)',
                            },
                        },
                    }}
                />
            </SocketProvider>
        </AuthProvider>
    </React.StrictMode>
);
