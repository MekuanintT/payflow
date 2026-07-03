const router = require('express').Router();
const { authenticateToken } = require('../middleware/auth');
const { login, logout, changePassword, forgotPassword, resetPassword } = require('../controllers/auth.controller');

router.post('/login', login);
router.post('/logout', logout);
router.put('/change-password', authenticateToken, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
