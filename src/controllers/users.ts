import { Request, Response } from 'express'
import { v4 } from 'uuid'
import { error, success, warning } from '../utils/logger/logger'
import User from '../models/user/User'

import UserProfileImage from '../models/user/UserProfileImage'

import { IUser } from '../interfaces/models/user/user'
import { MulterRequest } from '../interfaces/config/multer/multer'

export const index = (req: Request, res: Response) => {
  User.find()
    .populate('profileImage')
    .then((users) => {
      const usersList = users.map((user: IUser) => {
        return {
          id: user.id,
          names: user.names,
          email: user.email,
          username: user.username,
          profileImage: user.profileImage,
          isAdmin: user.isAdmin,
          origin: user.origin,
          createdAt: user.createdAt,
        }
      })
      return usersList
    })
    .catch((err: Error) => {})
}

export const user = (req: Request, res: Response) => {
  const { email } = req.body

  User.findOne({ email }, (err, user) => {
    return res.status(200).send({
      names: user.names,
      email: user.email,
      created_on: user.createdAt,
    })
  }).catch((err) => console.log(err))
}

export const publicProfile = (req: Request, res: Response) => {
  const { username } = req.params

  User.findOne({
    username,
  })
    .populate('profileImage')
    .then((userInfo) => {
      console.log('userInfo:', userInfo)
      return res.json(userInfo)
    })
    .catch((err) => {
      console.log(err)
    })
}

export const uploadProfilePicture = async (
  req: MulterRequest,
  res: Response,
) => {
  const { originalname: name, size, key, location: url = '' } = req.file
  const id = v4()

  const profilePicture = await UserProfileImage.create({
    id,
    name,
    size,
    key,
    url,
    origin: 'Local',
  })
  console.log('profilePicture:', profilePicture)

  return res.json(profilePicture)
}
