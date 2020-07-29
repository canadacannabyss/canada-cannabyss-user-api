const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const emailConfirmationTemplate = require('../templates/emailConfirmation');

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

  jwt.sign({ userId }, process.env.EMAIL_SECRET, {
    expiresIn: '1d',
  }, async (err, emailToken) => {
    if (err) {
      console.error(err);
      throw new Error('Error while sending confirmation email.');
    }
    const url = `${process.env.EMAIL_VERIFICATION_ACCOUNT_FRONTEND}/confirmation/${emailToken}`;

    const info = await transporter.sendMail({
      from: `"Canada Cannabyss" <${process.env.EMAIL_SMTP_USERNAME}>`, // sender address
      to: `${emailTo}`, // list of receivers
      subject: 'Account Verification - Canada Cannabyss', // Subject line
      html: emailConfirmationTemplate(url),
    });
    console.log('Message sent: %s', info.messageId);

    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  });
};
