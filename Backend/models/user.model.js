const pool = require('../config/db');
const bcrypt = require('bcrypt');

async function getAll() {
    const { rows } = await pool.query(`
        SELECT id, full_name, email, role, is_active, last_login, created_at
        FROM users
        ORDER BY
            CASE role
                WHEN 'SUPER_ADMIN' THEN 1
                WHEN 'HR_MANAGER' THEN 2
                ELSE 3
            END,
            full_name ASC
    `);
    return rows;
}

async function getById(id) {
    const { rows } = await pool.query(
        'SELECT id, full_name, email, role, is_active, last_login, created_at FROM users WHERE id = $1',
        [id]
    );
    return rows[0];
}

async function create({ full_name, email, password, role }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
        `INSERT INTO users (full_name, email, password, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, full_name, email, role, is_active, created_at`,
        [full_name, email.trim().toLowerCase(), hashedPassword, role]
    );
    return rows[0];
}

async function setActive(id, isActive) {
    const { rows } = await pool.query(
        `UPDATE users SET is_active = $1 WHERE id = $2
         RETURNING id, full_name, email, role, is_active, last_login, created_at`,
        [isActive, id]
    );
    return rows[0];
}

module.exports = { getAll, getById, create, setActive };