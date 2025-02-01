const nodemailer = require('nodemailer');
const Config = require('../config');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: Config.EMAIL_USER, // Your email
        pass: Config.EMAIL_PASS  // Your email password or App Password
    }
});

const sendEmail = async (to, subject, text) => {
    try {
        const mailOptions = {
            from: `"DropBox Team" <${Config.EMAIL_USER}>`,
            to,
            subject,
            text
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Email Sending Error:", error);
    }
};

module.exports = sendEmail;
