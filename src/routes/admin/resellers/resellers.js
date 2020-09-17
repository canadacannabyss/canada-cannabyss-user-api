const express = require('express');
const _ = require('lodash');

const router = express.Router();

const {
  slugifyString,
  generateRandomSlug,
  slugifyUsername,
} = require('../../../utils/strings/slug');

const Reseller = require('../../../models/reseller/Reseller');
const ResellerProfileImage = require('../../../models/reseller/ResellerProfileImage');
const ResellerReferral = require('../../../models/reseller/ResellerReferral');

const verifyValidResellerUsername = async (username, id) => {
  try {
    const reseller = await Reseller.find({
      username,
    });
    if (reseller.length === 1) {
      console.log('reseller[0]._id:', reseller[0]._id);
      console.log('typeof reseller[0]._id:', typeof JSON.stringify(reseller[0]._id));
      console.log('id:', id);
      console.log('typeof id:', typeof id);
      console.log('reseller[0]._id === id:', JSON.stringify(reseller[0]._id) === id);
      if (JSON.stringify(reseller[0]._id) === id) {
        return true;
      }
      return false;
    }
    return true;
  } catch (err) {
    console.log(err);
  }
};

router.get('', (req, res) => {
  Reseller.find().then((users) => {
    res.status(200).send(users);
  }).catch((err) => {
    console.log(err);
  });
});

router.get('/panel', (req, res) => {
  Reseller.find()
    .populate({
      path: 'profileImage',
      model: ResellerProfileImage,
    })
    .then((users) => {
      res.status(200).send(users);
    }).catch((err) => {
      console.log(err);
    });
});

router.get('/:username', (req, res) => {
  const { username } = req.params;
  Reseller.findOne({
    username,
  })
    .populate({
      path: 'profileImage',
      model: ResellerProfileImage,
    })
    .populate({
      path: 'referral',
      model: ResellerReferral,
    })
    .then((user) => {
      console.log('user reseller:', user);
      res.status(200).send(user);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.put('/update/:id', async (req, res) => {
  const {
    names,
    username,
    email,
    phone,
  } = req.body;
  const { id } = req.params;

  let newUsername = slugifyUsername(username);

  if (!(await verifyValidResellerUsername(username, id))) {
    newUsername = await generateRandomSlug(username);
  }
  try {
    await Reseller.findOneAndUpdate(
      {
        _id: id,
      },
      {
        names: {
          firstName: names.firstName,
          lastName: names.lastName,
        },
        username: newUsername,
        email,
        phone,
        updatedOn: Date.now(),
      },
      {
        runValidators: true,
      },
    );

    res.status(200).send({
      ok: true,
    });
  } catch (err) {
    console.log(err);
  }
});

router.delete('/delete/reseller/:resellerId', async (req, res) => {
  const { resellerId } = req.params;

  try {
    const resellerObj = await Reseller.findOne({
      _id: resellerId,
    })
      .populate({
        path: 'profileImage',
        model: ResellerProfileImage,
      })
      .populate({
        path: 'referral',
        model: ResellerReferral,
      });

    const resellerProfileImageObj = await ResellerProfileImage.findOne({
      _id: resellerObj.profileImage._id,
    });

    const resellerReferralObj = await ResellerReferral.findOne({
      _id: resellerObj.referral._id,
    });

    resellerProfileImageObj.remove();
    resellerReferralObj.remove();
    resellerObj.remove();

    res.status(200).send({ ok: true });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
