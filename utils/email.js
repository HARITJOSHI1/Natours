const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Create a transporter (service that will actually send the emails)
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth:{
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // 2. Define email options (specifies email subject, body, and other meta data) 
    const mailOptions = {
        from: "Harit Joshi <admin@gmail.com>",
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    // 3. Send email to the user
    await transporter.sendMail(mailOptions); // returns a promise

};

module.exports = sendEmail;