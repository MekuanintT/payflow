const pool = require('../config/db');
const bcrypt = require('bcrypt');

async function getAll() {
    const { rows } = await pool.query(`
        SELECT e.id, e.employee_code, e.phone, e.address, e.gender, e.date_of_birth,
               e.date_joined, e.position, e.employment_type, e.status, e.avatar_url,
               u.id AS user_id, u.full_name, u.email, u.role,
               d.id AS department_id, d.name AS department_name,
               s.basic_salary, s.house_allowance, s.transport
        FROM employees e
        JOIN users u ON u.id = e.user_id
        LEFT JOIN departments d ON d.id = e.department_id
        LEFT JOIN salaries s ON s.employee_id = e.id
        ORDER BY e.id DESC
    `);
    return rows;
}

async function getById(id) {
    const { rows } = await pool.query(`
        SELECT e.*, u.full_name, u.email, u.role,
               d.name AS department_name,
               s.basic_salary, s.house_allowance, s.transport, s.tax_rate, s.pension_rate, s.other_deductions
        FROM employees e
        JOIN users u ON u.id = e.user_id
        LEFT JOIN departments d ON d.id = e.department_id
        LEFT JOIN salaries s ON s.employee_id = e.id
        WHERE e.id = $1
    `, [id]);
    return rows[0];
}

async function create(data) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const userResult = await client.query(
            `INSERT INTO users (full_name, email, password, role)
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [data.full_name, data.email.trim().toLowerCase(), hashedPassword, data.role || 'EMPLOYEE']
        );
        const userId = userResult.rows[0].id;

        const empResult = await client.query(
            `INSERT INTO employees
                (user_id, department_id, employee_code, phone, address, gender,
                 date_of_birth, date_joined, position, employment_type, avatar_url)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
             RETURNING *`,
            [
                userId, data.department_id || null, data.employee_code,
                data.phone || null, data.address || null, data.gender || null,
                data.date_of_birth || null, data.date_joined || new Date(),
                data.position || null, data.employment_type || 'FULL_TIME',
                data.avatar_url || null
            ]
        );
        const employee = empResult.rows[0];

        await client.query(
            `INSERT INTO salaries (employee_id, basic_salary, house_allowance, transport, tax_rate, pension_rate)
             VALUES ($1,$2,$3,$4,$5,$6)`,
            [
                employee.id, data.basic_salary || 0, data.house_allowance || 0,
                data.transport || 0, data.tax_rate || 0, data.pension_rate || 0
            ]
        );

        await client.query('COMMIT');
        return employee;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

async function update(id, data) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Look up user_id for this employee so we can update users.full_name too
        const empResult = await client.query('SELECT user_id FROM employees WHERE id = $1', [id]);
        if (!empResult.rows[0]) {
            await client.query('ROLLBACK');
            return null;
        }
        const userId = empResult.rows[0].user_id;

        if (data.full_name) {
            await client.query(
                'UPDATE users SET full_name = $1 WHERE id = $2',
                [data.full_name, userId]
            );
        }

        const { rows } = await client.query(
            `UPDATE employees SET
                department_id = $1, phone = $2, address = $3, gender = $4,
                date_of_birth = $5, position = $6, employment_type = $7, status = $8
             WHERE id = $9 RETURNING *`,
            [
                data.department_id || null, data.phone || null, data.address || null,
                data.gender || null, data.date_of_birth || null, data.position || null,
                data.employment_type || 'FULL_TIME', data.status || 'ACTIVE', id
            ]
        );

        await client.query('COMMIT');

        // Return full_name in the response too, since the frontend expects it back
        return { ...rows[0], full_name: data.full_name || null };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

async function updateAvatar(id, avatarUrl) {
    const { rows } = await pool.query(
        'UPDATE employees SET avatar_url = $1 WHERE id = $2 RETURNING *',
        [avatarUrl, id]
    );
    return rows[0];
}

async function remove(id) {
    // employees.user_id has ON DELETE CASCADE, so deleting the user removes the employee too
    const empResult = await pool.query('SELECT user_id FROM employees WHERE id = $1', [id]);
    if (!empResult.rows[0]) return 0;
    const result = await pool.query('DELETE FROM users WHERE id = $1', [empResult.rows[0].user_id]);
    return result.rowCount;
}

async function updateSalary(employeeId, data) {
    const { rows } = await pool.query(
        `UPDATE salaries SET
            basic_salary = $1, house_allowance = $2, transport = $3,
            tax_rate = $4, pension_rate = $5, other_deductions = $6
         WHERE employee_id = $7 RETURNING *`,
        [
            data.basic_salary || 0, data.house_allowance || 0, data.transport || 0,
            data.tax_rate || 0, data.pension_rate || 0, data.other_deductions || 0,
            employeeId
        ]
    );
    return rows[0];
}

module.exports = { getAll, getById, create, update, updateAvatar, updateSalary, remove };