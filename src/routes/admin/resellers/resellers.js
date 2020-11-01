const express = require('express');
const router = express.Router();

const AdminResellersController = require('../../../controllers/admin/resellers/resellers')

router.get('', AdminResellersController.index);

router.get('/panel', AdminResellersController.panel);

router.get('/:username', AdminResellersController.username);

router.put('/update/:id', AdminResellersController.update);

router.delete('/delete/reseller/:resellerId', AdminResellersController.delete);

module.exports = router;
