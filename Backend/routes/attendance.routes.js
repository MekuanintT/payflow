const router = require('express').Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const c = require('../controllers/attendance.controller');

router.get('/', authenticateToken, c.list);
router.get('/summary', authenticateToken, c.summary);
router.post('/check-in', authenticateToken, requireRole('SUPER_ADMIN', 'HR_MANAGER'), c.checkIn);
router.post('/check-out', authenticateToken, requireRole('SUPER_ADMIN', 'HR_MANAGER'), c.checkOut);
router.post('/mark', authenticateToken, requireRole('SUPER_ADMIN', 'HR_MANAGER'), c.mark);

module.exports = router;