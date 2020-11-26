import { Document } from 'mongoose'
import { IAdmin } from '../admin/admin'

export interface IReseller extends Document {
  _id: string
  id: string
  company: string | null
  isCanadaCannabyssTeam: boolean
  names: {
    firstName: string
    lastName: string
  }
  email: string
  phone: string
  username: string
  balance: number
  password: string
  profileImage: IResellerProfileImage
  isVerified: boolean
  origin: string
  credits: number
  referral: IResellerReferral
  deletion: {
    isDeleted: boolean
    when: Date | null
  }
  createdAt: Date
  updatedAt: Date | null
}

export interface IResellerProfileImage extends Document {
  _id: string
  name: string
  size: number
  key: string
  url: string
  deleteion: {
    isDeleted: boolean
    when: Date | null
  }
  createdAt: Date
  updatedAt: Date | null
}

export interface IResellerReferral extends Document {
  reseller: IReseller
  referredResellers: IReseller[]
  deletion: {
    isDeleted: boolean
    when: Date | null
  }
  createdAt: Date
  updatedAt: Date | null
}

export interface ITemporaryReseller extends Document {
  email: string
  isCanadaCannabyssTeam: boolean
  createdBy: IAdmin
  createdAt: Date
  updatedAt: Date | null
}
