import Customer from '../../../../models/customer/Customer'

import { ICustomer } from '../../../../interfaces/models/customer/customer'

export async function validateLoginCustomer(
  email: string,
  password: string,
): Promise<{
  results: ICustomer | object
  errors: string[]
  valid: boolean
}> {
  const errors: string[] = []

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

  const userObjVerified = await Customer.findOne({
    email,
    isVerified: true,
  })

  if (!userObjVerified) {
    errors.push('Customer does not exists.')
  }

  if (errors.length > 0) {
    return {
      results: {},
      errors,
      valid: false,
    }
  } else {
    return {
      results: userObjVerified,
      errors: [],
      valid: true,
    }
  }
}
