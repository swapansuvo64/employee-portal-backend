// middleware/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // or your SMTP service
            auth: {
                user: "suvadeepprojects@gmail.com", // Replace with your email
                pass: "otih prsy iqmy cepp", // Replace with your app-specific password
            }
        });

        const mailOptions = {
            from: `"Employee" <your_email@gmail.com>`,
            to: options.to,
            subject: options.subject,
            html: options.html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent: ${info.messageId}`);
        return { success: true, info };
    } catch (error) {
        console.error('❌ Email send error:', error);
        return { success: false, error };
    }
};

module.exports = sendEmail;
