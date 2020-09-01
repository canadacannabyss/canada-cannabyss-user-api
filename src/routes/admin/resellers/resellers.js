const express = require('express');

const router = express.Router();

const User = require('../../../models/user/User');
const UserProfileImage = require('../../../models/user/UserProfileImage');
const Referral = require('../../../models/user/Referral');

router.get('', (req, res) => {
  User.find({
    isReseller: true,
  }).then((users) => {
    console.log('users resellers:', users);
    res.status(200).send(users);
  }).catch((err) => {
    console.log(err);
  });
});

router.get('/:username', (req, res) => {
  const { username } = req.params;

  User.findOne({
    isReseller: true,
    username,
  }).then((users) => {
    console.log('users resellers:', users);
    res.status(200).send(users);
  }).catch((err) => {
    console.log(err);
  });
});

module.exports = router;
