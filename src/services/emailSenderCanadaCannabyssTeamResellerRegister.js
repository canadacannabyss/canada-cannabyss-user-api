const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const emailConfirmationTemplate = require('../templates/emailRegisterCanadaCannabyssTeamReseller');

module.exports = async (email, createdBy) => {
  console.log('process.env.NODE_ENV:', process.env.NODE_ENV);
  let transporterConfig;
  if (process.env.NODE_ENV === 'production') {
    transporterConfig = {
      host: 'server148.web-hosting.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_SMTP_USERNAME,
        pass: process.env.EMAIL_SMTP_PASSWORD,
      },
    };
  } else if (process.env.NODE_ENV === 'development') {
    transporterConfig = {
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.TEST_EMAIL_USER,
        pass: process.env.TEST_EMAIL_PASSWORD,
      },
    };
  }

  const transporter = nodemailer.createTransport(transporterConfig);

  jwt.sign({ email, createdBy }, process.env.EMAIL_SECRET, {
    expiresIn: '7d',
  }, async (err, emailToken) => {
    if (err) {
      console.error(err);
      throw new Error('Error while sending confirmation email.');
    }
    const url = `${process.env.RESELLER_APP_URL}/register/main/${emailToken}`;

    const info = await transporter.sendMail({
      from: `"Canada Cannabyss" <${process.env.EMAIL_SMTP_USERNAME}>`, // sender address
      to: `${email}`, // list of receivers
      subject: 'Account Register Invitation | Canada Cannabyss Team - Canada Cannabyss', // Subject line
      html: emailConfirmationTemplate(url),
    });
    console.log('Message sent: %s', info.messageId);

    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  });
};
