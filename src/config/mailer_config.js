const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendMail = async (to, subject, text, html) => {
    try {
        let info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            html
        });
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email: ', error.message);
    }
};

module.exports = sendMail;