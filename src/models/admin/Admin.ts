import mongoose from 'mongoose'
import { IAdmin } from '../../interfaces/models/admin/admin'

const AdminSchema = new mongoose.Schema({
  id: {
    type: String,
    require: true,
  },
  names: {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      require: true,
    },
  },
  email: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: false,
    default: '',
  },
  username: {
    type: String,
    required: false,
  },
  balance: {
    type: Number,
    required: false,
    default: 0,
  },
  password: {
    type: String,
    required: false,
  },
  profileImage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminProfileImage',
    required: false,
  },
  isVerified: {
    type: Boolean,
    required: false,
    default: false,
  },
  origin: {
    type: String,
    required: true,
  },
  credits: {
    type: Number,
    required: false,
    default: 0,
  },
  referral: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminReferral',
    required: false,
    default: null,
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
  updatedAt: {
    type: Date,
    required: false,
  },
})

const Admin = mongoose.model<IAdmin>('Admin', AdminSchema)

export default Admin
