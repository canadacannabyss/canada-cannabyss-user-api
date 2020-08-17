const express = require('express');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { slugifyUsername } = require('../../utils/user');

const emailSendReseller = require('../../services/emailSenderReseller');

const User = require('../../models/user/User');
const UserProfileImage = require('../../models/user/UserProfileImage');
const TemporaryUserReseller = require('../../models/user/TemporaryUserReseller');
const Referral = require('../../models/user/Referral');

const router = express.Router();

router.get('/verify/registration/:token', async (req, res) => {
  const { token } = req.params;

  try {
    jwt.verify(token, process.env.EMAIL_SECRET, (err, decodedToken) => {
      if (err) return res.status(404).send({ error: 'This link is expired' });
      console.log('decoedToken:', decodedToken);
      TemporaryUserReseller.findOne({
        email: decodedToken.email,
        createdBy: decodedToken.createdBy,
      }).populate({
        path: 'createdBy',
        model: User,
      })
        .then((tempUser) => {
          res.status(200).send(tempUser);
        }).catch((error) => {
          console.error(error);
        });
    });
  } catch (err) {
    console.log(err);
  }
});

router.get('/verify/username/:username', (req, res) => {
  const { username } = req.params;
  console.log('username:', username);
  let valid = true;
  User.find({
    username,
  })
    .then((users) => {
      console.log('users:', users);
      if (users.length > 0) {
        valid = false;
      }
      res.json({
        valid,
      });
    })
    .catch((err) => {
      res.json({
        err,
      });
    });
});

router.post('/register', async (req, res) => {
  const {
    firstName,
    lastName,
    username,
    email,
    password,
    password2,
  } = req.body;

  const errors = [];

  if (firstName.length === 0
    && lastName.length === 0
    && username.length === 0
    && email.length === 0
    && password.length === 0
    && password2.length === 0) {
    errors.push({ msg: 'All fields must me filled' });
  }

  if (password !== password2) {
    errors.push({ msg: 'Passwords must match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  const slugifiedUsername = slugifyUsername(username);

  try {
    const existingUser = await User.findOne({
      username: slugifiedUsername,
    });
    if (existingUser) {
      errors.push({ msg: 'Username already exist' });
    }
  } catch (err) {
    console.error(err);
    errors.push({ msg: 'Error while finding existing user' });
  }

  if (errors.length > 0) {
    res.status(400).send(errors);
  } else {
    User.findOne({ email })
      .then((user) => {
        if (user) {
          errors.push({ msg: 'Email already exists' });
          res.json(errors);
        } else {
          const id = uuid.v4();

          const newUserProfileImage = new UserProfileImage({
            id,
            name: 'default-user.jpg',
            size: 11800,
            key: 'default/users/default-user.jpg',
            url: `${process.env.FULL_BUCKET_URL}/default/users/default-user.jpg`,
          });

          newUserProfileImage
            .save()
            .then((image) => {
              const newUser = new User({
                id,
                names: {
                  firstName,
                  lastName,
                },
                email,
                username: slugifiedUsername,
                password,
                profileImage: image._id,
                isVerified: false,
                isAdmin: false,
                isReseller: true,
                origin: 'Local',
              });

              bcrypt.genSalt(10, (saltError, salt) => {
                bcrypt.hash(newUser.password, salt, (hashError, hash) => {
                  if (hashError) throw hashError;
                  newUser.password = hash;
                  newUser.save().then((userInfo) => {
                    const newReferral = new Referral({
                      user: userInfo._id,
                      referredUsers: [],
                      createdOn: Date.now(),
                    });
                    newReferral.save().then((referral) => {
                      User.findOneAndUpdate({
                        _id: userInfo._id,
                      }, {
                        referral: referral._id,
                      }, {
                        runValidators: true,
                      }).then(() => {
                        emailSendReseller(userInfo.email, userInfo._id);
                        res.status(200).send({ ok: true });
                      });
                    });
                  });
                });
              });
            })
            .catch((err) => {
              console.error(err);
            });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }
});

module.exports = router;
