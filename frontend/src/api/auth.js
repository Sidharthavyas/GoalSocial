import api from '../utils/api';

export const register = async (username, email, password) => {
    const response = await api.post('/auth/register', {
        username,
        email,
        password
    });
    return response.data;
};

export const login = async (usernameOrEmail, password) => {
    const response = await api.post('/auth/login', {
        usernameOrEmail,
        password
    });
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};
