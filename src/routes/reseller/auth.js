const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { generateAccessToken } = require('../../utils/jwt');

const User = require('../../models/user/User');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log(email, password);

  try {
    const errors = [];

    if (!email || email.length === 0 || !password || password.length === 0) {
      errors.push({ msg: 'Please enter all fields' });
    }

    const user = await User.findOne({
      email,
      isReseller: true,
      isVerified: true,
      isAdmin: false,
    });

    console.log('reseller user:', user);

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

module.exports = router;
