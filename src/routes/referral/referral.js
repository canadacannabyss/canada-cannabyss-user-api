const express = require('express');

const router = express.Router();

const User = require('../../models/user/User');
const Referral = require('../../models/user/Referral');

router.get('/verify', (req, res) => {
  const { referral } = req.query;
  let found = true;
  console.log('referral:', referral);
  Referral.findOne({
    _id: referral,
  }).then((referralObj) => {
    if (!referralObj) found = false;
    res.json(found);
  }).catch((err) => {
    res.json(false);
  });
});

router.get('/user', (req, res) => {
  const { referral } = req.query;
  console.log('referral:', referral);
  Referral.findOne({
    _id: referral,
  }).populate({
    path: 'user',
    model: User,
  })
    .then((referralObj) => {
      res.json({
        names: {
          firstName: referralObj.user.names.firstName,
          lastName: referralObj.user.names.lastName,
        },
      });
    }).catch((err) => {
      res.json(false);
    });
});

module.exports = router;
