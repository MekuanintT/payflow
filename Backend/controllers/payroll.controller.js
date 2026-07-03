const payroll = require('../models/payroll.model');
const generatePayslip = require('../utils/generatePayslip');
const settingsModel = require('../models/settings.model');
const mailer = require('../utils/mailer');
async function list(req, res) {
    try {
        const { employee_id, month, year, status } = req.query;
        const filters = { month, year, status };

        if (req.user.role === 'EMPLOYEE') {
            filters.employee_id = req.user.employee_id;
        } else {
            filters.employee_id = employee_id;
        }

        const records = await payroll.getAll(filters);
        res.json({ success: true, data: records });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch payroll: ' + err.message });
    }
}
async function getOne(req, res) {
    try {
        const record = await payroll.getById(req.params.id);
        if (!record) {
            return res.status(404).json({ success: false, message: 'Payroll record not found' });
        }
        if (req.user.role === 'EMPLOYEE' && record.employee_id !== req.user.employee_id) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        res.json({ success: true, data: record });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch payroll record: ' + err.message });
    }
}
async function generateOne(req, res) {
    const { employee_id, month, year } = req.body;
    if (!employee_id || !month || !year) {
        return res.status(400).json({ success: false, message: 'employee_id, month, and year are required' });
    }
    try {
        const record = await payroll.generateForEmployee(employee_id, month, year, req.user.id);
        res.status(201).json({ success: true, message: 'Payroll generated', data: record });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to generate payroll: ' + err.message });
    }
}

async function generateAll(req, res) {
    const { month, year } = req.body;
    if (!month || !year) {
        return res.status(400).json({ success: false, message: 'month and year are required' });
    }
    try {
        const results = await payroll.generateForAll(month, year, req.user.id);
        res.status(201).json({ success: true, message: `Payroll generated for ${results.length} employees`, data: results });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to generate payroll: ' + err.message });
    }
}

async function approve(req, res) {
    try {
        const record = await payroll.updateStatus(req.params.id, 'APPROVED');
        if (!record) {
            return res.status(404).json({ success: false, message: 'Payroll record not found' });
        }
        res.json({ success: true, message: 'Payroll approved', data: record });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to approve payroll: ' + err.message });
    }
}

async function markPaid(req, res) {
    try {
        const record = await payroll.updateStatus(req.params.id, 'PAID');
        if (!record) {
            return res.status(404).json({ success: false, message: 'Payroll record not found' });
        }

        const fullRecord = await payroll.getById(record.id);
        if (fullRecord) {
            mailer.sendPayslipReadyEmail({
                to: fullRecord.email,
                full_name: fullRecord.full_name,
                month: fullRecord.month,
                year: fullRecord.year,
                net_salary: fullRecord.net_salary,
            });
        }

        res.json({ success: true, message: 'Payroll marked as paid', data: record });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update payroll: ' + err.message });
    }
}

async function downloadPayslip(req, res) {
    try {
        const record = await payroll.getById(req.params.id);
        if (!record) {
            return res.status(404).json({ success: false, message: 'Payroll record not found' });
        }
        if (req.user.role === 'EMPLOYEE' && record.employee_id !== req.user.employee_id) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        if (record.status !== 'PAID') {
            return res.status(400).json({ success: false, message: 'Payslip is only available once payroll is marked as PAID' });
        }

        const companySettings = await settingsModel.get();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="payslip-${record.employee_code}-${record.month}-${record.year}.pdf"`
        );

        generatePayslip(record, res, companySettings);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to generate payslip: ' + err.message });
    }
}
module.exports = { list, getOne, generateOne, generateAll, approve, markPaid, downloadPayslip };