import { Request, Response } from 'express'
import Customer from '../../models/customer/Customer'
import Admin from '../../models/admin/Admin'
import Reseller from '../../models/reseller/Reseller'

import CustomerProfileImage from '../../models/customer/CustomerProfileImage'
import AdminProfileImage from '../../models/admin/AdminProfileImage'
import ResellerProfileImage from '../../models/reseller/ResellerProfileImage'

import CustomerReferral from '../../models/customer/CustomerReferral'
import AdminReferral from '../../models/admin/AdminReferral'
import ResellerReferral from '../../models/reseller/ResellerReferral'

export function customerVerify(req: Request, res: Response): any {
  const { referral } = req.query

  let found = true
  CustomerReferral.findOne({
    _id: referral,
  })
    .then((referralObj) => {
      if (!referralObj) found = false
      res.json(found)
    })
    .catch((err) => {
      console.log(err)
      res.json(false)
    })
}

export function adminVerify(req: Request, res: Response): any {
  const { referral } = req.query
  let found = true
  console.log('referral:', referral)
  AdminReferral.findOne({
    _id: referral,
  })
    .then((referralObj) => {
      if (!referralObj) found = false
      res.json(found)
    })
    .catch((err) => {
      console.log(err)
      res.json(false)
    })
}

export function resellerVerify(req: Request, res: Response): any {
  const { referral } = req.query
  let found = true

  ResellerReferral.findOne({
    _id: referral,
  })
    .then((referralObj) => {
      if (!referralObj) found = false
      res.json(found)
    })
    .catch((err) => {
      console.log(err)
      res.json(false)
    })
}

export function customer(req: Request, res: Response): any {
  const { referral } = req.query
  console.log('referral customer:', referral)
  CustomerReferral.findOne({
    _id: referral,
  })
    .populate({
      path: 'customer',
      model: Customer,
    })
    .then((referralObj) => {
      res.json({
        names: {
          firstName: referralObj.customer.names.firstName,
          lastName: referralObj.customer.names.lastName,
        },
      })
    })
    .catch((err) => {
      res.json(false)
    })
}

export async function customerAddCreditOnBuy(req: Request, res: Response): any {
  const { customerId } = req.body

  try {
    const referralObj = await CustomerReferral.findOne({
      referredCustomers: customerId,
    }).populate({
      path: 'customer',
      model: Customer,
    })

    if (!referralObj) {
      return res.status(400).send({
        statusCode: 400,
        result: {},
        errors: ['Referral does not exist.'],
      })
    }

    await Customer.findOneAndUpdate(
      {
        _id: referralObj.customer._id,
      },
      {
        credits: referralObj.customer.credits + 5,
      },
      {
        runValidators: true,
      },
    )

    return res.status(200).send({
      statusCode: 200,
      result: {
        ok: true,
      },
      errors: [],
    })
  } catch (err: any) {
    return res.status(500).send({
      statusCode: 500,
      result: {},
      errors: [err.message],
    })
  }
}

export function admin(req: Request, res: Response): any {
  const { referral } = req.query

  AdminReferral.findOne({
    _id: referral,
  })
    .populate({
      path: 'admin',
      model: Admin,
    })
    .then((referralObj) => {
      res.json({
        names: {
          firstName: referralObj.admin.names.firstName,
          lastName: referralObj.admin.names.lastName,
        },
      })
    })
    .catch((err) => {
      res.json(false)
    })
}

export function reseller(req: Request, res: Response): any {
  const { referral } = req.query

  ResellerReferral.findOne({
    _id: referral,
  })
    .populate({
      path: 'reseller',
      model: Reseller,
    })
    .then((referralObj) => {
      res.json({
        names: {
          firstName: referralObj.reseller.names.firstName,
          lastName: referralObj.reseller.names.lastName,
        },
      })
    })
    .catch((err) => {
      res.json({ ok: false })
    })
}

export function customerGetInvitedFriends(req: Request, res: Response): any {
  const { customerId } = req.params

  CustomerReferral.findOne({
    customer: customerId,
  })
    .populate({
      path: 'referredCustomers',
      model: Customer,
      populate: {
        path: 'profileImage',
        model: CustomerProfileImage,
      },
    })
    .then((referralObj) => {
      res.status(200).send(referralObj.referredCustomers)
    })
    .catch((err) => {
      console.log(err)
    })
}

export function adminGetInvitedFriends(req: Request, res: Response): any {
  const { adminId } = req.params

  AdminReferral.findOne({
    admin: adminId,
  })
    .populate({
      path: 'referredAdmins',
      model: Admin,
      populate: {
        path: 'profileImage',
        model: AdminProfileImage,
      },
    })
    .then((referralObj) => {
      res.status(200).send(referralObj.referredAdmins)
    })
    .catch((err) => {
      console.log(err)
    })
}

export function resellerGetInvitedFriends(req: Request, res: Response): any {
  const { resellerId } = req.params

  ResellerReferral.findOne({
    reseller: resellerId,
  })
    .populate({
      path: 'referredResellers',
      model: Reseller,
      populate: {
        path: 'profileImage',
        model: ResellerProfileImage,
      },
    })
    .then((referralObj) => {
      res.status(200).send(referralObj.referredResellers)
    })
    .catch((err) => {
      console.log(err)
    })
}
