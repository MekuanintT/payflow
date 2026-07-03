const pool = require('../config/db');

async function dashboardSummary() {
    const { rows: headcount } = await pool.query(
        "SELECT COUNT(*) AS total FROM employees WHERE status = 'ACTIVE'"
    );

    const { rows: payrollThisMonth } = await pool.query(
        `SELECT COALESCE(SUM(net_salary), 0) AS total_payroll, COUNT(*) AS records
         FROM payroll_records
         WHERE month = EXTRACT(MONTH FROM CURRENT_DATE)
           AND year = EXTRACT(YEAR FROM CURRENT_DATE)`
    );

    const { rows: pendingLeaves } = await pool.query(
        "SELECT COUNT(*) AS total FROM leaves WHERE status = 'PENDING'"
    );

    const { rows: departmentCount } = await pool.query(
        'SELECT COUNT(*) AS total FROM departments'
    );

    return {
        active_employees: parseInt(headcount[0].total),
        total_payroll_this_month: parseFloat(payrollThisMonth[0].total_payroll),
        payroll_records_this_month: parseInt(payrollThisMonth[0].records),
        pending_leaves: parseInt(pendingLeaves[0].total),
        total_departments: parseInt(departmentCount[0].total)
    };
}

async function payrollByDepartment(month, year) {
    const { rows } = await pool.query(
        `SELECT d.name AS department, COALESCE(SUM(p.net_salary), 0) AS total
         FROM departments d
         LEFT JOIN employees e ON e.department_id = d.id
         LEFT JOIN payroll_records p ON p.employee_id = e.id AND p.month = $1 AND p.year = $2
         GROUP BY d.name
         ORDER BY total DESC`,
        [month, year]
    );
    return rows;
}

async function headcountByDepartment() {
    const { rows } = await pool.query(
        `SELECT d.name AS department, COUNT(e.id) AS headcount
         FROM departments d
         LEFT JOIN employees e ON e.department_id = d.id AND e.status = 'ACTIVE'
         GROUP BY d.name
         ORDER BY headcount DESC`
    );
    return rows;
}

async function attendanceTrend(month, year) {
    const { rows } = await pool.query(
        `SELECT date,
                COUNT(*) FILTER (WHERE status = 'PRESENT') AS present,
                COUNT(*) FILTER (WHERE status = 'ABSENT') AS absent
         FROM attendance
         WHERE EXTRACT(MONTH FROM date) = $1 AND EXTRACT(YEAR FROM date) = $2
         GROUP BY date
         ORDER BY date ASC`,
        [month, year]
    );
    return rows;
}

/**
 * Total net payroll cost per month/year across all departments, for the last N months
 * (including months with no payroll records, so the chart doesn't have gaps).
 */
async function payrollTrend(months = 6) {
    const { rows } = await pool.query(
        `WITH month_series AS (
            SELECT
                EXTRACT(MONTH FROM d)::int AS month,
                EXTRACT(YEAR FROM d)::int AS year,
                TO_CHAR(d, 'Mon YYYY') AS label
            FROM generate_series(
                date_trunc('month', CURRENT_DATE) - INTERVAL '1 month' * ($1 - 1),
                date_trunc('month', CURRENT_DATE),
                INTERVAL '1 month'
            ) AS d
        )
        SELECT
            ms.label,
            ms.month,
            ms.year,
            COALESCE(SUM(p.net_salary), 0) AS total_payroll
        FROM month_series ms
        LEFT JOIN payroll_records p ON p.month = ms.month AND p.year = ms.year
        GROUP BY ms.label, ms.month, ms.year
        ORDER BY ms.year ASC, ms.month ASC`,
        [months]
    );
    return rows.map(r => ({
        label: r.label,
        month: r.month,
        year: r.year,
        total_payroll: parseFloat(r.total_payroll),
    }));
}

/**
 * Leave request counts grouped by status, and separately by leave type.
 */
async function leaveStats() {
    const { rows: byStatus } = await pool.query(
        `SELECT status, COUNT(*) AS count
         FROM leaves
         GROUP BY status`
    );

    const { rows: byType } = await pool.query(
        `SELECT leave_type, COUNT(*) AS count
         FROM leaves
         GROUP BY leave_type
         ORDER BY count DESC`
    );

    return {
        by_status: byStatus.map(r => ({ status: r.status, count: parseInt(r.count) })),
        by_type: byType.map(r => ({ leave_type: r.leave_type, count: parseInt(r.count) })),
    };
}

module.exports = {
    dashboardSummary,
    payrollByDepartment,
    headcountByDepartment,
    attendanceTrend,
    payrollTrend,
    leaveStats,
};