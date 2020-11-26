import { Router } from 'express'

import emailSendFinishedOrder from '../../services/emailSenderFinishedOrder'

import { subscribe } from '../../utils/mailchimp/mailchimp'

const router = Router()

router.post('/send/finished-order', async (req, res) => {
  const { order } = req.body

  console.log('order:', order)

  try {
    emailSendFinishedOrder(order)
    res.status(200).send({ ok: true })
  } catch (err) {
    console.log(err)
  }
})

router.post('/mailchimp/subscribe', async (req, res) => {
  const { email } = req.body

  try {
    const mcRes = await subscribe(email)

    res.status(200).send({ ok: true, mcRes })
  } catch (err) {
    console.log(err)
  }
})

export default router
