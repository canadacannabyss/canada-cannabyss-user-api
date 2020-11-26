import mongoose from 'mongoose'
import { IAdminReferral } from '../../interfaces/models/admin/admin'

const AdminReferralSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  referredAdmins: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
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

const AdminReferral = mongoose.model<IAdminReferral>(
  'AdminReferral',
  AdminReferralSchema,
)

export default AdminReferral
