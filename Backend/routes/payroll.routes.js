const router = require('express').Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const c = require('../controllers/payroll.controller');

router.get('/', authenticateToken, c.list);
router.get('/:id', authenticateToken, c.getOne);
router.get('/:id/payslip', authenticateToken, c.downloadPayslip);
router.post('/generate', authenticateToken, requireRole('SUPER_ADMIN', 'HR_MANAGER'), c.generateOne);
router.post('/generate-all', authenticateToken, requireRole('SUPER_ADMIN', 'HR_MANAGER'), c.generateAll);
router.put('/:id/approve', authenticateToken, requireRole('SUPER_ADMIN'), c.approve);
router.put('/:id/paid', authenticateToken, requireRole('SUPER_ADMIN'), c.markPaid);

module.exports = router;