const router = require('express').Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const c = require('../controllers/report.controller');

router.get('/dashboard', authenticateToken, c.dashboard);
router.get('/headcount', authenticateToken, requireRole('SUPER_ADMIN', 'HR_MANAGER'), c.headcount);
router.get('/attendance-trend', authenticateToken, requireRole('SUPER_ADMIN', 'HR_MANAGER'), c.attendanceTrend);
router.get('/payroll-by-department', authenticateToken, requireRole('SUPER_ADMIN'), c.byDepartment);
router.get('/payroll-trend', authenticateToken, requireRole('SUPER_ADMIN'), c.payrollTrend);
router.get('/leave-stats', authenticateToken, requireRole('SUPER_ADMIN'), c.leaveStats);

module.exports = router;