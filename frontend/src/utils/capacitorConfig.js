// Mobile API Configuration Helper
// This file helps manage API URLs for web vs mobile environments

import { Capacitor } from '@capacitor/core';

// Detect if running as native mobile app
export const isNative = Capacitor.isNativePlatform();

// Get the appropriate API base URL
export const getApiBaseUrl = () => {
    // Always use production HTTPS backend for mobile
    // For web, this will be overridden by Vite's proxy in development
    return 'https://goalsocial-1.onrender.com';
};

// Get WebSocket URL
export const getWsUrl = () => {
    if (isNative) {
        // Mobile: use production WebSocket on Render
        return 'https://goalsocial-1.onrender.com';
    } else {
        // Web: use environment variable or localhost
        return import.meta.env.VITE_WS_URL || 'http://localhost:5000';
    }
};

export default {
    isNative,
    getApiBaseUrl,
    getWsUrl
};
