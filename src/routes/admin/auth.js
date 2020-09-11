const express = require('express');
const uuid = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const _ = require('lodash');
const authConfig = require('../../config/auth');
const multerConfig = require('../../config/multer');

const { generateAccessToken } = require('../../utils/jwt');
const { slugifyUsername } = require('../../utils/user');
const { authenticateToken } = require('../../middleware/jwt');

const emailSendResellerRegister = require('../../services/emailSenderResellerRegister');
const emailSendCanadaCannabyssTeamResellerRegister = require('../../services/emailSenderCanadaCannabyssTeamResellerRegister');
const emailSendAdmin = require('../../services/emailSenderAdmin');
const emailSendAdminResetPassword = require('../../services/emailSenderResetAdminPassword');

const AdminProfileImage = require('../../models/admin/AdminProfileImage');
const Admin = require('../../models/admin/Admin');
const TemporaryReseller = require('../../models/reseller/TemporaryReseller');
const AdminReferral = require('../../models/admin/AdminReferral');

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
  Admin.find({
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
    TemporaryReseller.findOne({ email })
      .then((user) => {
        console.log('user:', user);
        if (user) {
          errors.push({ msg: 'Email already exists' });
          res.status(400).send(errors);
        } else {
          const newTemporaryReseller = new TemporaryReseller({
            email,
            isCanadaCannabyssTeam: false,
            createdBy,
          });

          newTemporaryReseller.save().then((userInfo) => {
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

router.post('/register/main/reseller/start', async (req, res) => {
  const { email, createdBy } = req.body;

  const errors = [];

  if (!email || email.length === 0) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (errors.length > 0) {
    res.status(400).send(errors);
  } else {
    TemporaryReseller.findOne({ email })
      .then((user) => {
        console.log('user:', user);
        if (user) {
          errors.push({ msg: 'Email already exists' });
          res.status(400).send(errors);
        } else {
          const newTemporaryReseller = new TemporaryReseller({
            email,
            isCanadaCannabyssTeam: true,
            createdBy,
          });

          newTemporaryReseller.save().then((userInfo) => {
            emailSendCanadaCannabyssTeamResellerRegister(userInfo.email, userInfo.createdBy);
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

  const errors = [];

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
    const existingUser = await Admin.findOne({
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
    Admin.findOne({ email })
      .then((user) => {
        if (user) {
          errors.push({ msg: 'Email already exists' });
          res.json(errors);
        } else {
          const id = uuid.v4();

          const newAdminProfileImage = new AdminProfileImage({
            id,
            name: 'default-user.jpg',
            size: 11800,
            key: 'default/users/default-user.jpg',
            url: `${process.env.FULL_BUCKET_URL}/default/users/default-user.jpg`,
          });

          newAdminProfileImage
            .save()
            .then((image) => {
              const newUser = new Admin({
                id,
                isCanadaCannabyssTeam: false,
                names: {
                  firstName,
                  lastName,
                },
                email,
                username: slugifiedUsername,
                password,
                profileImage: image._id,
                isVerified: false,
                origin: 'Local',
              });

              bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                  if (err) throw err;
                  newUser.password = hash;
                  newUser.save().then((userInfo) => {
                    const newAdminReferral = new AdminReferral({
                      admin: userInfo._id,
                      referredAdmins: [],
                      createdOn: Date.now(),
                    });
                    newAdminReferral.save().then((referral) => {
                      Admin.findOneAndUpdate({
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

    const user = await Admin.findOne({
      email,
      isVerified: true,
    });

    if (!user) {
      errors.push({ msg: 'Admin does not exist' });
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
    const userInfoObj = await Admin.findOne({
      _id: user.id,
    }).populate({
      path: 'profileImage',
      model: AdminProfileImage,
    }).populate({
      path: 'referral',
      model: AdminReferral,
    });
    if (!userInfoObj) return res.sendStatus(404);
    return res.status(200).send(userInfoObj);
  });
});

router.post('/reset-password/sent', async (req, res) => {
  const { email } = req.body;

  console.log('email:', email);

  Admin.findOne({
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
      Admin.findOne({
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

        Admin.findOne({
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
                  Admin.findOneAndUpdate({
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
      Admin.findOneAndUpdate({
        _id: decodedToken.userId,
        isVerified: false,
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

      const adminAdminProfileImage = await AdminProfileImage.create({
        id,
        name,
        size,
        key,
        url,
      });

      res.status(200).send(adminAdminProfileImage);
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
    const profilePicture = await AdminProfileImage.findOne({
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
