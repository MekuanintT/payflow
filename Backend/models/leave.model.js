const pool = require('../config/db');

async function getAll(filters = {}) {
    let query = `
        SELECT l.*, e.employee_code, u.full_name
        FROM leaves l
        JOIN employees e ON e.id = l.employee_id
        JOIN users u ON u.id = e.user_id
        WHERE 1=1
    `;
    const params = [];

    if (filters.employee_id) {
        params.push(filters.employee_id);
        query += ` AND l.employee_id = $${params.length}`;
    }
    if (filters.status) {
        params.push(filters.status);
        query += ` AND l.status = $${params.length}`;
    }

    query += ' ORDER BY l.created_at DESC';
    const { rows } = await pool.query(query, params);
    return rows;
}

async function getById(id) {
    const { rows } = await pool.query(`
        SELECT l.*, e.employee_code, u.full_name, u.email
        FROM leaves l
        JOIN employees e ON e.id = l.employee_id
        JOIN users u ON u.id = e.user_id
        WHERE l.id = $1
    `, [id]);
    return rows[0];
}

async function create(data) {
    const { rows } = await pool.query(
        `INSERT INTO leaves (employee_id, leave_type, start_date, end_date, days, reason)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [data.employee_id, data.leave_type || 'ANNUAL', data.start_date, data.end_date, data.days, data.reason || null]
    );
    return rows[0];
}

async function review(id, status, reviewerId) {
    const { rows } = await pool.query(
        `UPDATE leaves SET status = $1, reviewed_by = $2, reviewed_at = NOW()
         WHERE id = $3 RETURNING *`,
        [status, reviewerId, id]
    );
    return rows[0];
}

async function remove(id) {
    const result = await pool.query('DELETE FROM leaves WHERE id = $1', [id]);
    return result.rowCount;
}

module.exports = { getAll, getById, create, review, remove };