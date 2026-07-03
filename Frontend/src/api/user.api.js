import api from './axios';

export async function getUsers() {
    const { data } = await api.get('/users');
    return data;
}

export async function createUser(payload) {
    const { data } = await api.post('/users', payload);
    return data;
}

export async function toggleUserActive(id) {
    const { data } = await api.put(`/users/${id}/toggle-active`);
    return data;
}