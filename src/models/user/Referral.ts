import mongoose from 'mongoose'
import { IUserReferral } from '../../interfaces/models/user/user'

const ReferralSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  referredUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    required: false,
  },
})

const Referral = mongoose.model<IUserReferral>('Referral', ReferralSchema)

export default Referral
