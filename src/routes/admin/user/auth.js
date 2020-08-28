const express = require('express');
const uuid = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const _ = require('lodash');
const authConfig = require('../../../config/auth');
const multerConfig = require('../../../config/multer');

const { generateAccessToken } = require('../../../utils/jwt');
const { slugifyUsername } = require('../../../utils/user');

const emailSendResellerRegister = require('../../../services/emailSenderResellerRegister');
const emailSendAdmin = require('../../../services/emailSenderAdmin');
const emailSendAdminResetPassword = require('../../../services/emailSenderResetAdminPassword');

const UserProfileImage = require('../../../models/user/UserProfileImage');
const User = require('../../../models/user/User');
const TemporaryUserReseller = require('../../../models/user/TemporaryUserReseller');
const Referral = require('../../../models/user/Referral');

const router = express.Router();

router.post('/verify/su', (req, res) => {
  const { username, password } = req.body;
  const su = {
    username: process.env.SU_USERNAME,
    password: process.env.SU_PASSWORD,
  };
  if (username === su.username && password === su.password) {
    res.status(200).send({
      isSU: true,
    });
  } else {
    res.status(200).send({
      isSU: false,
    });
  }
});

router.get('/verify/admin/username/:username', (req, res) => {
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

router.post('/register/reseller/start', async (req, res) => {
  const { email, createdBy } = req.body;

  const errors = [];

  if (!email || email.length === 0) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (errors.length > 0) {
    res.status(400).send(errors);
  } else {
    TemporaryUserReseller.findOne({ email })
      .then((user) => {
        console.log('user:', user);
        if (user) {
          errors.push({ msg: 'Email already exists' });
          res.status(400).send(errors);
        } else {
          const newTemporaryUserReseller = new TemporaryUserReseller({
            email,
            createdBy,
          });

          newTemporaryUserReseller.save().then((userInfo) => {
            emailSendResellerRegister(userInfo.email, userInfo.createdBy);
            res.status(200).send({ email: userInfo.email, ok: true });
          });
        }
      })
      .catch((err) => {
        console.error(err);
        errors.push({ msg: 'Server error' });
        res.status(400).send(errors);
      });
  }
});

router.post('/register', async (req, res) => {
  const {
    firstName, lastName, username, email, password, password2,
  } = req.body;

  console.log(firstName, lastName, username, email, password, password2);

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
                isAdmin: true,
                isReseller: false,
                origin: 'Local',
              });

              bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                  if (err) throw err;
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
                      }).then((updatedUser) => {
                        emailSendAdmin(userInfo.email, userInfo._id);
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

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const errors = [];

    if (!email || email.length === 0 || !password || password.length === 0) {
      errors.push({ msg: 'Please enter all fields' });
    }

    const user = await User.findOne({
      email,
      isAdmin: true,
      isVerified: true,
      isReseller: false,
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

router.post('/reset-password/sent', async (req, res) => {
  const { email } = req.body;

  console.log('email:', email);

  User.findOne({
    email,
    isAdmin: true,
  }).then((user) => {
    if (user) {
      emailSendAdminResetPassword(user.email, user._id);
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
  console.log('testing token:', token);
  try {
    jwt.verify(token, process.env.RESET_PASSWORD_SECRET, (err, decodedToken) => {
      console.log(err);
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

router.get('/confirmation/:token', async (req, res) => {
  const { token } = req.params;
  try {
    jwt.verify(token, process.env.EMAIL_SECRET, (err, decodedToken) => {
      if (err) return res.status(404).send({ error: 'This link is expired' });
      User.findOneAndUpdate({
        _id: decodedToken.userId,
        isVerified: false,
        isAdmin: true,
      }, {
        isVerified: true,
      }, {
        runValidators: true,
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

router.post(
  '/upload/profile-image',
  multer(multerConfig).single('file'),
  async (req, res) => {
    console.log(req.file);
    try {
      const {
        originalname: name, size, key, location: url = '',
      } = req.file;
      const id = uuidv4();

      const adminUserProfileImage = await UserProfileImage.create({
        id,
        name,
        size,
        key,
        url,
      });

      res.status(200).send(adminUserProfileImage);
    } catch (err) {
      console.log(err);
    }
  },
);

router.post('/set/global-variable', async (req, res) => {
  const { type, title } = req.body;
  global.gConfigMulter.type = type;
  global.gConfigMulter.title = title;
  global.gConfigMulter.folder_name = global.gConfigMulter.title;
  global.gConfigMulter.destination = `${global.gConfigMulter.type}/${global.gConfigMulter.folder_name}`;
  res.status(200).send({
    ok: true,
  });
});

router.delete('/delete/cover/:id', async (req, res) => {
  const { id } = req.params;
  try {
    console.log('deleting:', id);
    const profilePicture = await UserProfileImage.findOne({
      id,
    });
    await profilePicture.remove();
    return res.send({
      msg: 'Blog Post cover file successfully deleted',
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
