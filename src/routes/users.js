const express = require('express');

const router = express.Router();
// const bcrypt = require('bcryptjs');
// const passport = require('passport');

// Load User model
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/user/User');
const multerConfig = require('../config/multer');
const UserProfileImage = require('../models/user/UserProfileImage');

const user = {};

router.get('/all', (req, res) => {
  const usersList = [];
  User.find()
    .populate('profileImage')
    .then((users) => {
      users.map((user) => {
        usersList.push({
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          profileImage: user.profileImage,
          isAdmin: user.isAdmin,
          origin: user.origin,
          createdOn: user.createdOn,
        });
        console.log(usersList);
      });
      res.json(usersList);
    })
    .catch((err) => {
      console.log(err);
    });
  console.log('Get All Users');
});

// Get User
router.post('/user', (req, res) => {
  const { email } = req.body;
  User.findOne({ email }, (err, user) => {
    console.log('Mongoose user:', user);
    res.status(200).send({
      name: user.name,
      email: user.email,
      created_on: user.created_on,
    });
  }).catch((err) => console.log(err));
});

router.get('/public-profile/:username', (req, res) => {
  const { username } = req.params;
  console.log('username:', username);
  User.findOne({
    username,
  })
    .populate('profileImage')
    .then((userInfo) => {
      console.log('userInfo:', userInfo);
      res.json(userInfo);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post(
  '/upload/profile-picture',
  multer(multerConfig).single('file'),
  async (req, res) => {
    const {
      originalname: name, size, key, location: url = '',
    } = req.file;
    const id = uuidv4();

    const profilePicture = await UserProfileImage.create({
      id,
      name,
      size,
      key,
      url,
      origin: 'Local',
    });
    console.log('profilePicture:', profilePicture);

    return res.json(profilePicture);
  },
);

module.exports = router;
