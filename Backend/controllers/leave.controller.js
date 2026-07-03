const leave = require('../models/leave.model');
const mailer = require('../utils/mailer');

async function list(req, res) {
    try {
        const { employee_id, status } = req.query;
        const filters = { status };

        if (req.user.role === 'EMPLOYEE') {
            filters.employee_id = req.user.employee_id;
        } else {
            filters.employee_id = employee_id;
        }

        const records = await leave.getAll(filters);
        res.json({ success: true, data: records });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch leaves: ' + err.message });
    }
}

async function getOne(req, res) {
    try {
        const record = await leave.getById(req.params.id);
        if (!record) {
            return res.status(404).json({ success: false, message: 'Leave request not found' });
        }
        res.json({ success: true, data: record });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch leave: ' + err.message });
    }
}

async function add(req, res) {
    const { employee_id, start_date, end_date, days } = req.body;
    if (!employee_id || !start_date || !end_date || !days) {
        return res.status(400).json({
            success: false,
            message: 'employee_id, start_date, end_date, and days are required'
        });
    }
    try {
        const record = await leave.create(req.body);
        res.status(201).json({ success: true, message: 'Leave request submitted', data: record });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to submit leave request: ' + err.message });
    }
}

async function approve(req, res) {
    try {
        const record = await leave.review(req.params.id, 'APPROVED', req.user.id);
        if (!record) {
            return res.status(404).json({ success: false, message: 'Leave request not found' });
        }

        const fullRecord = await leave.getById(record.id);
        if (fullRecord) {
            mailer.sendLeaveApprovedEmail({
                to: fullRecord.email,
                full_name: fullRecord.full_name,
                leave_type: fullRecord.leave_type,
                start_date: fullRecord.start_date,
                end_date: fullRecord.end_date,
                days: fullRecord.days,
            });
        }

        res.json({ success: true, message: 'Leave approved', data: record });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to approve leave: ' + err.message });
    }
}
async function reject(req, res) {
    try {
        const record = await leave.review(req.params.id, 'REJECTED', req.user.id);
        if (!record) {
            return res.status(404).json({ success: false, message: 'Leave request not found' });
        }

        const fullRecord = await leave.getById(record.id);
        if (fullRecord) {
            mailer.sendLeaveRejectedEmail({
                to: fullRecord.email,
                full_name: fullRecord.full_name,
                leave_type: fullRecord.leave_type,
                start_date: fullRecord.start_date,
                end_date: fullRecord.end_date,
            });
        }

        res.json({ success: true, message: 'Leave rejected', data: record });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to reject leave: ' + err.message });
    }
}
async function destroy(req, res) {
    try {
        const count = await leave.remove(req.params.id);
        if (count === 0) {
            return res.status(404).json({ success: false, message: 'Leave request not found' });
        }
        res.json({ success: true, message: 'Leave request deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete leave: ' + err.message });
    }
}

module.exports = { list, getOne, add, approve, reject, destroy };