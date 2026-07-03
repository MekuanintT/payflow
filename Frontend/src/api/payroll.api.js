import api from './axios';

export async function getPayroll(params = {}) {
    const { data } = await api.get('/payroll', { params });
    return data;
}

export async function generatePayroll(employee_id, month, year) {
    const { data } = await api.post('/payroll/generate', { employee_id, month, year });
    return data;
}

export async function generatePayrollForAll(month, year) {
    const { data } = await api.post('/payroll/generate-all', { month, year });
    return data;
}

export async function approvePayroll(id) {
    const { data } = await api.put(`/payroll/${id}/approve`);
    return data;
}

export async function markPayrollPaid(id) {
    const { data } = await api.put(`/payroll/${id}/paid`);
    return data;
}

export async function downloadPayslip(id, filename) {
    const response = await api.get(`/payroll/${id}/payslip`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || `payslip-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}