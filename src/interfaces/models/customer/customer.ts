import { Document } from 'mongoose'
// import {ICustomer} from '../admin/admin'

export interface ICustomer extends Document {
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
  profileImage: ICustomerProfileImage
  isVerified: boolean
  origin: string
  credits: number
  referral: ICustomerReferral
  deletion: {
    isDeleted: boolean
    when: Date | null
  }
  createdAt: Date
  updatedAt: Date | null
}

export interface ICustomerProfileImage extends Document {
  _id: string
  id: string | null
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

export interface ICustomerReferral extends Document {
  reseller: ICustomer
  referredCustomers: ICustomer[]
  deletion: {
    isDeleted: boolean
    when: Date | null
  }
  createdAt: Date
  updatedAt: Date | null
}

export interface ICustomerRefreshToken extends Document {
  refreshToken: string
  deletion: {
    isDeleted: boolean
    when: Date | null
  }
  createdAt: Date
  updatedAt: Date | null
}
