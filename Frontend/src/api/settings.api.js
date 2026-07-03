import api from './axios';

export async function getSettings() {
    const { data } = await api.get('/settings');
    return data;
}

export async function updateSettings(payload) {
    const { data } = await api.put('/settings', payload);
    return data;
}

export async function uploadLogo(file) {
    const formData = new FormData();
    formData.append('logo', file);
    const { data } = await api.post('/settings/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
}