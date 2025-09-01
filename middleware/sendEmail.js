// middleware/sendEmail.js
const nodemailer = require('nodemailer');
require('dotenv').config();
const sendEmail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
 host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
 tls: {
  rejectUnauthorized: true
}
});

        const mailOptions = {
             from: `"Sequoia Print pvt ltd" <business@sequoia-print.com>`,
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
