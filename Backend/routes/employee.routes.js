const router = require('express').Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const c = require('../controllers/employee.controller');

router.get('/', authenticateToken, c.list);
router.get('/:id', authenticateToken, c.getOne);

router.post(
    '/',
    authenticateToken,
    requireRole('SUPER_ADMIN', 'HR_MANAGER'),
    upload.single('avatar'),
    c.add
);

router.put(
    '/:id',
    authenticateToken,
    requireRole('SUPER_ADMIN', 'HR_MANAGER'),
    c.edit
);

router.post(
    '/:id/avatar',
    authenticateToken,
    requireRole('SUPER_ADMIN', 'HR_MANAGER'),
    upload.single('avatar'),
    c.uploadAvatar
);

router.delete(
    '/:id',
    authenticateToken,
    requireRole('SUPER_ADMIN'),
    c.destroy
);

router.put(
    '/:id/salary',
    authenticateToken,
    requireRole('SUPER_ADMIN', 'HR_MANAGER'),
    c.editSalary
);

module.exports = router;