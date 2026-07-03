const reports = require('../models/report.model');

async function dashboard(req, res) {
    try {
        const data = await reports.dashboardSummary();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard summary: ' + err.message });
    }
}

async function byDepartment(req, res) {
    const { month, year } = req.query;
    if (!month || !year) {
        return res.status(400).json({ success: false, message: 'month and year are required' });
    }
    try {
        const data = await reports.payrollByDepartment(month, year);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch department report: ' + err.message });
    }
}

async function headcount(req, res) {
    try {
        const data = await reports.headcountByDepartment();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch headcount: ' + err.message });
    }
}

async function attendanceTrend(req, res) {
    const { month, year } = req.query;
    if (!month || !year) {
        return res.status(400).json({ success: false, message: 'month and year are required' });
    }
    try {
        const data = await reports.attendanceTrend(month, year);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch attendance trend: ' + err.message });
    }
}

async function payrollTrend(req, res) {
    const months = parseInt(req.query.months, 10) || 6;
    try {
        const data = await reports.payrollTrend(months);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch payroll trend: ' + err.message });
    }
}

async function leaveStats(req, res) {
    try {
        const data = await reports.leaveStats();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch leave stats: ' + err.message });
    }
}

module.exports = { dashboard, byDepartment, headcount, attendanceTrend, payrollTrend, leaveStats };