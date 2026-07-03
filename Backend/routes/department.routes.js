const router = require('express').Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const c = require('../controllers/department.controller');

router.get('/', authenticateToken, c.list);
router.get('/:id', authenticateToken, c.getOne);
router.post('/', authenticateToken, requireRole('SUPER_ADMIN', 'HR_MANAGER'), c.add);
router.put('/:id', authenticateToken, requireRole('SUPER_ADMIN', 'HR_MANAGER'), c.edit);
router.delete('/:id', authenticateToken, requireRole('SUPER_ADMIN'), c.destroy);

module.exports = router;