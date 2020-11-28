export function validateLoginCustomer(
  email: string,
  password: string,
): { errors: string[]; valid: boolean } {
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
