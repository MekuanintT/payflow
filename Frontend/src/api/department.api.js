import api from './axios';

export async function getDepartments() {
    const { data } = await api.get('/departments');
    return data;
}

export async function createDepartment(payload) {
    const { data } = await api.post('/departments', payload);
    return data;
}

export async function updateDepartment(id, payload) {
    const { data } = await api.put(`/departments/${id}`, payload);
    return data;
}

export async function deleteDepartment(id) {
    const { data } = await api.delete(`/departments/${id}`);
    return data;
}