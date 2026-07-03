const att = require('../models/attendance.model');

async function list(req, res) {
    try {
        const { employee_id, date, month, year } = req.query;
        const filters = { date, month, year };

        if (req.user.role === 'EMPLOYEE') {
            filters.employee_id = req.user.employee_id;
        } else {
            filters.employee_id = employee_id;
        }

        const records = await att.getAll(filters);
        res.json({ success: true, data: records });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch attendance: ' + err.message });
    }
}

async function checkIn(req, res) {
    const { employee_id, date } = req.body;
    if (!employee_id) {
        return res.status(400).json({ success: false, message: 'employee_id is required' });
    }
    try {
        const record = await att.checkIn(employee_id, date);
        res.status(201).json({ success: true, message: 'Checked in', data: record });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Check-in failed: ' + err.message });
    }
}

async function checkOut(req, res) {
    const { employee_id, date } = req.body;
    if (!employee_id) {
        return res.status(400).json({ success: false, message: 'employee_id is required' });
    }
    try {
        const record = await att.checkOut(employee_id, date);
        if (!record) {
            return res.status(404).json({ success: false, message: 'No check-in found for this date' });
        }
        res.json({ success: true, message: 'Checked out', data: record });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Check-out failed: ' + err.message });
    }
}

async function mark(req, res) {
    const { employee_id, date, status, note } = req.body;
    if (!employee_id || !date || !status) {
        return res.status(400).json({ success: false, message: 'employee_id, date, and status are required' });
    }
    try {
        const record = await att.markStatus(employee_id, date, status, note);
        res.json({ success: true, message: 'Attendance marked', data: record });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to mark attendance: ' + err.message });
    }
}

async function summary(req, res) {
    const { month, year } = req.query;
    let { employee_id } = req.query;

    if (req.user.role === 'EMPLOYEE') {
        employee_id = req.user.employee_id;
    }

    if (!employee_id || !month || !year) {
        return res.status(400).json({ success: false, message: 'employee_id, month, and year are required' });
    }
    try {
        const data = await att.getSummary(employee_id, month, year);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch summary: ' + err.message });
    }
}

module.exports = { list, checkIn, checkOut, mark, summary };