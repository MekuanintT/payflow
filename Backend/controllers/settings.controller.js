const path = require('path');
const fs = require('fs');
const settings = require('../models/settings.model');

async function get(req, res) {
    try {
        const data = await settings.get();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch settings: ' + err.message });
    }
}

async function update(req, res) {
    const { company_name } = req.body;
    if (!company_name) {
        return res.status(400).json({ success: false, message: 'company_name is required' });
    }
    try {
        const data = await settings.update(req.body);
        res.json({ success: true, message: 'Settings updated', data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update settings: ' + err.message });
    }
}

async function uploadLogo(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const logoUrl = `/uploads/logos/${req.file.filename}`;

        const existing = await settings.get();
        if (existing?.logo_url) {
            const oldPath = path.join(__dirname, '..', existing.logo_url.replace(/^\//, ''));
            fs.unlink(oldPath, () => {});
        }

        const updated = await settings.updateLogo(logoUrl);
        res.json({ success: true, message: 'Logo updated', data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to upload logo: ' + err.message });
    }
}

module.exports = { get, update, uploadLogo };