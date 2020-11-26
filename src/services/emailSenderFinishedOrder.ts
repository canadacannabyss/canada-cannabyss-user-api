import nodemailer from 'nodemailer'
import emailConfirmationTemplate from '../templates/emailFinishedOrder'
import { IOrder, ITransporterConfig } from '../interfaces/services/emailSender'

export default async (order: IOrder) => {
  let transporterConfig: ITransporterConfig
  if (process.env.NODE_ENV === 'production') {
    transporterConfig = {
      host: 'server148.web-hosting.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_SMTP_USERNAME,
        pass: process.env.EMAIL_SMTP_PASSWORD,
      },
    }
  } else if (process.env.NODE_ENV === 'development') {
    transporterConfig = {
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.TEST_EMAIL_USER,
        pass: process.env.TEST_EMAIL_PASSWORD,
      },
    }
  }

  const transporter = nodemailer.createTransport(transporterConfig)

  const info = await transporter.sendMail({
    from: `"Canada Cannabyss" <${process.env.EMAIL_SMTP_USERNAME}>`, // sender address
    to: `${order.customer.email}`, // list of receivers
    subject: 'You order was successfully placed - Canada Cannabyss', // Subject line
    html: emailConfirmationTemplate(order),
  })
  console.log('Message sent: %s', info.messageId)

  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
}
