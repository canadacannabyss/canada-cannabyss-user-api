const emailSendTrackingNumber = require('../../../services/emailSenderTrackingNumber');

module.exports = {
  sendTrackingNumber: async (req, res) => {
    const { order } = req.body;
  
    console.log('order:', order);
  
    try {
      emailSendTrackingNumber(order);
      return res.status(200).send({ ok: true });
    } catch (err) {
      console.log(err);
    }
  }
}