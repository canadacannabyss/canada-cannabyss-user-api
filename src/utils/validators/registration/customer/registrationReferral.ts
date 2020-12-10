import Customer from '../../../../models/customer/Customer'
import CustomerProfileImage from '../../../../models/customer/CustomerProfileImage'

import {
  ICustomer,
  ICustomerProfileImage,
} from '../../../../interfaces/models/customer/customer'

export function validateCustomerReferralObj(
  names: { firstName: string; lastName: string },
  username: string,
  email: string,
  password: string,
  password2: string,
  referralId: string,
): { errors: string[]; valid: boolean } {
  console.log('names:', names)

  const errors: string[] = []

  if (!names.firstName) {
    errors.push('First name is required.')
  } else {
    if (names.firstName.length === 0) {
      errors.push('First name must be valid.')
    }
  }

  if (!names.lastName) {
    errors.push('Last name is required.')
  } else {
    if (names.lastName.length === 0) {
      errors.push('Last name must be valid.')
    }
  }

  if (!username) {
    errors.push('Username is required.')
  } else {
    if (username.length === 0) {
      errors.push('Username must be valid.')
    }
  }

  if (!email) {
    errors.push('Email is required.')
  } else {
    if (email.length === 0) {
      errors.push('Email must be valid.')
    } else {
      const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
      if (!re.test(String(email).toLowerCase())) {
        errors.push('Email must be valid.')
      }
    }
  }

  if (!password) {
    errors.push('Password is required.')
  } else {
    if (password.length === 0) {
      errors.push('Password must be valid.')
    }
  }

  if (!password2) {
    errors.push('Password is required.')
  } else {
    if (password2.length === 0) {
      errors.push('Password must be valid.')
    }
  }

  if (password !== password2) {
    errors.push('Passwords must match')
  }

  if (!referralId) {
    errors.push('Referral id is required.')
  } else {
    if (referralId.length === 0) {
      errors.push('Referral id must be valid.')
    }
  }

  console.log('errors validated:', errors)

  if (errors.length > 0) {
    return {
      errors,
      valid: false,
    }
  } else {
    return {
      errors: [],
      valid: true,
    }
  }
}

export async function validateUsername(username: string): Promise<boolean> {
  try {
    const customerObj: ICustomer = await Customer.findOne({
      username,
    })

    if (customerObj) {
      return false
    }
    return true
  } catch (err) {
    console.error(err.message)
  }
}

export async function validateImageId(imageId: string): Promise<boolean> {
  try {
    const userProfileImageObj: ICustomerProfileImage = await UserProfileImage.findOne(
      {
        id: imageId,
      },
    )

    if (userProfileImageObj) {
      return false
    }
    return true
  } catch (err) {
    console.error(err.message)
  }
}
