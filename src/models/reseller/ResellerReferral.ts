import mongoose from 'mongoose'

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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    required: false,
  },
})

const ResellerReferral = mongoose.model(
  'ResellerReferral',
  ResellerReferralSchema,
)

export default ResellerReferral
