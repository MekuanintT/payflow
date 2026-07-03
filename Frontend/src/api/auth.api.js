import api from './axios';

export async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
}

export async function logout() {
    const { data } = await api.post('/auth/logout');
    return data;
}

export async function changePassword(current_password, new_password) {
    const { data } = await api.put('/auth/change-password', { current_password, new_password });
    return data;
}

export async function forgotPassword(email) {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
}

export async function resetPassword(token, new_password) {
    const { data } = await api.post('/auth/reset-password', { token, new_password });
    return data;
}