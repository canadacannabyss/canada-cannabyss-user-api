/* eslint-disable no-await-in-loop */
/* eslint-disable no-shadow */
/* eslint-disable no-underscore-dangle */
const express = require('express');

const emailSendTrackingNumber = require('../../../services/emailSenderTrackingNumber');

const router = express.Router();

router.post('/send/tracking-number', async (req, res) => {
  const { order } = req.body;

  console.log('order:', order);

  try {
    emailSendTrackingNumber(order);
    res.status(200).send({ ok: true });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
