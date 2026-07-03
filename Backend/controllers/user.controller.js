const userModel = require('../models/user.model');

const ALLOWED_CREATE_ROLES = ['SUPER_ADMIN', 'HR_MANAGER'];

async function list(req, res) {
    try {
        const users = await userModel.getAll();
        res.json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch users: ' + err.message });
    }
}

async function create(req, res) {
    const { full_name, email, password, role } = req.body;

    if (!full_name || !email || !password || !role) {
        return res.status(400).json({
            success: false,
            message: 'full_name, email, password, and role are required'
        });
    }

    if (!ALLOWED_CREATE_ROLES.includes(role)) {
        return res.status(400).json({
            success: false,
            message: 'role must be SUPER_ADMIN or HR_MANAGER'
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters'
        });
    }

    try {
        const user = await userModel.create({ full_name, email, password, role });
        res.status(201).json({ success: true, message: `${role.replace('_', ' ')} account created`, data: user });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ success: false, message: 'Email already in use' });
        }
        res.status(500).json({ success: false, message: 'Failed to create user: ' + err.message });
    }
}

async function toggleActive(req, res) {
    try {
        const targetId = parseInt(req.params.id, 10);

        const target = await userModel.getById(targetId);
        if (!target) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!ALLOWED_CREATE_ROLES.includes(target.role)) {
            return res.status(403).json({
                success: false,
                message: 'Only HR Manager and Super Admin accounts can be deactivated from this page'
            });
        }

        if (targetId === req.user.id && target.is_active) {
            return res.status(400).json({
                success: false,
                message: 'You cannot deactivate your own account'
            });
        }

        const updated = await userModel.setActive(targetId, !target.is_active);
        res.json({
            success: true,
            message: `Account ${updated.is_active ? 'activated' : 'deactivated'}`,
            data: updated
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update account status: ' + err.message });
    }
}

module.exports = { list, create, toggleActive };