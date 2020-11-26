import { Document } from 'mongoose'

export interface IUser extends Document {
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
  profileImage: IUserProfileImage
  isVerified: boolean
  origin: string
  credits: number
  referral: IUserReferral
  deletion: {
    isDeleted: boolean
    when: Date | null
  }
  createdAt: Date
  updatedAt: Date | null
}

export interface IUserProfileImage extends Document {
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

export interface IUserReferral extends Document {
  user: IUser
  referredUsers: IUser[]
  deletion: {
    isDeleted: boolean
    when: Date | null
  }
  createdAt: Date
  updatedAt: Date | null
}

export interface ITemporaryUser extends Document {
  email: string
  isCanadaCannabyssTeam: boolean
  createdBy: IUser
  createdAt: Date
  updatedAt: Date | null
}

export interface IUserRefreshToken extends Document {
  refreshToken: string
  deletion: {
    isDeleted: boolean
    when: Date | null
  }
  createdAt: Date
  updatedAt: Date | null
}
