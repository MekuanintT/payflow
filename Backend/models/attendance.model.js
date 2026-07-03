const pool = require('../config/db');

async function getAll(filters = {}) {
    let query = `
        SELECT a.*, e.employee_code, u.full_name
        FROM attendance a
        JOIN employees e ON e.id = a.employee_id
        JOIN users u ON u.id = e.user_id
        WHERE 1=1
    `;
    const params = [];

    if (filters.employee_id) {
        params.push(filters.employee_id);
        query += ` AND a.employee_id = $${params.length}`;
    }
    if (filters.date) {
        params.push(filters.date);
        query += ` AND a.date = $${params.length}`;
    }
    if (filters.month && filters.year) {
        params.push(filters.month, filters.year);
        query += ` AND EXTRACT(MONTH FROM a.date) = $${params.length - 1} AND EXTRACT(YEAR FROM a.date) = $${params.length}`;
    }

    query += ' ORDER BY a.date DESC, u.full_name ASC';
    const { rows } = await pool.query(query, params);
    return rows;
}

async function checkIn(employeeId, date) {
    const { rows } = await pool.query(
        `INSERT INTO attendance (employee_id, date, check_in, status)
         VALUES ($1, $2, CURRENT_TIME, 'PRESENT')
         ON CONFLICT (employee_id, date)
         DO UPDATE SET check_in = CURRENT_TIME
         RETURNING *`,
        [employeeId, date || new Date()]
    );
    return rows[0];
}

async function checkOut(employeeId, date) {
    const { rows } = await pool.query(
        `UPDATE attendance SET check_out = CURRENT_TIME
         WHERE employee_id = $1 AND date = $2
         RETURNING *`,
        [employeeId, date || new Date()]
    );
    return rows[0];
}

async function markStatus(employeeId, date, status, note) {
    const { rows } = await pool.query(
        `INSERT INTO attendance (employee_id, date, status, note)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (employee_id, date)
         DO UPDATE SET status = $3, note = $4
         RETURNING *`,
        [employeeId, date, status, note || null]
    );
    return rows[0];
}

async function getSummary(employeeId, month, year) {
    const { rows } = await pool.query(
        `SELECT
            COUNT(*) FILTER (WHERE status = 'PRESENT') AS present_days,
            COUNT(*) FILTER (WHERE status = 'ABSENT')  AS absent_days,
            COUNT(*) FILTER (WHERE status = 'LATE')     AS late_days,
            COUNT(*) FILTER (WHERE status = 'HALF_DAY') AS half_days
         FROM attendance
         WHERE employee_id = $1
           AND EXTRACT(MONTH FROM date) = $2
           AND EXTRACT(YEAR FROM date) = $3`,
        [employeeId, month, year]
    );
    return rows[0];
}

module.exports = { getAll, checkIn, checkOut, markStatus, getSummary };