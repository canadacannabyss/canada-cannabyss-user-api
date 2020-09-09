const mongoose = require('mongoose');

const CustomerRefreshTokenSchema = new mongoose.Schema({
  refreshToken: {
    type: String,
    required: true,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
});

const CustomerRefreshToken = mongoose.model('CustomerRefreshToken', CustomerRefreshTokenSchema);

module.exports = CustomerRefreshToken;
