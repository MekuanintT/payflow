const multer = require('multer');
const path = require('path');
const fs = require('fs');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

const avatarsDir = path.join(__dirname, '..', 'uploads', 'avatars');
const logosDir = path.join(__dirname, '..', 'uploads', 'logos');
ensureDir(avatarsDir);
ensureDir(logosDir);

const allowedTypes = ['.jpg', '.jpeg', '.png', '.webp'];

function fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.includes(ext)) {
        return cb(new Error('Only JPG, PNG, and WEBP images are allowed'));
    }
    cb(null, true);
}

// Original avatar upload (employee_id-based filename), unchanged behavior
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, avatarsDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueName = `employee-${req.params.id}-${Date.now()}${ext}`;
        cb(null, uniqueName);
    },
});

const logoStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, logosDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `company-logo-${Date.now()}${ext}`);
    },
});

const upload = multer({
    storage: avatarStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadLogo = multer({
    storage: logoStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;
module.exports.logo = uploadLogo;