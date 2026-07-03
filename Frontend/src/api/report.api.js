import api from './axios';

export async function getDashboardSummary() {
    const { data } = await api.get('/reports/dashboard');
    return data;
}

export async function getHeadcountByDepartment() {
    const { data } = await api.get('/reports/headcount');
    return data;
}

export async function getAttendanceTrend(month, year) {
    const { data } = await api.get('/reports/attendance-trend', { params: { month, year } });
    return data;
}

export async function getPayrollByDepartment(month, year) {
    const { data } = await api.get('/reports/payroll-by-department', { params: { month, year } });
    return data;
}

export async function getPayrollTrend(months = 6) {
    const { data } = await api.get('/reports/payroll-trend', { params: { months } });
    return data;
}

export async function getLeaveStats() {
    const { data } = await api.get('/reports/leave-stats');
    return data;
}