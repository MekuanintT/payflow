const path = require('path');
const fs = require('fs');
const emp = require('../models/employee.model');

async function list(req, res) {
    try {
        if (req.user.role === 'EMPLOYEE') {
            const self = await emp.getById(req.user.employee_id);
            return res.json({ success: true, data: self ? [self] : [] });
        }
        const employees = await emp.getAll();
        res.json({ success: true, data: employees });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch employees: ' + err.message });
    }
}

async function getOne(req, res) {
    try {
        const employee = await emp.getById(req.params.id);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        res.json({ success: true, data: employee });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch employee: ' + err.message });
    }
}

async function add(req, res) {
    const { full_name, email, password, employee_code } = req.body;

    if (!full_name || !email || !password || !employee_code) {
        return res.status(400).json({
            success: false,
            message: 'full_name, email, password, and employee_code are required'
        });
    }

    try {
        const avatar_url = req.file ? `/uploads/avatars/${req.file.filename}` : null;
        const employee = await emp.create({ ...req.body, avatar_url });
        res.status(201).json({ success: true, message: 'Employee created', data: employee });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ success: false, message: 'Email or employee code already exists' });
        }
        res.status(500).json({ success: false, message: 'Failed to create employee: ' + err.message });
    }
}

async function edit(req, res) {
    try {
        const employee = await emp.update(req.params.id, req.body);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        res.json({ success: true, message: 'Employee updated', data: employee });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update employee: ' + err.message });
    }
}

async function uploadAvatar(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const avatarUrl = `/uploads/avatars/${req.file.filename}`;

        const existing = await emp.getById(req.params.id);
        if (existing?.avatar_url) {
            const oldPath = path.join(__dirname, '..', existing.avatar_url.replace(/^\//, ''));
            fs.unlink(oldPath, () => {});
        }

        const updated = await emp.updateAvatar(req.params.id, avatarUrl);
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        res.json({ success: true, message: 'Avatar updated', data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to upload avatar: ' + err.message });
    }
}

async function destroy(req, res) {
    try {
        const count = await emp.remove(req.params.id);
        if (count === 0) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        res.json({ success: true, message: 'Employee deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete employee: ' + err.message });
    }
}

async function editSalary(req, res) {
    try {
        const salary = await emp.updateSalary(req.params.id, req.body);
        if (!salary) {
            return res.status(404).json({ success: false, message: 'Salary record not found for this employee' });
        }
        res.json({ success: true, message: 'Salary updated', data: salary });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update salary: ' + err.message });
    }
}

module.exports = { list, getOne, add, edit, uploadAvatar, destroy, editSalary };