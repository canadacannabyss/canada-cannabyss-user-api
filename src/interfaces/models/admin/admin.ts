import { Document } from 'mongoose'
// import {IAdmin} from '../admin/admin'

export interface IAdmin extends Document {
  _id: string
  id: string
  names: {
    firstName: string
    lastName: string
  }
  email: string
  phone: string
  username: string
  balance: number
  password: string
  profileImage: IAdminProfileImage
  isVerified: boolean
  origin: string
  credits: number
  referral: IAdminReferral
  deletion: {
    isDeleted: boolean
    when: Date | null
  }
  createdAt: Date
  updatedAt: Date | null
}

export interface IAdminProfileImage extends Document {
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

export interface IAdminReferral extends Document {
  reseller: IAdmin
  referredAdmins: IAdmin[]
  deletion: {
    isDeleted: boolean
    when: Date | null
  }
  createdAt: Date
  updatedAt: Date | null
}
