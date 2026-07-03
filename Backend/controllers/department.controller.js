const dept = require('../models/department.model');

async function list(req, res) {
    try {
        const departments = await dept.getAll();
        res.json({ success: true, data: departments });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch departments: ' + err.message });
    }
}

async function getOne(req, res) {
    try {
        const department = await dept.getById(req.params.id);
        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }
        res.json({ success: true, data: department });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch department: ' + err.message });
    }
}

async function add(req, res) {
    const { name, description } = req.body;
    if (!name) {
        return res.status(400).json({ success: false, message: 'Department name is required' });
    }
    try {
        const department = await dept.create(name.trim(), description);
        res.status(201).json({ success: true, message: 'Department created', data: department });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ success: false, message: 'Department name already exists' });
        }
        res.status(500).json({ success: false, message: 'Failed to create department: ' + err.message });
    }
}

async function edit(req, res) {
    const { name, description } = req.body;
    if (!name) {
        return res.status(400).json({ success: false, message: 'Department name is required' });
    }
    try {
        const department = await dept.update(req.params.id, name.trim(), description);
        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }
        res.json({ success: true, message: 'Department updated', data: department });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update department: ' + err.message });
    }
}

async function destroy(req, res) {
    try {
        const count = await dept.remove(req.params.id);
        if (count === 0) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }
        res.json({ success: true, message: 'Department deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete department: ' + err.message });
    }
}

module.exports = { list, getOne, add, edit, destroy };