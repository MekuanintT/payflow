import api from './axios';

export async function getAttendance(params = {}) {
    const { data } = await api.get('/attendance', { params });
    return data;
}

export async function checkIn(employee_id, date) {
    const { data } = await api.post('/attendance/check-in', { employee_id, date });
    return data;
}

export async function checkOut(employee_id, date) {
    const { data } = await api.post('/attendance/check-out', { employee_id, date });
    return data;
}

export async function markAttendance(payload) {
    const { data } = await api.post('/attendance/mark', payload);
    return data;
}

export async function getAttendanceSummary(employee_id, month, year) {
    const params = { month, year };
    if (employee_id) params.employee_id = employee_id;
    const { data } = await api.get('/attendance/summary', { params });
    return data;
}