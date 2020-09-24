const mongoose = require('mongoose');

const ResellerReferralSchema = new mongoose.Schema({
  reseller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reseller',
    required: true,
  },
  referredResellers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reseller',
      required: false,
    },
  ],
  deletion: {
    isDeleted: {
      type: Boolean,
      required: false,
      default: false,
    },
    when: {
      type: Date,
      required: false,
    },
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

const ResellerReferral = mongoose.model('ResellerReferral', ResellerReferralSchema);

module.exports = ResellerReferral;
