const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {
    findUserByEmail, updateLastLogin, findUserById,
    updatePassword, saveResetToken, findUserByResetToken, clearResetToken
} = require('../models/auth.model');
const { sendMail } = require('../utils/sendEmail');

async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
    try {
        const user = await findUserByEmail(email);
        if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        if (!user.is_active) return res.status(403).json({ success: false, message: 'Account is deactivated' });
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        await updateLastLogin(user.id);
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, full_name: user.full_name, employee_id: user.employee_id || null },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '12h' }
        );
        res.json({
            success: true, message: 'Login successful', token,
            user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role, employee_id: user.employee_id || null }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Authentication failed: ' + err.message });
    }
}

function logout(req, res) {
    res.json({ success: true, message: 'Logged out' });
}

async function changePassword(req, res) {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) return res.status(400).json({ success: false, message: 'current_password and new_password are required' });
    if (new_password.length < 6) return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    try {
        const user = await findUserById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        const valid = await bcrypt.compare(current_password, user.password);
        if (!valid) return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        const hashed = await bcrypt.hash(new_password, 10);
        await updatePassword(req.user.id, hashed);
        res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to change password: ' + err.message });
    }
}

async function forgotPassword(req, res) {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
    try {
        const user = await findUserByEmail(email);
        if (!user) return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000);
        await saveResetToken(email, token, expires);
        const resetUrl = process.env.FRONTEND_URL + '/reset-password?token=' + token;
        await sendMail({
            to: email,
            subject: 'Reset your PayFlow password',
            html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;">
                <h2 style="color:#0f172a;">Password Reset</h2>
                <p>Hi ${user.full_name || 'there'},</p>
                <p>Click below to reset your PayFlow password:</p>
                <a href="${resetUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#2B2B2B;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
                    Reset Password
                </a>
                <p style="color:#94a3b8;font-size:13px;">Expires in 1 hour. If you did not request this, ignore this email.</p>
            </div>`,
        });
        res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to send reset email: ' + err.message });
    }
}

async function resetPassword(req, res) {
    const { token, new_password } = req.body;
    if (!token || !new_password) return res.status(400).json({ success: false, message: 'Token and new_password are required' });
    if (new_password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    try {
        const user = await findUserByResetToken(token);
        if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset link' });
        if (new Date() > new Date(user.reset_token_expires)) return res.status(400).json({ success: false, message: 'Reset link has expired' });
        const hashed = await bcrypt.hash(new_password, 10);
        await updatePassword(user.id, hashed);
        await clearResetToken(user.id);
        res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to reset password: ' + err.message });
    }
}

module.exports = { login, logout, changePassword, forgotPassword, resetPassword };