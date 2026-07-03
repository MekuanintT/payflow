const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const monthNames = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Sends an email. Never throws on failure — logs the error instead, so a notification
 * failure never blocks the actual business action (approving leave, marking payroll paid).
 */
async function sendMail({ to, subject, html }) {
    if (!to) {
        console.warn('sendMail skipped: no recipient email provided');
        return;
    }
    try {
        await transporter.sendMail({
            from: `"PayFlow" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
    } catch (err) {
        console.error(`Failed to send email to ${to}:`, err.message);
    }
}

async function sendLeaveApprovedEmail({ to, full_name, leave_type, start_date, end_date, days }) {
    const start = new Date(start_date).toLocaleDateString();
    const end = new Date(end_date).toLocaleDateString();

    await sendMail({
        to,
        subject: 'Your leave request has been approved',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
                <h2 style="color: #0f172a;">Leave Request Approved</h2>
                <p>Hi ${full_name || 'there'},</p>
                <p>Your leave request has been <strong style="color: #059669;">approved</strong>.</p>
                <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                    <tr><td style="padding: 6px 0; color: #475569;">Leave Type</td><td style="padding: 6px 0; font-weight: 600;">${leave_type}</td></tr>
                    <tr><td style="padding: 6px 0; color: #475569;">Start Date</td><td style="padding: 6px 0; font-weight: 600;">${start}</td></tr>
                    <tr><td style="padding: 6px 0; color: #475569;">End Date</td><td style="padding: 6px 0; font-weight: 600;">${end}</td></tr>
                    <tr><td style="padding: 6px 0; color: #475569;">Days</td><td style="padding: 6px 0; font-weight: 600;">${days}</td></tr>
                </table>
                <p style="color: #94a3b8; font-size: 13px;">This is an automated message from PayFlow.</p>
            </div>
        `,
    });
}

async function sendLeaveRejectedEmail({ to, full_name, leave_type, start_date, end_date }) {
    const start = new Date(start_date).toLocaleDateString();
    const end = new Date(end_date).toLocaleDateString();

    await sendMail({
        to,
        subject: 'Your leave request has been reviewed',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
                <h2 style="color: #0f172a;">Leave Request Update</h2>
                <p>Hi ${full_name || 'there'},</p>
                <p>Your leave request has been <strong style="color: #dc2626;">rejected</strong>.</p>
                <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                    <tr><td style="padding: 6px 0; color: #475569;">Leave Type</td><td style="padding: 6px 0; font-weight: 600;">${leave_type}</td></tr>
                    <tr><td style="padding: 6px 0; color: #475569;">Start Date</td><td style="padding: 6px 0; font-weight: 600;">${start}</td></tr>
                    <tr><td style="padding: 6px 0; color: #475569;">End Date</td><td style="padding: 6px 0; font-weight: 600;">${end}</td></tr>
                </table>
                <p>If you have questions, please reach out to HR.</p>
                <p style="color: #94a3b8; font-size: 13px;">This is an automated message from PayFlow.</p>
            </div>
        `,
    });
}

async function sendPayslipReadyEmail({ to, full_name, month, year, net_salary }) {
    await sendMail({
        to,
        subject: `Your payslip for ${monthNames[month]} ${year} is ready`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
                <h2 style="color: #0f172a;">Payslip Ready</h2>
                <p>Hi ${full_name || 'there'},</p>
                <p>Your salary payment for <strong>${monthNames[month]} ${year}</strong> has been processed.</p>
                <div style="background: #ecfdf5; border-radius: 8px; padding: 16px; margin: 16px 0;">
                    <p style="margin: 0; color: #065f46; font-size: 14px;">Net Salary</p>
                    <p style="margin: 4px 0 0; color: #065f46; font-size: 22px; font-weight: 700;">
                        ETB ${Number(net_salary || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <p>Log in to PayFlow and visit "My Payslips" to download the full PDF.</p>
                <p style="color: #94a3b8; font-size: 13px;">This is an automated message from PayFlow.</p>
            </div>
        `,
    });
}

module.exports = {
    sendMail,
    sendLeaveApprovedEmail,
    sendLeaveRejectedEmail,
    sendPayslipReadyEmail,
};