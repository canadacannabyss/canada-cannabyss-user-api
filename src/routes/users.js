const express = require('express');

const router = express.Router();

const multer = require('multer');
const multerConfig = require('../config/multer');

const UsersController = require('../controllers/users')

router.get('/all', UsersController.index);

router.post('/user', UsersController.user);

router.get('/public-profile/:username', UsersController.publicProfile);

router.post(
  '/upload/profile-picture',
  multer(multerConfig).single('file'),
  UsersController.uploadProfilePicture
);

module.exports = router;
