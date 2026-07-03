const pool = require('../config/db');

async function findUserByEmail(email) {
    const { rows } = await pool.query(
        `SELECT u.id, u.full_name, u.email, u.password, u.role, u.is_active,
                e.id AS employee_id
         FROM users u
         LEFT JOIN employees e ON e.user_id = u.id
         WHERE u.email = $1`,
        [email.trim().toLowerCase()]
    );
    return rows[0];
}

async function findUserById(id) {
    const { rows } = await pool.query('SELECT id, password FROM users WHERE id = $1', [id]);
    return rows[0];
}

async function updatePassword(id, hashedPassword) {
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id]);
}

async function updateLastLogin(userId) {
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [userId]);
}

async function saveResetToken(email, token, expires) {
    await pool.query(
        'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3',
        [token, expires, email.trim().toLowerCase()]
    );
}

async function findUserByResetToken(token) {
    const { rows } = await pool.query(
        'SELECT id, email, full_name, reset_token_expires FROM users WHERE reset_token = $1',
        [token]
    );
    return rows[0];
}

async function clearResetToken(id) {
    await pool.query(
        'UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id = $1',
        [id]
    );
}

module.exports = {
    findUserByEmail,
    findUserById,
    updatePassword,
    updateLastLogin,
    saveResetToken,
    findUserByResetToken,
    clearResetToken,
};
