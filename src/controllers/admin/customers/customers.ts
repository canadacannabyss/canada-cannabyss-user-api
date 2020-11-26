import { Request, Response } from 'express'
import emailSendTrackingNumber from '../../../services/emailSenderTrackingNumber'

export async function sendTrackingNumber(
  req: Request,
  res: Response,
): Promise<Response> {
  const { order } = req.body

  try {
    emailSendTrackingNumber(order)
    return res.status(200).send({ ok: true })
  } catch (err) {
    console.log(err)
  }
}
