const mongoose = require('mongoose');

const TemporaryUserResellerSchema = new mongoose.Schema({
  email: {
    type: String,
    required: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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

const TemporaryUserReseller = mongoose.model('TemporaryUserReseller', TemporaryUserResellerSchema);

module.exports = TemporaryUserReseller;
