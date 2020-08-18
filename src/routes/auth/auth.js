/* eslint-disable no-await-in-loop */
/* eslint-disable no-shadow */
/* eslint-disable no-underscore-dangle */
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const { authenticateToken } = require('../../middleware/jwt');
const { generateAccessToken, decodeToken } = require('../../utils/jwt');
const { slugifyUsername } = require('../../utils/user');
const emailSend = require('../../services/emailSender');
const emailSendResetPassword = require('../../services/emailSenderResetPassword');

const User = require('../../models/user/User');
const UserProfileImage = require('../../models/user/UserProfileImage');
const RefreshToken = require('../../models/user/RefreshToken');
const Referral = require('../../models/user/Referral');

const router = express.Router();

router.get(
  '/facebook',
  passport.authenticate('facebook', { scope: ['email'] }),
);

router.get(
  '/facebook/callback',
  passport.authenticate('facebook'),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/`);
  },
);

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  }),
);

router.get('/google/callback', passport.authenticate('google'), (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/`);
});

router.get('/users', authenticateToken, (req, res) => {
  User.find()
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      console.error(err);
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
  console.log('req.body:', req.body);

  if (
    !firstName
    || firstName.length === 0
    || !lastName
    || lastName.length === 0
    || !username
    || username.length === 0
    || !email
    || email.length === 0
    || !password
    || password.length === 0
    || !password2
    || password2.length === 0
  ) {
    errors.push({ msg: 'Please enter all fields' });
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

  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.json(errors);
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
                isAdmin: false,
                origin: 'Local',
              });

              bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                  if (err) throw err;
                  newUser.password = hash;
                  newUser.save().then((user) => {
                    const newReferral = new Referral({
                      user: user._id,
                      referredUsers: [],
                      createdOn: Date.now(),
                    });
                    newReferral.save().then((referral) => {
                      User.findOneAndUpdate({
                        _id: user._id,
                      }, {
                        referral: referral._id,
                      }, {
                        runValidators: true,
                      }).then((updatedUser) => {
                        emailSend(user.email, user._id);
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

router.post('/register/referral', async (req, res) => {
  const {
    firstName,
    lastName,
    username,
    email,
    password,
    password2,
    referralId,
  } = req.body;

  const errors = [];
  console.log('req.body:', req.body);

  if (
    !firstName
    || firstName.length === 0
    || !lastName
    || lastName.length === 0
    || !username
    || username.length === 0
    || !email
    || email.length === 0
    || !password
    || password.length === 0
    || !password2
    || password2.length === 0
  ) {
    errors.push({ msg: 'Please enter all fields' });
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

  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.json(errors);
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
                isReseller: false,
                origin: 'Local',
              });

              bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                  if (err) throw err;
                  newUser.password = hash;
                  newUser.save().then((user) => {
                    const newReferral = new Referral({
                      user: user._id,
                      referredUsers: [],
                      createdOn: Date.now(),
                    });
                    newReferral.save().then((referral) => {
                      User.findOneAndUpdate({
                        _id: user._id,
                      }, {
                        referral: referral._id,
                      }, {
                        runValidators: true,
                      }).then(() => {
                        Referral.findOne({
                          _id: referralId,
                        }).then(((referral) => {
                          const referredUsersObj = [...referral.referredUsers];
                          referredUsersObj.push(user._id);
                          Referral.findOneAndUpdate({
                            _id: referral._id,
                          }, {
                            referredUsers: referredUsersObj,
                          }, {
                            runValidators: true,
                          }).then(() => {
                            emailSend(user.email, user._id);
                            res.status(200).send({ ok: true });
                          }).catch((err) => {
                            console.log(err);
                          });
                        })).catch((err) => {
                          console.error(err);
                        });
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

router.post('/token', (req, res) => {
  const { refreshToken } = req.body;
  try {
    if (refreshToken === null) res.sendStatus(401);
    const refreshTokenObj = RefreshToken.findOne({
      token: refreshToken,
    });
    if (!refreshTokenObj) return res.sendStatus(403);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      const accessToken = generateAccessToken(user);
      return res.status(200).send({ accessToken });
    });
  } catch (err) {
    console.error(err);
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const errors = [];

    if (!email || email.length === 0 || !password || password.length === 0) {
      errors.push({ msg: 'Please enter all fields' });
    }

    const user = await User.findOne({
      email,
      isReseller: false,
      isAdmin: false,
      isVerified: true,
    });

    if (!user) {
      errors.push({ msg: 'User does not exist' });
    }

    if (errors.length > 0) {
      res.json(errors);
    } else {
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) throw err;

        if (isMatch) {
          const userObj = {
            _id: user._id,
            names: {
              firstName: user.names.firstName,
              lastName: user.names.lastName,
            },
            email: user.email,
            password: user.password,
            origin: user.origin,
            createdOn: user.createdOn,
            __v: user.__v,
          };
          const accessToken = generateAccessToken(userObj);
          const refreshToken = jwt.sign(
            userObj,
            process.env.REFRESH_TOKEN_SECRET,
          );
          console.log('accessToken:', accessToken);
          console.log('refreshToken:', refreshToken);
          res.status(200).send({ accessToken, refreshToken });
        } else {
          errors.push({ msg: 'Incorrect password' });
          res.json(errors);
        }
      });
    }
  } catch (err) {
    console.error(err);
  }
});

router.post('/decode/token', authenticateToken, (req, res) => {
  const { accessToken } = req.body;
  const authHeader = req.headers.authorization;
  const tokenHeader = authHeader && authHeader.split(' ')[1];
  if (accessToken !== tokenHeader) return res.sendStatus(403);
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
    if (err) return res.sendStatus(403);
    const userInfoObj = await User.findOne({
      _id: user.id,
    }).populate({
      path: 'profileImage',
      model: UserProfileImage,
    }).populate({
      path: 'referral',
      model: Referral,
    });
    if (!userInfoObj) return res.sendStatus(404);
    return res.status(200).send(userInfoObj);
  });
});

router.get('/confirmation/:token', async (req, res) => {
  const { token } = req.params;
  try {
    jwt.verify(token, process.env.EMAIL_SECRET, (err, decodedToken) => {
      if (err) return res.status(404).send({ error: 'This link is expired' });
      User.findOneAndUpdate({
        _id: decodedToken.userId,
        isVerified: false,
        isAdmin: false,
      }, {
        isVerified: true,
      }, {
        runValidators: true,
      }).then((user) => {
        console.log('user:', user);
        if (user) {
          Referral.findOne({
            referredUsers: user._id,
          }).then((referral) => {
            console.log('referral:', referral);
            if (referral) {
              User.findOne({
                _id: referral.user,
              }).then((referralUser) => {
                User.findOneAndUpdate({
                  _id: referralUser._id,
                }, {
                  credits: referralUser.credits + 5,
                }, {
                  runValidators: true,
                }).then(() => {
                  res.status(200).send(user);
                }).catch((err) => {
                  console.error(err);
                });
              }).catch((err) => {
                console.error(err);
              });
            } else {
              res.status(200).send(user);
            }
          }).catch((err) => {
            console.error(err);
          });
        } else {
          res.status(404).send({ notValid: 'This link is not valid' });
        }
      }).catch((err) => {
        console.error(err);
        res.sendStatus(400);
      });
    });
  } catch (err) {
    console.error(err);
  }
});

router.post('/reset-password/sent', async (req, res) => {
  const { email } = req.body;

  console.log('email:', email);

  User.findOne({
    email,
    isAdmin: false,
  }).then((user) => {
    if (user) {
      emailSendResetPassword(user.email, user._id);
      res.status(200).send({
        ok: true,
      });
    } else {
      res.status(404).send({
        error: 'Account not found.',
      });
    }
  }).catch((err) => {
    console.error(err);
    res.status(404).send({
      error: 'Something went wrong.',
    });
  });
});

router.get('/reset-password/validating/token/:token', async (req, res) => {
  const { token } = req.params;
  try {
    jwt.verify(token, process.env.RESET_PASSWORD_SECRET, (err, decodedToken) => {
      if (err) return res.status(404).send({ error: 'This link is expired' });
      User.findOne({
        _id: decodedToken.userId,
      }).then((user) => {
        if (user) {
          res.status(200).send(user);
        } else {
          res.status(404).send({ notValid: 'This link is not valid' });
        }
      }).catch((err) => {
        console.error(err);
        res.sendStatus(400);
      });
    });
  } catch (err) {
    console.error(err);
  }
});

router.post('/reset-password', async (req, res) => {
  const {
    token,
    password,
    password2,
  } = req.body;

  console.log(password,
    password2);

  try {
    if (password === password2) {
      jwt.verify(token, process.env.RESET_PASSWORD_SECRET, (err, decodedToken) => {
        if (err) return res.status(404).send({ error: 'This link is expired' });

        User.findOne({
          _id: decodedToken.userId,
        }).then((user) => {
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;

            if (isMatch) {
              console.log({ error: 'Do not use the your current password.' });
            } else {
              bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(password, salt, (err, hash) => {
                  if (err) throw err;
                  User.findOneAndUpdate({
                    _id: user._id,
                  }, {
                    password: hash,
                  }, {
                    runValidators: true,
                  }).then(() => {
                    res.status(200).send({
                      ok: true,
                    });
                  }).catch((err) => {
                    console.error(err);
                  });
                });
              });
            }
          });
        }).catch((err) => {
          console.error(err);
        });
      });
    } else {
      console.log({ error: 'Passwords does not match.' });
      res.json({ error: 'Passwords does not match.' });
    }
  } catch (err) {
    console.error(err);
  }
});

// Logout
router.delete('/logout', authenticateToken, async (req, res) => {
  const { refreshToken } = req.body;

  await RefreshToken.findOneAndDelete({
    refreshToken,
  });

  res.sendStatus(204);
});

module.exports = router;
