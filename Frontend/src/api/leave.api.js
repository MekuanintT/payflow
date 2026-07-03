import api from './axios';

export async function getLeaves(params = {}) {
    const { data } = await api.get('/leaves', { params });
    return data;
}

export async function createLeave(payload) {
    const { data } = await api.post('/leaves', payload);
    return data;
}

export async function approveLeave(id) {
    const { data } = await api.put(`/leaves/${id}/approve`);
    return data;
}

export async function rejectLeave(id) {
    const { data } = await api.put(`/leaves/${id}/reject`);
    return data;
}

export async function deleteLeave(id) {
    const { data } = await api.delete(`/leaves/${id}`);
    return data;
}