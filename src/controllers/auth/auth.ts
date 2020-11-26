import { Request, RequestHandler, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import uuid from 'uuid'

import { generateAccessToken, decodeToken } from '../../utils/jwt'
import { slugifyUsername } from '../../utils/user'
import { error, success } from '../../utils/logger/logger'

import emailSend from '../../services/emailSender'
import emailSendResetPassword from '../../services/emailSenderResetPassword'

import User from '../../models/user/User'
import UserProfileImage from '../../models/user/UserProfileImage'
import RefreshToken from '../../models/user/RefreshToken'
import Referral from '../../models/user/Referral'

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
  const { firstName, lastName, username, email, password, password2 } = req.body

  const errors = []
  console.log('req.body:', req.body)

  if (
    !firstName ||
    firstName.length === 0 ||
    !lastName ||
    lastName.length === 0 ||
    !username ||
    username.length === 0 ||
    !email ||
    email.length === 0 ||
    !password ||
    password.length === 0 ||
    !password2 ||
    password2.length === 0
  ) {
    errors.push({ msg: 'Please enter all fields' })
  }

  const slugifiedUsername = slugifyUsername(username)

  try {
    const existingUser = await User.findOne({
      username: slugifiedUsername,
    })
    if (existingUser) {
      errors.push({ msg: 'Username already exist' })
    }
  } catch (err) {
    console.error(err)
    errors.push({ msg: 'Error while finding existing user' })
  }

  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' })
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' })
  }

  if (errors.length > 0) {
    res.json(errors)
  } else {
    User.findOne({ email })
      .then((user) => {
        if (user) {
          errors.push({ msg: 'Email already exists' })
          res.json(errors)
        } else {
          const id = uuid.v4()

          const newUserProfileImage = new UserProfileImage({
            id,
            name: 'default-user.jpg',
            size: 11800,
            key: 'default/users/default-user.jpg',
            url: `${process.env.FULL_BUCKET_URL}/default/users/default-user.jpg`,
          })

          newUserProfileImage
            .save()
            .then((image) => {
              const newUser = new User({
                id,
                names: {
                  firstName,
                  lastName,
                },
                email,
                username: slugifiedUsername,
                password,
                profileImage: image._id,
                isAdmin: false,
                origin: 'Local',
              })

              bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                  if (err) throw err
                  newUser.password = hash
                  newUser.save().then((user) => {
                    const newReferral = new Referral({
                      user: user._id,
                      referredUsers: [],
                      createdAt: Date.now(),
                    })
                    newReferral.save().then((referral) => {
                      User.findOneAndUpdate(
                        {
                          _id: user._id,
                        },
                        {
                          referral: referral._id,
                        },
                        {
                          runValidators: true,
                        },
                      ).then((updatedUser) => {
                        emailSend(user.email, user._id)
                        res.status(200).send({ ok: true })
                      })
                    })
                  })
                })
              })
            })
            .catch((err) => {
              console.error(err)
            })
        }
      })
      .catch((err) => {
        console.error(err)
      })
  }
}

export async function registerReferral(
  req: Request,
  res: Response,
): Promise<any> {
  const {
    firstName,
    lastName,
    username,
    email,
    password,
    password2,
    referralId,
  } = req.body

  const errors = []
  console.log('req.body:', req.body)

  if (
    !firstName ||
    firstName.length === 0 ||
    !lastName ||
    lastName.length === 0 ||
    !username ||
    username.length === 0 ||
    !email ||
    email.length === 0 ||
    !password ||
    password.length === 0 ||
    !password2 ||
    password2.length === 0
  ) {
    errors.push({ msg: 'Please enter all fields' })
  }

  const slugifiedUsername = slugifyUsername(username)

  try {
    const existingUser = await User.findOne({
      username: slugifiedUsername,
    })
    if (existingUser) {
      errors.push({ msg: 'Username already exist' })
    }
  } catch (err) {
    console.error(err)
    errors.push({ msg: 'Error while finding existing user' })
  }

  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' })
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' })
  }

  if (errors.length > 0) {
    res.json(errors)
  } else {
    User.findOne({ email })
      .then((user) => {
        if (user) {
          errors.push({ msg: 'Email already exists' })
          res.json(errors)
        } else {
          const id = uuid.v4()

          const newUserProfileImage = new UserProfileImage({
            id,
            name: 'default-user.jpg',
            size: 11800,
            key: 'default/users/default-user.jpg',
            url: `${process.env.FULL_BUCKET_URL}/default/users/default-user.jpg`,
          })

          newUserProfileImage
            .save()
            .then((image) => {
              const newUser = new User({
                id,
                names: {
                  firstName,
                  lastName,
                },
                email,
                username: slugifiedUsername,
                password,
                profileImage: image._id,
                isVerified: false,
                isAdmin: false,
                isReseller: false,
                origin: 'Local',
              })

              bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                  if (err) throw err
                  newUser.password = hash
                  newUser.save().then((user: { _id: string }) => {
                    const newReferral = new Referral({
                      user: user._id,
                      referredUsers: [],
                      createdAt: Date.now(),
                    })
                    newReferral.save().then((referral) => {
                      User.findOneAndUpdate(
                        {
                          _id: user._id,
                        },
                        {
                          referral: referral._id,
                        },
                        {
                          runValidators: true,
                        },
                      ).then(() => {
                        Referral.findOne({
                          _id: referralId,
                        })
                          .then((referral) => {
                            const referredUsersObj = [...referral.referredUsers]
                            referredUsersObj.push(user._id)
                            Referral.findOneAndUpdate(
                              {
                                _id: referral._id,
                              },
                              {
                                referredUsers: referredUsersObj,
                              },
                              {
                                runValidators: true,
                              },
                            )
                              .then(() => {
                                emailSend(user.email, user._id)
                                res.status(200).send({ ok: true })
                              })
                              .catch((err) => {
                                console.log(err)
                              })
                          })
                          .catch((err) => {
                            console.error(err)
                          })
                      })
                    })
                  })
                })
              })
            })
            .catch((err) => {
              console.error(err)
            })
        }
      })
      .catch((err) => {
        console.error(err)
      })
  }
}

export function token(req: Request, res: Response): any {
  const { refreshToken } = req.body
  try {
    if (refreshToken === null) res.sendStatus(401)
    const refreshTokenObj = RefreshToken.findOne({
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

  try {
    const errors = []

    if (!email || email.length === 0 || !password || password.length === 0) {
      errors.push({ msg: 'Please enter all fields' })
    }

    const user = await User.findOne({
      email,
      isReseller: false,
      isAdmin: false,
      isVerified: true,
    })

    if (!user) {
      errors.push({ msg: 'User does not exist' })
    }

    if (errors.length > 0) {
      res.json(errors)
    } else {
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) throw err

        if (isMatch) {
          const userObj = {
            _id: user._id,
            names: {
              firstName: user.names.firstName,
              lastName: user.names.lastName,
            },
            email: user.email,
            password: user.password,
            origin: user.origin,
            createdAt: user.createdAt,
            __v: user.__v,
          }
          const accessToken = generateAccessToken(userObj)
          const refreshToken = jwt.sign(
            userObj,
            process.env.REFRESH_TOKEN_SECRET,
          )
          console.log('accessToken:', accessToken)
          console.log('refreshToken:', refreshToken)
          res.status(200).send({ accessToken, refreshToken })
        } else {
          errors.push({ msg: 'Incorrect password' })
          res.json(errors)
        }
      })
    }
  } catch (err) {
    console.error(err)
  }
}

export function decodeToken(req: Request, res: Response): any {
  const { accessToken } = req.body
  const authHeader = req.headers.authorization
  const tokenHeader = authHeader && authHeader.split(' ')[1]
  if (accessToken !== tokenHeader) return res.sendStatus(403)
  jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET,
    async (err, user) => {
      if (err) return res.sendStatus(403)
      const userInfoObj = await User.findOne({
        _id: user.id,
      })
        .populate({
          path: 'profileImage',
          model: UserProfileImage,
        })
        .populate({
          path: 'referral',
          model: Referral,
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
      User.findOneAndUpdate(
        {
          _id: decodedToken.userId,
          isVerified: false,
          isAdmin: false,
        },
        {
          isVerified: true,
        },
        {
          runValidators: true,
        },
      )
        .then((user) => {
          console.log('user:', user)
          if (user) {
            Referral.findOne({
              referredUsers: user._id,
            })
              .then((referral) => {
                console.log('referral:', referral)
                if (referral) {
                  User.findOne({
                    _id: referral.user,
                  })
                    .then((referralUser) => {
                      User.findOneAndUpdate(
                        {
                          _id: referralUser._id,
                        },
                        {
                          credits: referralUser.credits + 5,
                        },
                        {
                          runValidators: true,
                        },
                      )
                        .then(() => {
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

  User.findOne({
    email,
    isAdmin: false,
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

export async function resetPasswordValidatingToken(
  req: Request,
  res: Response,
): Promise<any> {
  const { token } = req.params
  try {
    jwt.verify(
      token,
      process.env.RESET_PASSWORD_SECRET,
      (err, decodedToken: { userId: string }) => {
        if (err) return res.status(404).send({ error: 'This link is expired' })
        User.findOne({
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

          User.findOne({
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
                      User.findOneAndUpdate(
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

  await RefreshToken.findOneAndDelete({
    refreshToken,
  })

  res.sendStatus(204)
}
