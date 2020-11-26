import { Request } from 'aws-sdk'
import { Request, Response } from 'express'
import emailSendTrackingNumber from '../../../services/emailSenderTrackingNumber'

export async function sendTrackingNumber(
  req: Request,
  res: Response,
): Promise<any> {
  const { order } = req.body

  console.log('order:', order)

  try {
    emailSendTrackingNumber(order)
    res.status(200).send({ ok: true })
  } catch (err) {
    console.log(err)
  }
}
