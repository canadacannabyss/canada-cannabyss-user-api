import { Request, Response } from 'express'
import uuid from 'uuid'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

import { slugifyUsername } from '../../utils/user'
import { generateAccessToken } from '../../utils/jwt'

import emailSendReseller from '../../services/emailSenderReseller'
import emailSendResellerResetPassword from '../../services/emailSenderResetResellerPassword'

import Reseller from '../../models/reseller/Reseller'
import ResellerProfileImage from '../../models/reseller/ResellerProfileImage'
import TemporaryReseller from '../../models/reseller/TemporaryReseller'
import ResellerReferral from '../../models/reseller/ResellerReferral'
import Admin from '../../models/admin/Admin'

export async function verifyRegistration(
  req: Request,
  res: Response,
): Promise<any> {
  const { token } = req.params

  try {
    jwt.verify(token, process.env.EMAIL_SECRET, (err, decodedToken) => {
      if (err) return res.status(404).send({ error: 'This link is expired' })
      TemporaryReseller.findOne({
        email: decodedToken.email,
        isCanadaCannabyssTeam: false,
        createdBy: decodedToken.createdBy,
      })
        .populate({
          path: 'createdBy',
          model: Admin,
        })
        .then((tempUser) => {
          let tempUserObj
          if (!tempUser) {
            tempUserObj = {
              error: 'Invalid link',
            }
          } else {
            tempUserObj = tempUser
          }
          res.status(200).send(tempUserObj)
        })
        .catch((error) => {
          console.error(error)
        })
    })
  } catch (err) {
    console.log(err)
  }
}

export async function verifyRegistrationMain(
  req: Request,
  res: Response,
): Promise<any> {
  const { token } = req.params

  try {
    jwt.verify(token, process.env.EMAIL_SECRET, (err, decodedToken) => {
      if (err) return res.status(404).send({ error: 'This link is expired' })
      TemporaryReseller.findOne({
        email: decodedToken.email,
        isCanadaCannabyssTeam: true,
        createdBy: decodedToken.createdBy,
      })
        .populate({
          path: 'createdBy',
          model: Admin,
        })
        .then((tempUser) => {
          let tempUserObj
          if (!tempUser) {
            tempUserObj = {
              error: 'Invalid link',
            }
          } else {
            tempUserObj = tempUser
          }
          res.status(200).send(tempUserObj)
        })
        .catch((error) => {
          console.error(error)
        })
    })
  } catch (err) {
    console.log(err)
  }
}

export function verifyUsername(req: Request, res: Response): any {
  const { username } = req.params
  console.log('username:', username)
  let valid = true
  Reseller.find({
    username,
  })
    .then((users) => {
      console.log('users:', users)
      if (users.length > 0) {
        valid = false
      }
      res.json({
        valid,
      })
    })
    .catch((err) => {
      res.json({
        err,
      })
    })
}

export async function register(req: Request, res: Response): Promise<any> {
  const { firstName, lastName, username, email, password, password2 } = req.body

  const errors = []

  if (
    firstName.length === 0 &&
    lastName.length === 0 &&
    username.length === 0 &&
    email.length === 0 &&
    password.length === 0 &&
    password2.length === 0
  ) {
    errors.push({ msg: 'All fields must me filled' })
  }

  if (password !== password2) {
    errors.push({ msg: 'Passwords must match' })
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' })
  }

  const slugifiedUsername = slugifyUsername(username)

  try {
    const existingUser = await Reseller.findOne({
      username: slugifiedUsername,
    })
    if (existingUser) {
      errors.push({ msg: 'Username already exist' })
    }
  } catch (err) {
    console.error(err)
    errors.push({ msg: 'Error while finding existing user' })
  }

  if (errors.length > 0) {
    res.status(400).send(errors)
  } else {
    Reseller.findOne({ email })
      .then((user) => {
        if (user) {
          errors.push({ msg: 'Email already exists' })
          res.json(errors)
        } else {
          const id = uuid.v4()

          const newResellerProfileImage = new ResellerProfileImage({
            id,
            name: 'default-user.jpg',
            size: 11800,
            key: 'default/users/default-user.jpg',
            url: `${process.env.FULL_BUCKET_URL}/default/users/default-user.jpg`,
          })

          newResellerProfileImage
            .save()
            .then((image) => {
              const newUser = new Reseller({
                id,
                isCanadaCannabyssTeam: false,
                names: {
                  firstName,
                  lastName,
                },
                email,
                username: slugifiedUsername,
                password,
                profileImage: image._id,
                isVerified: false,
                origin: 'Local',
              })

              bcrypt.genSalt(10, (saltError, salt) => {
                bcrypt.hash(newUser.password, salt, (hashError, hash) => {
                  if (hashError) throw hashError
                  newUser.password = hash
                  newUser.save().then((userInfo) => {
                    const newResellerReferral = new ResellerReferral({
                      reseller: userInfo._id,
                      referredResellers: [],
                      createdAt: Date.now(),
                    })
                    newResellerReferral.save().then((referral) => {
                      Reseller.findOneAndUpdate(
                        {
                          _id: userInfo._id,
                        },
                        {
                          referral: referral._id,
                        },
                        {
                          runValidators: true,
                        },
                      ).then(async () => {
                        try {
                          emailSendReseller(userInfo.email, userInfo._id)
                          const tempUserResellerObj = await TemporaryReseller.findOne(
                            {
                              email: userInfo.email,
                            },
                          )
                          await tempUserResellerObj.remove()
                          res.status(200).send({ ok: true })
                        } catch (err) {
                          console.error(err)
                        }
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

export async function referralRegister(
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

  if (
    firstName.length === 0 &&
    lastName.length === 0 &&
    username.length === 0 &&
    email.length === 0 &&
    password.length === 0 &&
    password2.length === 0
  ) {
    errors.push({ msg: 'All fields must me filled' })
  }

  if (password !== password2) {
    errors.push({ msg: 'Passwords must match' })
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' })
  }

  const slugifiedUsername = slugifyUsername(username)

  try {
    const existingUser = await Reseller.findOne({
      username: slugifiedUsername,
    })
    if (existingUser) {
      errors.push({ msg: 'Username already exist' })
    }
  } catch (err) {
    console.error(err)
    errors.push({ msg: 'Error while finding existing user' })
  }

  if (errors.length > 0) {
    res.status(400).send(errors)
  } else {
    Reseller.findOne({ email })
      .then((user) => {
        if (user) {
          errors.push({ msg: 'Email already exists' })
          res.json(errors)
        } else {
          const id = uuid.v4()

          const newResellerProfileImage = new ResellerProfileImage({
            id,
            name: 'default-user.jpg',
            size: 11800,
            key: 'default/users/default-user.jpg',
            url: `${process.env.FULL_BUCKET_URL}/default/users/default-user.jpg`,
          })

          newResellerProfileImage
            .save()
            .then((image) => {
              const newUser = new Reseller({
                id,
                isCanadaCannabyssTeam: false,
                names: {
                  firstName,
                  lastName,
                },
                email,
                username: slugifiedUsername,
                password,
                profileImage: image._id,
                isVerified: false,
                origin: 'Local',
              })

              bcrypt.genSalt(10, (saltError, salt) => {
                bcrypt.hash(newUser.password, salt, (hashError, hash) => {
                  if (hashError) throw hashError
                  newUser.password = hash
                  newUser.save().then((userInfo) => {
                    const newResellerReferral = new ResellerReferral({
                      reseller: userInfo._id,
                      referredResellers: [],
                      createdAt: Date.now(),
                    })
                    newResellerReferral.save().then((referral) => {
                      Reseller.findOneAndUpdate(
                        {
                          _id: userInfo._id,
                        },
                        {
                          referral: referral._id,
                        },
                        {
                          runValidators: true,
                        },
                      ).then(() => {
                        ResellerReferral.findOne({
                          _id: referralId,
                        })
                          .then((referralObj) => {
                            const referraledUsersObj = [
                              ...referralObj.referredResellers,
                            ]
                            referraledUsersObj.push(userInfo._id)

                            ResellerReferral.findOneAndUpdate(
                              {
                                _id: referralId,
                              },
                              {
                                referredResellers: referraledUsersObj,
                              },
                              {
                                runValidators: true,
                              },
                            )
                              .then(() => {
                                try {
                                  emailSendReseller(
                                    userInfo.email,
                                    userInfo._id,
                                  )
                                  res.status(200).send({ ok: true })
                                } catch (err) {
                                  console.error(err)
                                }
                              })
                              .catch((err) => {
                                console.error(err)
                              })
                          })
                          .catch((err) => {
                            console.log(err)
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

export async function mainRegister(req: Request, res: Response): Promise<any> {
  const { firstName, lastName, username, email, password, password2 } = req.body

  const errors = []

  if (
    firstName.length === 0 &&
    lastName.length === 0 &&
    username.length === 0 &&
    email.length === 0 &&
    password.length === 0 &&
    password2.length === 0
  ) {
    errors.push({ msg: 'All fields must me filled' })
  }

  if (password !== password2) {
    errors.push({ msg: 'Passwords must match' })
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' })
  }

  const slugifiedUsername = slugifyUsername(username)

  try {
    const existingUser = await Reseller.findOne({
      username: slugifiedUsername,
    })
    if (existingUser) {
      errors.push({ msg: 'Username already exist' })
    }
  } catch (err) {
    console.error(err)
    errors.push({ msg: 'Error while finding existing user' })
  }

  if (errors.length > 0) {
    res.status(400).send(errors)
  } else {
    Reseller.findOne({ email })
      .then((user) => {
        if (user) {
          errors.push({ msg: 'Email already exists' })
          res.json(errors)
        } else {
          const id = uuid.v4()

          const newResellerProfileImage = new ResellerProfileImage({
            id,
            name: 'default-user.jpg',
            size: 11800,
            key: 'default/users/default-user.jpg',
            url: `${process.env.FULL_BUCKET_URL}/default/users/default-user.jpg`,
          })

          newResellerProfileImage
            .save()
            .then((image) => {
              const newUser = new Reseller({
                id,
                isCanadaCannabyssTeam: true,
                names: {
                  firstName,
                  lastName,
                },
                email,
                username: slugifiedUsername,
                password,
                profileImage: image._id,
                isVerified: false,
                origin: 'Local',
              })

              bcrypt.genSalt(10, (saltError, salt) => {
                bcrypt.hash(newUser.password, salt, (hashError, hash) => {
                  if (hashError) throw hashError
                  newUser.password = hash
                  newUser.save().then((userInfo) => {
                    const newResellerReferral = new ResellerReferral({
                      reseller: userInfo._id,
                      referredResellers: [],
                      createdAt: Date.now(),
                    })
                    newResellerReferral.save().then((referral) => {
                      Reseller.findOneAndUpdate(
                        {
                          _id: userInfo._id,
                        },
                        {
                          referral: referral._id,
                        },
                        {
                          runValidators: true,
                        },
                      ).then(async () => {
                        try {
                          emailSendReseller(userInfo.email, userInfo._id)
                          const tempUserResellerObj = await TemporaryReseller.findOne(
                            {
                              email: userInfo.email,
                            },
                          )
                          await tempUserResellerObj.remove()
                          res.status(200).send({ ok: true })
                        } catch (err) {
                          console.error(err)
                        }
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

export async function login(req: Request, res: Response): Promise<any> {
  const { email, password } = req.body

  try {
    const errors = []

    if (!email || email.length === 0 || !password || password.length === 0) {
      errors.push({ msg: 'Please enter all fields' })
    }

    const user = await Reseller.findOne({
      email,
      isVerified: true,
    })

    console.log('reseller user:', user)

    if (!user) {
      errors.push({ msg: 'Reseller does not exist' })
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

export async function confirmationToken(
  req: Request,
  res: Response,
): Promise<any> {
  const { token } = req.params
  try {
    jwt.verify(token, process.env.EMAIL_SECRET, (err, decodedToken) => {
      if (err) return res.status(404).send({ error: 'This link is expired' })
      Reseller.findOneAndUpdate(
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
            res.status(200).send(user)
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
      const userInfoObj = await Reseller.findOne({
        _id: user.id,
      })
        .populate({
          path: 'profileImage',
          model: ResellerProfileImage,
        })
        .populate({
          path: 'referral',
          model: ResellerReferral,
        })
      if (!userInfoObj) return res.sendStatus(404)
      return res.status(200).send(userInfoObj)
    },
  )
}

export async function resetPasswordSent(
  req: Request,
  res: Response,
): Promise<any> {
  const { email } = req.body

  console.log('body:', req.body)

  Reseller.findOne({
    email,
  })
    .then((user) => {
      if (user) {
        emailSendResellerResetPassword(user.email, user._id)
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
  console.log('testing token:', token)
  try {
    jwt.verify(
      token,
      process.env.RESET_PASSWORD_SECRET,
      (err, decodedToken) => {
        console.log(err)
        if (err) return res.status(404).send({ error: 'This link is expired' })
        Reseller.findOne({
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

            Reseller.findOne({
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
                        Reseller.findOneAndUpdate(
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