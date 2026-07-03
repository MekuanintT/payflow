const router = require('express').Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const c = require('../controllers/leave.controller');

router.get('/', authenticateToken, c.list);
router.get('/:id', authenticateToken, c.getOne);
router.post('/', authenticateToken, c.add);
router.put('/:id/approve', authenticateToken, requireRole('SUPER_ADMIN', 'HR_MANAGER'), c.approve);
router.put('/:id/reject', authenticateToken, requireRole('SUPER_ADMIN', 'HR_MANAGER'), c.reject);
router.delete('/:id', authenticateToken, requireRole('SUPER_ADMIN', 'HR_MANAGER'), c.destroy);

module.exports = router;