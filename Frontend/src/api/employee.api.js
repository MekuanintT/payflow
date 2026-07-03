import api from './axios';

export async function getEmployees() {
    const { data } = await api.get('/employees');
    return data;
}

export async function getEmployee(id) {
    const { data } = await api.get(`/employees/${id}`);
    return data;
}

export async function createEmployee(payload) {
    const isFormData = payload instanceof FormData;
    const { data } = await api.post('/employees', payload, isFormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {}
    );
    return data;
}
export async function updateEmployee(id, payload) {
    const { data } = await api.put(`/employees/${id}`, payload);
    return data;
}

export async function deleteEmployee(id) {
    const { data } = await api.delete(`/employees/${id}`);
    return data;
}

export async function updateSalary(id, payload) {
    const { data } = await api.put(`/employees/${id}/salary`, payload);
    return data;
}

export async function uploadAvatar(id, file) {
    const formData = new FormData();
    formData.append('avatar', file);
    const { data } = await api.post(`/employees/${id}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
}

// export async function uploadAvatar(id, file) {
//     const formData = new FormData();
//     formData.append('avatar', file);
//     const { data } = await api.post(`/employees/${id}/avatar`, formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//     });
//     return data;
// }