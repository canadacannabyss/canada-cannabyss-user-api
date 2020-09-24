const mongoose = require('mongoose');

const CustomerRefreshTokenSchema = new mongoose.Schema({
  refreshToken: {
    type: String,
    required: true,
  },
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
});

const CustomerRefreshToken = mongoose.model('CustomerRefreshToken', CustomerRefreshTokenSchema);

module.exports = CustomerRefreshToken;
