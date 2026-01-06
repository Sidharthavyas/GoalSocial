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

// Add auth token to requests
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

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
