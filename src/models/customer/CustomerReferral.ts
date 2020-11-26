import mongoose from 'mongoose'
import { ICustomerReferral } from '../../interfaces/models/customer/customer'

const CustomerReferralSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  referredCustomers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
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

const CustomerReferral = mongoose.model<ICustomerReferral>(
  'CustomerReferral',
  CustomerReferralSchema,
)

export default CustomerReferral
