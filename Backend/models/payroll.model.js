const pool = require('../config/db');
const calculateSalary = require('../utils/calculateSalary');
const { getPayrollAttendanceFigures } = require('../utils/attendanceCalendar');
async function getAll(filters = {}) {
    let query = `
        SELECT p.*, e.employee_code, u.full_name, d.name AS department_name
        FROM payroll_records p
        JOIN employees e ON e.id = p.employee_id
        JOIN users u ON u.id = e.user_id
        LEFT JOIN departments d ON d.id = e.department_id
        WHERE 1=1
    `;
    const params = [];

    if (filters.employee_id) {
        params.push(filters.employee_id);
        query += ` AND p.employee_id = $${params.length}`;
    }
    if (filters.month && filters.year) {
        params.push(filters.month, filters.year);
        query += ` AND p.month = $${params.length - 1} AND p.year = $${params.length}`;
    }
    if (filters.status) {
        params.push(filters.status);
        query += ` AND p.status = $${params.length}`;
    }

    query += ' ORDER BY p.year DESC, p.month DESC, u.full_name ASC';
    const { rows } = await pool.query(query, params);
    return rows;
}

async function getById(id) {
    const { rows } = await pool.query(`
        SELECT p.*, e.employee_code, u.full_name, u.email, d.name AS department_name
        FROM payroll_records p
        JOIN employees e ON e.id = p.employee_id
        JOIN users u ON u.id = e.user_id
        LEFT JOIN departments d ON d.id = e.department_id
        WHERE p.id = $1
    `, [id]);
    return rows[0];
}

async function generateForEmployee(employeeId, month, year, generatedBy) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Get salary info
        const salaryResult = await client.query(
            'SELECT * FROM salaries WHERE employee_id = $1',
            [employeeId]
        );
        const salary = salaryResult.rows[0];
        if (!salary) {
            throw new Error('No salary record found for this employee');
        }

        // Get attendance summary for the month
        // Get leave-aware attendance figures (working days, absences, half-days)
        const figures = await getPayrollAttendanceFigures(client, employeeId, month, year);
        const daysWorked = figures.days_worked;
        const daysAbsent = figures.days_absent;

        // Calculate
        const calc = calculateSalary({
            basic_salary: salary.basic_salary,
            house_allowance: salary.house_allowance,
            transport: salary.transport,
            tax_rate: salary.tax_rate,
            pension_rate: salary.pension_rate,
            other_deductions: salary.other_deductions,
            days_absent: daysAbsent,
            half_days: figures.half_days,
            working_days: figures.working_days
        });

        // Insert or update payroll record for this employee/month/year
        const { rows } = await client.query(
            `INSERT INTO payroll_records
                (employee_id, month, year, basic_salary, house_allowance, transport,
                 gross_salary, tax_deduction, pension_deduction, other_deductions,
                 absent_deduction, total_deductions, net_salary, days_worked, days_absent,
                 status, generated_by)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'DRAFT',$16)
             ON CONFLICT (employee_id, month, year)
             DO UPDATE SET
                basic_salary = $4, house_allowance = $5, transport = $6,
                gross_salary = $7, tax_deduction = $8, pension_deduction = $9,
                other_deductions = $10, absent_deduction = $11, total_deductions = $12,
                net_salary = $13, days_worked = $14, days_absent = $15,
                generated_at = NOW(), generated_by = $16
             RETURNING *`,
            [
                employeeId, month, year,
                salary.basic_salary, salary.house_allowance, salary.transport,
                calc.gross_salary, calc.tax_deduction, calc.pension_deduction,
                calc.other_deductions, calc.absent_deduction, calc.total_deductions,
                calc.net_salary, daysWorked, daysAbsent, generatedBy
            ]
        );

        await client.query('COMMIT');
        return rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

async function generateForAll(month, year, generatedBy) {
    const { rows: employees } = await pool.query(
        "SELECT id FROM employees WHERE status = 'ACTIVE'"
    );
    const results = [];
    for (const emp of employees) {
        try {
            const record = await generateForEmployee(emp.id, month, year, generatedBy);
            results.push(record);
        } catch (err) {
            results.push({ employee_id: emp.id, error: err.message });
        }
    }
    return results;
}

async function updateStatus(id, status) {
    const paidAt = status === 'PAID' ? 'NOW()' : 'NULL';
    const { rows } = await pool.query(
        `UPDATE payroll_records SET status = $1, paid_at = ${status === 'PAID' ? 'NOW()' : 'paid_at'}
         WHERE id = $2 RETURNING *`,
        [status, id]
    );
    return rows[0];
}

module.exports = { getAll, getById, generateForEmployee, generateForAll, updateStatus };