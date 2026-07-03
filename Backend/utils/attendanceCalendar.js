/**
 * Counts weekdays (Mon-Fri) in a given month/year.
 */
function countWeekdaysInMonth(month, year) {
    const daysInMonth = new Date(year, month, 0).getDate();
    let count = 0;
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const dow = date.getDay(); // 0 = Sunday, 6 = Saturday
        if (dow !== 0 && dow !== 6) count++;
    }
    return count;
}

/**
 * Given a leave's start/end dates and a target month/year, returns the number of
 * weekday days that leave overlaps with that specific month (a leave can span
 * multiple months; we only want the portion inside the target month).
 */
function weekdaysInRangeForMonth(startDate, endDate, month, year) {
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0); // last day of month

    const rangeStart = new Date(startDate) < monthStart ? monthStart : new Date(startDate);
    const rangeEnd = new Date(endDate) > monthEnd ? monthEnd : new Date(endDate);

    if (rangeStart > rangeEnd) return 0;

    let count = 0;
    for (let d = new Date(rangeStart); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
        const dow = d.getDay();
        if (dow !== 0 && dow !== 6) count++;
    }
    return count;
}

/**
 * Computes payroll-relevant attendance figures for one employee/month/year, combining
 * the attendance table with the leaves table per these rules:
 *  - APPROVED leave: excluded from both working_days (reduces denominator) and absence count
 *  - REJECTED or PENDING leave: counted as absent (unless that day already has its own
 *    attendance row, to avoid double-counting if HR also marked it directly)
 *  - LATE: recorded only, no deduction
 *  - HALF_DAY: 50% deduction (handled in calculateSalary)
 *
 * @param {object} client - an active pg client/pool (so this can run inside a transaction)
 * @param {number} employeeId
 * @param {number} month
 * @param {number} year
 */
async function getPayrollAttendanceFigures(client, employeeId, month, year) {
    const totalWeekdays = countWeekdaysInMonth(month, year);

    // Attendance rows for this employee/month
    const { rows: attendanceRows } = await client.query(
        `SELECT date, status FROM attendance
         WHERE employee_id = $1
           AND EXTRACT(MONTH FROM date) = $2
           AND EXTRACT(YEAR FROM date) = $3`,
        [employeeId, month, year]
    );

    const attendanceDateSet = new Set(attendanceRows.map(r => new Date(r.date).toDateString()));
    const presentDays = attendanceRows.filter(r => r.status === 'PRESENT').length;
    const lateDays = attendanceRows.filter(r => r.status === 'LATE').length;
    const halfDays = attendanceRows.filter(r => r.status === 'HALF_DAY').length;
    const directAbsentDays = attendanceRows.filter(r => r.status === 'ABSENT').length;

    // Leave rows overlapping this month
    const { rows: leaveRows } = await client.query(
        `SELECT status, start_date, end_date FROM leaves
         WHERE employee_id = $1
           AND start_date <= $2
           AND end_date >= $3`,
        [employeeId, new Date(year, month, 0), new Date(year, month - 1, 1)]
    );

    let approvedLeaveWeekdays = 0;
    let unapprovedLeaveAbsentDays = 0;

    for (const leave of leaveRows) {
        const overlapDays = weekdaysInRangeForMonth(leave.start_date, leave.end_date, month, year);

        if (leave.status === 'APPROVED') {
            approvedLeaveWeekdays += overlapDays;
        } else {
            // PENDING or REJECTED: count as absent, but only for days that don't already
            // have their own attendance row (avoid double-counting an explicit HR mark)
            for (let d = new Date(leave.start_date); d <= new Date(leave.end_date); d.setDate(d.getDate() + 1)) {
                if (d.getMonth() + 1 !== month || d.getFullYear() !== year) continue;
                const dow = d.getDay();
                if (dow === 0 || dow === 6) continue;
                if (!attendanceDateSet.has(d.toDateString())) {
                    unapprovedLeaveAbsentDays++;
                }
            }
        }
    }

    const workingDays = Math.max(totalWeekdays - approvedLeaveWeekdays, 0);
    const totalAbsentDays = directAbsentDays + unapprovedLeaveAbsentDays;

    return {
        working_days: workingDays,
        days_worked: presentDays,
        days_absent: totalAbsentDays,
        days_late: lateDays,
        half_days: halfDays,
    };
}

module.exports = { countWeekdaysInMonth, weekdaysInRangeForMonth, getPayrollAttendanceFigures };