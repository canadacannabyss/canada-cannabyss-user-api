import { ICustomerProfileImage } from '../../../models/customer/customer'

export interface ICreateNewCustomerProfileImageReturn {
  id: string
  name: string
  size: number
  key: string
  url: string
}

export interface ICreateNewCustomerReturn {
  id: string
  names: {
    firstName: string
    lastName: string
  }
  email: string
  username: string
  password: string
  profileImage: ICustomerProfileImage
  origin: string
}

export interface ICreateNewCustomerReferralReturn {
  _id: string
  deletion: {
    isDeleted: boolean
  }
  customer: string
  createdOn: Date
}
