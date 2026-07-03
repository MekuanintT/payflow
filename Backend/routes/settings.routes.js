const router = require('express').Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const c = require('../controllers/settings.controller');

router.get('/', authenticateToken, c.get);
router.put('/', authenticateToken, requireRole('SUPER_ADMIN'), c.update);
router.post('/logo', authenticateToken, requireRole('SUPER_ADMIN'), upload.logo.single('logo'), c.uploadLogo);

module.exports = router;