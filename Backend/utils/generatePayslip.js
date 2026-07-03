const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const monthNames = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

function money(n) {
    return `ETB ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Generates a payslip PDF and streams it directly to the given writable stream (e.g. res).
 * @param {object} record - a payroll_records row joined with employee_code, full_name, department_name
 * @param {import('stream').Writable} stream - destination to pipe the PDF into
 * @param {object} [companySettings] - { company_name, company_address, logo_url } from the settings table
 */
function generatePayslip(record, stream, companySettings = {}) {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(stream);

    const companyName = companySettings.company_name || 'PayFlow';
    let logoDrawn = false;

    if (companySettings.logo_url) {
        try {
            const logoPath = path.join(__dirname, '..', companySettings.logo_url.replace(/^\//, ''));
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 50, 45, { fit: [40, 40] });
                logoDrawn = true;
            }
        } catch (err) {
            logoDrawn = false;
        }
    }

    const headerX = logoDrawn ? 100 : 50;

    // Header
    doc.fontSize(20).fillColor('#0f172a').text(companyName, headerX, 50, { continued: true });
    doc.fontSize(10).fillColor('#64748b').text('  Payslip', { align: 'left' });

    if (companySettings.company_address) {
        doc.fontSize(9).fillColor('#94a3b8').text(companySettings.company_address, headerX, doc.y);
    }

    doc.y = Math.max(doc.y, 95);
    doc.x = 50;
    doc.moveDown(0.5);

    doc.fontSize(14).fillColor('#0f172a').text(`Payslip — ${monthNames[record.month]} ${record.year}`);
    doc.moveDown(1);

    // Employee info box
    const infoTop = doc.y;
    doc.fontSize(10).fillColor('#475569');
    doc.text('Employee Name', 50, infoTop);
    doc.text('Employee Code', 300, infoTop);
    doc.fontSize(11).fillColor('#0f172a');
    doc.text(record.full_name || '-', 50, infoTop + 15);
    doc.text(record.employee_code || '-', 300, infoTop + 15);

    doc.fontSize(10).fillColor('#475569');
    doc.text('Department', 50, infoTop + 40);
    doc.text('Status', 300, infoTop + 40);
    doc.fontSize(11).fillColor('#0f172a');
    doc.text(record.department_name || '-', 50, infoTop + 55);
    doc.text(record.status || '-', 300, infoTop + 55);

    doc.moveDown(4);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e2e8f0').stroke();
    doc.moveDown(1);

    // Earnings table
    function row(label, value, opts = {}) {
        const y = doc.y;
        doc.fontSize(11).fillColor(opts.bold ? '#0f172a' : '#334155');
        if (opts.bold) doc.font('Helvetica-Bold');
        doc.text(label, 50, y);
        doc.text(value, 400, y, { width: 145, align: 'right' });
        doc.font('Helvetica');
        doc.moveDown(0.6);
    }

    doc.fontSize(12).fillColor('#0f172a').text('Earnings', 50, doc.y);
    doc.moveDown(0.5);
    row('Basic Salary', money(record.basic_salary));
    row('House Allowance', money(record.house_allowance));
    row('Transport', money(record.transport));
    doc.moveDown(0.3);
    row('Gross Salary', money(record.gross_salary), { bold: true });

    doc.moveDown(0.8);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e2e8f0').stroke();
    doc.moveDown(1);

    doc.fontSize(12).fillColor('#0f172a').text('Deductions', 50, doc.y);
    doc.moveDown(0.5);
    row('Tax', money(record.tax_deduction));
    row('Pension', money(record.pension_deduction));
    row('Other Deductions', money(record.other_deductions));
    row(`Absence (${record.days_absent || 0} day${record.days_absent === 1 ? '' : 's'})`, money(record.absent_deduction));
    doc.moveDown(0.3);
    row('Total Deductions', money(record.total_deductions), { bold: true });

    doc.moveDown(0.8);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e2e8f0').stroke();
    doc.moveDown(1);

    // Net salary highlight
    doc.rect(50, doc.y, 495, 40).fillColor('#ecfdf5').fill();
    doc.fillColor('#065f46').fontSize(13).font('Helvetica-Bold');
    doc.text('Net Salary', 65, doc.y - 30, { continued: false });
    doc.fontSize(16).text(money(record.net_salary), 350, doc.y - 25, { width: 180, align: 'right' });
    doc.font('Helvetica');

    doc.moveDown(3);
    doc.fontSize(9).fillColor('#94a3b8').text(
        `Days Worked: ${record.days_worked || 0}    Days Absent: ${record.days_absent || 0}`,
        50
    );
    doc.moveDown(0.3);
    doc.fontSize(8).fillColor('#94a3b8').text(
        'This is a system-generated payslip and does not require a signature.',
        50
    );

    doc.end();
}

module.exports = generatePayslip;