const mongoose = require('mongoose');

const TemporaryResellerSchema = new mongoose.Schema({
  email: {
    type: String,
    required: false,
  },
  isCanadaCannabyssTeam: {
    type: Boolean,
    required: false,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
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

const TemporaryReseller = mongoose.model('TemporaryReseller', TemporaryResellerSchema);

module.exports = TemporaryReseller;
