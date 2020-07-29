const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const emailResetPasswordTemplate = require('../templates/emailAdminResetPassword');

module.exports = async (emailTo, userId) => {
  const transporter = nodemailer.createTransport({
    host: 'server148.web-hosting.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_SMTP_USERNAME,
      pass: process.env.EMAIL_SMTP_PASSWORD,
    },
  });

  jwt.sign({ userId }, process.env.RESET_PASSWORD_SECRET, {
    expiresIn: '1d',
  }, async (err, emailToken) => {
    if (err) {
      console.error(err);
      throw new Error('Error while sending confirmation email.');
    }
    const url = `${process.env.EMAIL_VERIFICATION_ACCOUNT_FRONTEND}/admin/reset-password/${emailToken}`;

    const info = await transporter.sendMail({
      from: `"Canada Cannabyss" <${process.env.EMAIL_SMTP_USERNAME}>`, // sender address
      to: `${emailTo}`, // list of receivers
      subject: 'Reset Password | Administrator - Canada Cannabyss', // Subject line
      html: emailResetPasswordTemplate(url),
    });
    console.log('Message sent: %s', info.messageId);

    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  });
};
