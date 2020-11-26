import mongoose from 'mongoose'
import { ICustomerRefreshToken } from '../../interfaces/models/customer/customer'

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
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const CustomerRefreshToken = mongoose.model<ICustomerRefreshToken>(
  'CustomerRefreshToken',
  CustomerRefreshTokenSchema,
)

export default CustomerRefreshToken
