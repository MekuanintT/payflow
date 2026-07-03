const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
    family: 4,
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