
const nodemailer = require('nodemailer');
const sendEmail = async data => {


    var transport = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
        }
    });

    const message = {
        from: 'support@upturn.com',
        to: data.to,
        subject: data.subject,
        text: data.message
    };
    await transport.sendMail(message);

};

module.exports = sendEmail;