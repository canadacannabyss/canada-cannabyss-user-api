const mongoose = require('mongoose');

const AdminReferralSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  referredAdmins: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: false,
    },
  ],
  createdOn: {
    type: Date,
    default: Date.now,
  },
  updatedOn: {
    type: Date,
    required: false,
  },
});

const AdminReferral = mongoose.model('AdminReferral', AdminReferralSchema);

module.exports = AdminReferral;
