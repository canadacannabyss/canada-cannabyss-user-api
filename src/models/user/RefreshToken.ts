import mongoose from 'mongoose'
import { IUserRefreshToken } from '../../interfaces/models/user/user'

const RefreshTokenSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const RefreshToken = mongoose.model<IUserRefreshToken>(
  'RefreshToken',
  RefreshTokenSchema,
)

export default RefreshToken
