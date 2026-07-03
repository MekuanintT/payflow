const pool = require('../config/db');

async function getAll() {
    const { rows } = await pool.query('SELECT * FROM departments ORDER BY name ASC');
    return rows;
}

async function getById(id) {
    const { rows } = await pool.query('SELECT * FROM departments WHERE id = $1', [id]);
    return rows[0];
}

async function create(name, description) {
    const { rows } = await pool.query(
        'INSERT INTO departments (name, description) VALUES ($1, $2) RETURNING *',
        [name, description || null]
    );
    return rows[0];
}

async function update(id, name, description) {
    const { rows } = await pool.query(
        'UPDATE departments SET name = $1, description = $2 WHERE id = $3 RETURNING *',
        [name, description || null, id]
    );
    return rows[0];
}

async function remove(id) {
    const result = await pool.query('DELETE FROM departments WHERE id = $1', [id]);
    return result.rowCount;
}

module.exports = { getAll, getById, create, update, remove };