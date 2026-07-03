const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

async function sendMail({ to, subject, html }) {
    const info = await transporter.sendMail({
        from: `"PayFlow" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    });
    return info;
}

module.exports = { sendMail };
