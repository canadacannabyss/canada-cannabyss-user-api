import { Request, Response } from 'express'
import _ from 'lodash'

import {
  slugifyString,
  generateRandomSlug,
  slugifyUsername,
} from '../../../utils/strings/slug'

import Reseller from '../../../models/reseller/Reseller'
import ResellerProfileImage from '../../../models/reseller/ResellerProfileImage'
import ResellerReferral from '../../../models/reseller/ResellerReferral'

async function verifyValidResellerUsername(
  username: string,
  id: string,
): Promise<boolean> {
  try {
    const reseller = await Reseller.find({
      username,
    })
    if (reseller.length === 1) {
      if (JSON.stringify(reseller[0]._id) === id) {
        return true
      }
      return false
    }
    return true
  } catch (err) {
    console.log(err)
  }
}

export function index(req: Request, res: Response): any {
  Reseller.find()
    .then((users) => {
      return res.status(200).send(users)
    })
    .catch((err) => {
      console.log(err)
    })
}

export function panel(req: Request, res: Response): any {
  Reseller.find()
    .populate({
      path: 'profileImage',
      model: ResellerProfileImage,
    })
    .then((users) => {
      return res.status(200).send(users)
    })
    .catch((err) => {
      console.log(err)
    })
}

export function username(req: Request, res: Response): any {
  const { username } = req.params
  Reseller.findOne({
    username,
  })
    .populate({
      path: 'profileImage',
      model: ResellerProfileImage,
    })
    .populate({
      path: 'referral',
      model: ResellerReferral,
    })
    .then((user) => {
      console.log('user reseller:', user)
      return res.status(200).send(user)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function update(req: Request, res: Response): Promise<any> {
  const { names, username, email, phone } = req.body
  const { id } = req.params

  let newUsername = slugifyUsername(username)

  if (!(await verifyValidResellerUsername(username, id))) {
    newUsername = await generateRandomSlug(username)
  }
  try {
    await Reseller.findOneAndUpdate(
      {
        _id: id,
      },
      {
        names: {
          firstName: names.firstName,
          lastName: names.lastName,
        },
        username: newUsername,
        email,
        phone,
        updatedAt: Date.now(),
      },
      {
        runValidators: true,
      },
    )

    return res.status(200).send({
      ok: true,
    })
  } catch (err) {
    console.log(err)
  }
}

export async function deleteReseller(
  req: Request,
  res: Response,
): Promise<any> {
  const { resellerId } = req.params

  try {
    const resellerObj = await Reseller.findOne({
      _id: resellerId,
    })
      .populate({
        path: 'profileImage',
        model: ResellerProfileImage,
      })
      .populate({
        path: 'referral',
        model: ResellerReferral,
      })

    const resellerProfileImageObj = await ResellerProfileImage.findOne({
      _id: resellerObj.profileImage._id,
    })

    const resellerReferralObj = await ResellerReferral.findOne({
      _id: resellerObj.referral._id,
    })

    resellerProfileImageObj.remove()
    resellerReferralObj.remove()
    resellerObj.remove()

    return res.status(200).send({ ok: true })
  } catch (err) {
    console.log(err)
  }
}
