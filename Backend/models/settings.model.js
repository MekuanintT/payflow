const pool = require('../config/db');

async function get() {
    const { rows } = await pool.query('SELECT * FROM settings WHERE id = 1');
    return rows[0];
}

async function update(data) {
    const { rows } = await pool.query(
        `UPDATE settings SET
            company_name = $1,
            company_address = $2,
            default_tax_rate = $3,
            default_pension_rate = $4,
            updated_at = NOW()
         WHERE id = 1
         RETURNING *`,
        [
            data.company_name,
            data.company_address || null,
            data.default_tax_rate || 0,
            data.default_pension_rate || 0,
        ]
    );
    return rows[0];
}

async function updateLogo(logoUrl) {
    const { rows } = await pool.query(
        `UPDATE settings SET logo_url = $1, updated_at = NOW() WHERE id = 1 RETURNING *`,
        [logoUrl]
    );
    return rows[0];
}

module.exports = { get, update, updateLogo };