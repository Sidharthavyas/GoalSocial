import axios from 'axios';
import { getApiBaseUrl } from './capacitorConfig';

// Use capacitorConfig to get the right API URL for web vs mobile
const API_URL = getApiBaseUrl();

// Ensure no double slashes in URL - remove trailing slash from base URL
const baseURL = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

export const api = axios.create({
    baseURL: `${baseURL}/api`,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Cache keys prefix
const CACHE_PREFIX = 'api_cache_';

// Add auth token and cache logic
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle auth errors and offline caching
api.interceptors.response.use(
    (response) => {
        // Cache successful GET requests
        if (response.config.method === 'get' && response.status === 200) {
            try {
                const key = CACHE_PREFIX + response.config.url;
                localStorage.setItem(key, JSON.stringify({
                    data: response.data,
                    timestamp: Date.now()
                }));
            } catch (e) {
                // Quota exceeded or other error
                console.warn('Failed to cache response', e);
            }
        }
        return response;
    },
    async (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
            return Promise.reject(error);
        }

        // Offline / Network Error Fallback
        if (!error.response || error.code === 'ERR_NETWORK') {
            const originalRequest = error.config;
            if (originalRequest.method === 'get') {
                const key = CACHE_PREFIX + originalRequest.url;
                const cachedItem = localStorage.getItem(key);
                
                if (cachedItem) {
                    try {
                        const { data } = JSON.parse(cachedItem);
                        console.info('Serving cached data for', originalRequest.url);
                        // Return a fake response object with cached data
                        return Promise.resolve({
                            data,
                            status: 200,
                            statusText: 'OK (Cached)',
                            headers: {},
                            config: originalRequest,
                            isCached: true
                        });
                    } catch (e) {
                        console.error('Failed to parse cached data', e);
                    }
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;
