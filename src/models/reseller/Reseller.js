const mongoose = require('mongoose');

const ResellerSchema = new mongoose.Schema({
  id: {
    type: String,
    require: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResellerCompany',
    required: false,
  },
  isCanadaCannabyssTeam: {
    type: Boolean,
    required: false,
    default: false,
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
  phone: {
    type: String,
    required: false,
    default: '',
  },
  username: {
    type: String,
    required: false,
  },
  balance: {
    type: Number,
    required: false,
    default: 0,
  },
  password: {
    type: String,
    required: false,
  },
  profileImage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResellerProfileImage',
    required: false,
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
    ref: 'ResellerReferral',
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

const Reseller = mongoose.model('Reseller', ResellerSchema);

module.exports = Reseller;
