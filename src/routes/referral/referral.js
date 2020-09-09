const express = require('express');

const router = express.Router();

const Customer = require('../../models/customer/Customer');
const Admin = require('../../models/admin/Admin');
const Reseller = require('../../models/reseller/Reseller');

const CustomerProfileImage = require('../../models/user/UserProfileImage');
const AdminProfileImage = require('../../models/user/UserProfileImage');
const ResellerProfileImage = require('../../models/user/UserProfileImage');

const CustomerReferral = require('../../models/customer/CustomerReferral');
const AdminReferral = require('../../models/admin/AdminReferral');
const ResellerReferral = require('../../models/reseller/ResellerReferral');

router.get('/customer/verify', (req, res) => {
  const { referral } = req.query;
  let found = true;
  CustomerReferral.findOne({
    _id: referral,
  }).then((referralObj) => {
    console.log('referralObj:', referralObj);
    if (!referralObj) found = false;
    console.log('found:', found);
    res.json(found);
  }).catch((err) => {
    res.json(false);
  });
});

router.get('/admin/verify', (req, res) => {
  const { referral } = req.query;
  let found = true;
  console.log('referral:', referral);
  AdminReferral.findOne({
    _id: referral,
  }).then((referralObj) => {
    if (!referralObj) found = false;
    res.json(found);
  }).catch((err) => {
    res.json(false);
  });
});

router.get('/reseller/verify', (req, res) => {
  const { referral } = req.query;
  let found = true;
  console.log('referral:', referral);
  ResellerReferral.findOne({
    _id: referral,
  }).then((referralObj) => {
    if (!referralObj) found = false;
    res.json(found);
  }).catch((err) => {
    res.json(false);
  });
});

router.get('/customer', (req, res) => {
  const { referral } = req.query;

  CustomerReferral.findOne({
    _id: referral,
  }).populate({
    path: 'customer',
    model: Customer,
  })
    .then((referralObj) => {
      res.json({
        names: {
          firstName: referralObj.customer.names.firstName,
          lastName: referralObj.customer.names.lastName,
        },
      });
    }).catch((err) => {
      res.json(false);
    });
});

router.get('/admin', (req, res) => {
  const { referral } = req.query;

  AdminReferral.findOne({
    _id: referral,
  }).populate({
    path: 'admin',
    model: Admin,
  })
    .then((referralObj) => {
      res.json({
        names: {
          firstName: referralObj.admin.names.firstName,
          lastName: referralObj.admin.names.lastName,
        },
      });
    }).catch((err) => {
      res.json(false);
    });
});

router.get('/reseller', (req, res) => {
  const { referral } = req.query;

  ResellerReferral.findOne({
    _id: referral,
  }).populate({
    path: 'reseller',
    model: Reseller,
  })
    .then((referralObj) => {
      res.json({
        names: {
          firstName: referralObj.reseller.names.firstName,
          lastName: referralObj.reseller.names.lastName,
        },
      });
    }).catch((err) => {
      res.json(false);
    });
});

router.get('/customer/get/invited-friends/:customerId', (req, res) => {
  const { customerId } = req.params;

  CustomerReferral.findOne({
    customer: customerId,
  }).populate({
    path: 'referredCustomers',
    model: Customer,
    populate: {
      path: 'profileImage',
      model: CustomerProfileImage,
    },
  })
    .then((referralObj) => {
      res.status(200).send(referralObj.referredCustomers);
    }).catch((err) => {
      console.log(err);
    });
});

router.get('/admin/get/invited-friends/:adminId', (req, res) => {
  const { adminId } = req.params;

  AdminReferral.findOne({
    user: adminId,
  }).populate({
    path: 'referredAdmins',
    model: Admin,
    populate: {
      path: 'profileImage',
      model: AdminProfileImage,
    },
  })
    .then((referralObj) => {
      res.status(200).send(referralObj.referredAdmins);
    }).catch((err) => {
      console.log(err);
    });
});

router.get('/reseller/get/invited-friends/:resellerId', (req, res) => {
  const { resellerId } = req.params;

  ResellerReferral.findOne({
    user: resellerId,
  }).populate({
    path: 'referredResellers',
    model: Reseller,
    populate: {
      path: 'profileImage',
      model: ResellerProfileImage,
    },
  })
    .then((referralObj) => {
      res.status(200).send(referralObj.referredResellers);
    }).catch((err) => {
      console.log(err);
    });
});

module.exports = router;
