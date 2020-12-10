import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { v4 } from 'uuid'

import { authenticateToken } from '../../middleware/jwt'
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt'
import {
  generateRandomUsername,
  generateUniqueId,
} from '../../utils/generators/random/random'
import { slugifyUsername } from '../../utils/user'
import {
  validateCustomerObj,
  validateImageId,
  validateUsername,
} from '../../utils/validators/registration/customer/registration'
import { validateCustomerReferralObj } from '../../utils/validators/registration/customer/registrationReferral'
import { validateLoginCustomer } from '../../utils/validators/login/customer/login'
import { error, success, warning } from '../../utils/logger/logger'
import { subscribe } from '../../utils/mailchimp/mailchimp'
import {
  createNewCustomer,
  createNewCustomerProfileImage,
  createNewCustomerReferral,
  updateCustomer,
  addReferredCustomers,
} from '../../utils/models/customer/customer'

import emailSend from '../../services/emailSender'
import emailSendResetPassword from '../../services/emailSenderResetPassword'

import Customer from '../../models/customer/Customer'
import CustomerProfileImage from '../../models/customer/CustomerProfileImage'
import CustomerRefreshToken from '../../models/customer/CustomerRefreshToken'
import CustomerReferral from '../../models/customer/CustomerReferral'

export function facebookCallback(req: Request, res: Response): void {
  res.redirect(`${process.env.FRONTEND_URL}/`)
}

export function googleCallback(req: Request, res: Response): void {
  res.redirect(`${process.env.FRONTEND_URL}/`)
}

export async function getAllUsers(req: Request, res: Response): Promise<any> {
  try {
    const users = await User.find()
    return res.json(users)
  } catch (err: any) {
    error(err.message)
  }
}

export async function register(req: Request, res: Response): Promise<any> {
  const { names, username, email, password, password2 } = req.body

  const validation = validateCustomerObj(
    names,
    username,
    email,
    password,
    password2,
  )

  if (!validation.valid) {
    validation.errors.map((error: string) => {
      warning(error)
    })
    return res.status(400).send({
      statusCode: 400,
      results: {},
      errors: validation.errors,
    })
  }

  const existingCustomer = await Customer.findOne({
    email,
  })

  if (existingCustomer) {
    warning('This email is already attached to another account.')
    return res.status(400).send({
      statusCode: 400,
      results: {},
      errors: ['This email is already attached to another account.'],
    })
  }

  let newUsername = slugifyUsername(username)

  if (!validateUsername(newUsername)) {
    do {
      newUsername = generateRandomUsername(username)
    } while (!validateUsername(newUsername))
  }

  bcrypt.genSalt(10, (errGenSalt: Error, salt: string) => {
    if (errGenSalt) throw errGenSalt

    bcrypt.hash(password, salt, async (errHash: Error, hash: string) => {
      if (errHash) throw errHash

      let newId = generateUniqueId(8, 'hex', 36)

      if (!validateImageId(newId)) {
        do {
          newId = generateUniqueId(8, 'hex', 36)
        } while (!validateImageId(newId))
      }

      try {
        const customerProfileImageObj = await createNewCustomerProfileImage(
          newId,
        )

        const newCustomerObj = await createNewCustomer(
          newId,
          names,
          email,
          newUsername,
          hash,
          customerProfileImageObj._id,
          'Local',
        )

        const newReferralObj = await createNewCustomerReferral(
          newCustomerObj._id,
        )

        await updateCustomer(newCustomerObj._id, newReferralObj._id)

        emailSend(newCustomerObj.email, newCustomerObj._id)

        success('Customer created.')
        success('Customer registration email sent.')

        return res.status(200).send({
          statusCode: 200,
          results: {
            ok: true,
          },
          errors: [],
        })
      } catch (err: Error) {
        error(err.message)
        return res.status(500).send({
          statusCode: 500,
          results: [],
          errors: [err.message],
        })
      }
    })
  })
}

export async function registerReferral(
  req: Request,
  res: Response,
): Promise<any> {
  const { names, username, email, password, password2, referralId } = req.body

  const validation = validateCustomerReferralObj(
    names,
    username,
    email,
    password,
    password2,
    referralId,
  )

  if (!validation.valid) {
    validation.errors.map((error: string) => {
      warning(error)
    })
    return res.status(400).send({
      statusCode: 400,
      results: {},
      errors: validation.errors,
    })
  }

  const existingCustomer = await Customer.findOne({
    email,
  })

  if (existingCustomer) {
    warning('This email is already attached to another account.')
    return res.status(400).send({
      statusCode: 400,
      results: {},
      errors: ['This email is already attached to another account.'],
    })
  }

  let newUsername = slugifyUsername(username)

  if (!validateUsername(newUsername)) {
    do {
      newUsername = generateRandomUsername(username)
    } while (!validateUsername(newUsername))
  }

  bcrypt.genSalt(10, (errGenSalt: Error, salt: string) => {
    if (errGenSalt) throw errGenSalt

    bcrypt.hash(password, salt, async (errHash: Error, hash: string) => {
      if (errHash) throw errHash

      let newId = generateUniqueId(8, 'hex', 36)

      if (!validateImageId(newId)) {
        do {
          newId = generateUniqueId(8, 'hex', 36)
        } while (!validateImageId(newId))
      }

      try {
        const customerProfileImageObj = await createNewCustomerProfileImage(
          newId,
        )

        const newCustomerObj = await createNewCustomer(
          newId,
          names,
          email,
          newUsername,
          hash,
          customerProfileImageObj._id,
          'Local',
        )

        const newReferralObj = await createNewCustomerReferral(
          newCustomerObj._id,
        )

        await updateCustomer(newCustomerObj._id, newReferralObj._id)

        await addReferredCustomers(newReferralObj._id, newCustomerObj._id)

        emailSend(newCustomerObj.email, newCustomerObj._id)

        success('Customer created with referral.')
        success('Customer registration email sent.')

        return res.status(200).send({
          statusCode: 200,
          results: {
            ok: true,
          },
          errors: [],
        })
      } catch (err: Error) {
        error(`on registration referral - ${err.message}`)
        return res.status(500).send({
          statusCode: 500,
          results: [],
          errors: [err.message],
        })
      }
    })
  })
}

export function token(req: Request, res: Response): Promise<any> {
  const { refreshToken } = req.body
  try {
    if (refreshToken === null) res.sendStatus(401)
    const refreshTokenObj = CustomerRefreshToken.findOne({
      token: refreshToken,
    })
    if (!refreshTokenObj) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403)
      const accessToken = generateAccessToken(user)
      return res.status(200).send({ accessToken })
    })
  } catch (err) {
    console.error(err)
  }
}

export async function login(req: Request, res: Response): Promise<any> {
  const { email, password } = req.body

  const validation = await validateLoginCustomer(email, password)

  if (!validation.valid) {
    validation.errors.map((error: string) => {
      warning(error)
    })
    return res.status(400).send({
      statusCode: 400,
      results: {},
      errors: validation.errors,
    })
  }

  try {
    bcrypt.compare(
      password,
      validation.results.password,
      (err: Error, isMatch: boolean) => {
        if (err) throw err

        if (isMatch) {
          const accessToken: string = generateAccessToken(
            validation.results._id,
          )
          const refreshToken: string = generateRefreshToken(
            validation.results._id,
          )

          return res.status(200).send({
            statusCode: 200,
            results: { accessToken, refreshToken },
            errors: [],
          })
        } else {
          warning('Invalid password.')
          return res.status(400).send({
            statusCode: 400,
            results: {},
            errors: ['Invalid password.'],
          })
        }
      },
    )
  } catch (err) {
    error(err.message)
    return res.status(500).send({
      statusCode: 500,
      results: {},
      errors: [err.message],
    })
  }
}

export async function decodeToken(
  req: Request,
  res: Response,
): Promise<Response> {
  const { accessToken } = req.body
  console.log(req.body)

  const authHeader: string = req.headers.authorization
  const tokenHeader: string = authHeader && authHeader.split(' ')[1]

  if (accessToken !== tokenHeader) return res.sendStatus(403)

  jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET,
    async (err: Error, user: { id: string }) => {
      console.log('user:', user)
      if (err) return res.sendStatus(403)
      const userInfoObj = await Customer.findOne({
        _id: user.id,
      })
        .populate({
          path: 'profileImage',
          model: CustomerProfileImage,
        })
        .populate({
          path: 'referral',
          model: CustomerReferral,
        })

      if (!userInfoObj) return res.sendStatus(404)
      return res.status(200).send(userInfoObj)
    },
  )
}

export async function confirmationToken(
  req: Request,
  res: Response,
): Promise<any> {
  const { token } = req.params

  try {
    jwt.verify(token, process.env.EMAIL_SECRET, (err, decodedToken) => {
      if (err) return res.status(404).send({ error: 'This link is expired' })
      Customer.findOneAndUpdate(
        {
          _id: decodedToken.userId,
          isVerified: false,
        },
        {
          isVerified: true,
        },
        {
          runValidators: true,
        },
      )
        .then((user) => {
          if (user) {
            CustomerReferral.findOne({
              referredCustomers: { $in: [user._id] },
            })
              .then(async (referral) => {
                console.log('referral:', referral)
                if (referral) {
                  Customer.findOne({
                    _id: referral.customer,
                  })
                    .then((referralCustomer) => {
                      console.log('CUSTOMER REFERRAL:', referralCustomer)
                      Customer.findOneAndUpdate(
                        {
                          _id: referralCustomer._id,
                        },
                        {
                          credits: referralCustomer.credits + 5,
                        },
                        {
                          runValidators: true,
                        },
                      )
                        .then(async () => {
                          const names = {
                            firstName: user.names.firstName,
                            lastName: user.names.lastName,
                          }
                          const mcRes = await subscribe(user.email, names)
                          res.status(200).send(user)
                        })
                        .catch((err) => {
                          console.error(err)
                        })
                    })
                    .catch((err) => {
                      console.error(err)
                    })
                } else {
                  const names = {
                    firstName: user.names.firstName,
                    lastName: user.names.lastName,
                  }
                  const mcRes = await subscribe(user.email, names)
                  res.status(200).send(user)
                }
              })
              .catch((err) => {
                console.error(err)
              })
          } else {
            res.status(404).send({ notValid: 'This link is not valid' })
          }
        })
        .catch((err) => {
          console.error(err)
          res.sendStatus(400)
        })
    })
  } catch (err) {
    console.error(err)
  }
}

export async function resetPasswordSent(
  req: Request,
  res: Response,
): Promise<any> {
  const { email } = req.body

  console.log('email:', email)

  Customer.findOne({
    email,
  })
    .then((user) => {
      if (user) {
        emailSendResetPassword(user.email, user._id)
        res.status(200).send({
          ok: true,
        })
      } else {
        res.status(404).send({
          error: 'Account not found.',
        })
      }
    })
    .catch((err) => {
      console.error(err)
      res.status(404).send({
        error: 'Something went wrong.',
      })
    })
}

export async function validateCurrentPassword(
  req: Request,
  res: Response,
): Promise<any> {
  const { userId, currentPassword } = req.body

  const userObj = await Customer.findOne({
    _id: userId,
  })

  bcrypt.compare(currentPassword, userObj.password, (err, isMatch) => {
    if (err) throw err

    if (isMatch) {
      res.status(200).send({
        ok: true,
      })
    } else {
      res.status(200).send({
        msg: 'Incorrect password',
      })
    }
  })
}

export async function accountResetPassword(
  req: Request,
  res: Response,
): Promise<any> {
  const { userId, password, password2 } = req.body

  if (password === password2) {
    const userObj = await Customer.findOne({
      _id: userId,
    })

    bcrypt.compare(password, userObj.password, (err, isMatch) => {
      if (err) throw err

      if (isMatch) {
        res.status(200).send({
          error: 'Do not use the your current password.',
        })
      } else {
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) throw err
            Customer.findOneAndUpdate(
              {
                _id: userId,
              },
              {
                password: hash,
              },
              {
                runValidators: true,
              },
            )
              .then(() => {
                res.status(200).send({
                  ok: true,
                })
              })
              .catch((err) => {
                console.error(err)
              })
          })
        })
      }
    })
  } else {
    res.status(200).send({
      error: 'Passwords does not match',
    })
  }
}

export async function resetPasswordValidatingToken(
  req: Request,
  res: Response,
): Promise<any> {
  const { token } = req.params
  try {
    jwt.verify(
      token,
      process.env.RESET_PASSWORD_SECRET,
      (err, decodedToken) => {
        if (err) return res.status(404).send({ error: 'This link is expired' })
        Customer.findOne({
          _id: decodedToken.userId,
        })
          .then((user) => {
            if (user) {
              res.status(200).send(user)
            } else {
              res.status(404).send({ notValid: 'This link is not valid' })
            }
          })
          .catch((err) => {
            console.error(err)
            res.sendStatus(400)
          })
      },
    )
  } catch (err) {
    console.error(err)
  }
}

export async function resetPassword(req: Request, res: Response): Promise<any> {
  const { token, password, password2 } = req.body

  console.log(password, password2)

  try {
    if (password === password2) {
      jwt.verify(
        token,
        process.env.RESET_PASSWORD_SECRET,
        (err, decodedToken) => {
          if (err)
            return res.status(404).send({ error: 'This link is expired' })

          Customer.findOne({
            _id: decodedToken.userId,
          })
            .then((user) => {
              bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err

                if (isMatch) {
                  console.log({
                    error: 'Do not use the your current password.',
                  })
                } else {
                  bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(password, salt, (err, hash) => {
                      if (err) throw err
                      Customer.findOneAndUpdate(
                        {
                          _id: user._id,
                        },
                        {
                          password: hash,
                        },
                        {
                          runValidators: true,
                        },
                      )
                        .then(() => {
                          res.status(200).send({
                            ok: true,
                          })
                        })
                        .catch((err) => {
                          console.error(err)
                        })
                    })
                  })
                }
              })
            })
            .catch((err) => {
              console.error(err)
            })
        },
      )
    } else {
      console.log({ error: 'Passwords does not match.' })
      res.json({ error: 'Passwords does not match.' })
    }
  } catch (err) {
    console.error(err)
  }
}

export async function logout(req: Request, res: Response): Promise<any> {
  const { refreshToken } = req.body

  await CustomerRefreshToken.findOneAndDelete({
    refreshToken,
  })

  res.sendStatus(204)
}
