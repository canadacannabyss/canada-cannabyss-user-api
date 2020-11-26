import mongoose from 'mongoose'
import { ITemporaryReseller } from '../../interfaces/models/reseller/reseller'

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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    required: false,
  },
})

const TemporaryReseller = mongoose.model<ITemporaryReseller>(
  'TemporaryReseller',
  TemporaryResellerSchema,
)

export default TemporaryReseller
