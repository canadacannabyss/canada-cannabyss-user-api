const express = require('express');

const router = express.Router();

const AdminCustomersController = require('../../../controllers/admin/customers/customers')

router.post('/send/tracking-number', AdminCustomersController.sendTrackingNumber);

module.exports = router;
