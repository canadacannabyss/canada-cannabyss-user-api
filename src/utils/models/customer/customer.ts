import Customer from '../../../models/customer/Customer'
import CustomerProfileImage from '../../../models/customer/CustomerProfileImage'
import CustomerRefreshToken from '../../../models/customer/CustomerRefreshToken'
import CustomerReferral from '../../../models/customer/CustomerReferral'

import {
  ICreateNewCustomerProfileImageReturn,
  ICreateNewCustomerReturn,
  ICreateNewCustomerReferralReturn,
} from '../../../interfaces/utils/models/customer/customer'

import { error } from '../../logger/logger'

export async function createNewCustomerProfileImage(
  id: string,
): Promise<ICreateNewCustomerProfileImageReturn> {
  try {
    const newCustomerProfileImage = new CustomerProfileImage({
      id,
      name: 'default-user.jpg',
      size: 11800,
      key: 'default/users/default-user.jpg',
      url: `${process.env.FULL_BUCKET_URL}/default/users/default-user.jpg`,
    })

    const customerProfileImageObj = await newCustomerProfileImage.save()

    return customerProfileImageObj
  } catch (err) {
    error(`createNewCustomerProfileImage - ${err.message}`)
  }
}

export async function createNewCustomer(
  id: string,
  names: { firstName: string; lastName: string },
  email: string,
  username: string,
  password: string,
  profileImage: string,
  origin: string,
): Promise<ICreateNewCustomerReturn> {
  try {
    const newCustomer = new Customer({
      id,
      names,
      email,
      username,
      password,
      profileImage,
      origin,
    })

    const newCustomerObj = await newCustomer.save()

    return newCustomerObj
  } catch (err: any) {
    error(`createNewCustomer - ${err.message}`)
  }
}

export async function createNewCustomerReferral(
  customerId: string,
): Promise<any> {
  try {
    const newReferral = new CustomerReferral({
      customer: customerId,
      referredCustomers: [],
    })

    const newReferralObj = await newReferral.save()

    return newReferralObj
  } catch (err: any) {
    error(`createNewCustomerReferral - ${err.message}`)
  }
}

export async function updateCustomer(
  customerId: string,
  referralId: string,
): Promise<void> {
  try {
    await Customer.findOneAndUpdate(
      {
        _id: customerId,
      },
      {
        referral: referralId,
      },
      {
        runValidators: true,
      },
    )
  } catch (err: any) {
    error(`updateCustomer - ${err.message}`)
  }
}

export async function addReferredCustomers(
  referralId: string,
  customerId: string,
): Promise<void> {
  try {
    const customerReferralObj = await CustomerReferral.findOne({
      _id: referralId,
    })

    const referralCustomersArray = [...customerReferralObj.referredCustomers]
    referralCustomersArray.push(customerId)

    await CustomerReferral.findOneAndUpdate(
      {
        _id: referralId,
      },
      {
        referredCustomers: referralCustomersArray,
      },
      {
        runValidators: true,
      },
    )
  } catch (err: any) {
    error(`addReferredCustomers - ${err.message}`)
  }
}
