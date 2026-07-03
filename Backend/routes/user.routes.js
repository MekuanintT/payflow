const router = require('express').Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const c = require('../controllers/user.controller');

router.get('/', authenticateToken, requireRole('SUPER_ADMIN'), c.list);
router.post('/', authenticateToken, requireRole('SUPER_ADMIN'), c.create);
router.put('/:id/toggle-active', authenticateToken, requireRole('SUPER_ADMIN'), c.toggleActive);

module.exports = router;