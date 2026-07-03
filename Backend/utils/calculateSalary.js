function calculateSalary({
    basic_salary, house_allowance, transport, tax_rate, pension_rate,
    other_deductions, days_absent, half_days, working_days
}) {
    const basic = parseFloat(basic_salary) || 0;
    const house = parseFloat(house_allowance) || 0;
    const trans = parseFloat(transport) || 0;
    const taxRate = parseFloat(tax_rate) || 0;
    const pensionRate = parseFloat(pension_rate) || 0;
    const otherDed = parseFloat(other_deductions) || 0;
    const absentDays = parseInt(days_absent) || 0;
    const halfDays = parseInt(half_days) || 0;
    const workDays = parseInt(working_days) || 22; // default working days/month if not provided

    const grossSalary = basic + house + trans;

    const taxDeduction = grossSalary * (taxRate / 100);
    const pensionDeduction = basic * (pensionRate / 100);

    const perDayRate = workDays > 0 ? basic / workDays : 0;
    const absentDeduction = perDayRate * absentDays;
    const halfDayDeduction = (perDayRate / 2) * halfDays;

    const totalDeductions = taxDeduction + pensionDeduction + otherDed + absentDeduction + halfDayDeduction;
    const netSalary = grossSalary - totalDeductions;

    return {
        gross_salary: round(grossSalary),
        tax_deduction: round(taxDeduction),
        pension_deduction: round(pensionDeduction),
        other_deductions: round(otherDed),
        absent_deduction: round(absentDeduction + halfDayDeduction),
        total_deductions: round(totalDeductions),
        net_salary: round(netSalary)
    };
}

function round(num) {
    return Math.round(num * 100) / 100;
}

module.exports = calculateSalary;