import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
    // If SMTP is not configured, fallback to console log (safety net)
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.warn('SMTP settings not found. Logging email instead.');
        console.log(`[EMAIL to ${to}]: ${subject}`);
        console.log(html);
        return;
    }

    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Admin Dashboard" <no-reply@example.com>',
            to,
            subject,
            html,
        });
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Could not send email');
    }
};
