import mongoose from 'mongoose'
import { ITemporaryUser } from '../../interfaces/models/user/user'

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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    required: false,
  },
})

const TemporaryUserReseller = mongoose.model<ITemporaryUser>(
  'TemporaryUserReseller',
  TemporaryUserResellerSchema,
)

export default TemporaryUserReseller
