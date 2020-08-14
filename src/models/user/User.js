const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: {
    type: String,
    require: true,
  },
  names: {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      require: true,
    },
  },
  email: {
    type: String,
    required: false,
  },
  username: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: false,
  },
  profileImage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProfileImage',
    required: false,
  },
  isAdmin: {
    type: Boolean,
    require: true,
  },
  isVerified: {
    type: Boolean,
    required: false,
    default: false,
  },
  origin: {
    type: String,
    required: true,
  },
  credits: {
    type: Number,
    required: false,
    default: 0,
  },
  referral: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Referral',
    required: false,
    default: null,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  updatedOn: {
    type: Date,
    required: false,
  },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
