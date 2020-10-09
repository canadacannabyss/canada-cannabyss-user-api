/* eslint-disable no-await-in-loop */
/* eslint-disable no-shadow */
/* eslint-disable no-underscore-dangle */
const express = require('express');
const fetch = require('node-fetch');

const emailSendFinishedOrder = require('../../services/emailSenderFinishedOrder');

const { subscribe, old } = require('../../utils/mailchimp/mailchimp');

const router = express.Router();

router.post('/send/finished-order', async (req, res) => {
  const { order } = req.body;

  console.log('order:', order);

  try {
    emailSendFinishedOrder(order);
    res.status(200).send({ ok: true });
  } catch (err) {
    console.log(err);
  }
});

router.post('/mailchimp/subscribe', async (req, res) => {
  const { email } = req.body;

  try {
    const mcRes = await subscribe(email);

    res.status(200).send({ ok: true, mcRes });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
