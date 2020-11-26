import { Router } from 'express'

import {
  customerVerify,
  adminVerify,
  resellerVerify,
  customer,
  admin,
  reseller,
  customerGetInvitedFriends,
  adminGetInvitedFriends,
  resellerGetInvitedFriends,
} from '@controllers/referral/referral'

const router = Router()

router.get('/customer/verify', customerVerify)

router.get('/admin/verify', adminVerify)

router.get('/reseller/verify', resellerVerify)

router.get('/customer', customer)

router.get('/admin', admin)

router.get('/reseller', reseller)

router.get(
  '/customer/get/invited-friends/:customerId',
  customerGetInvitedFriends,
)

router.get('/admin/get/invited-friends/:adminId', adminGetInvitedFriends)

router.get(
  '/reseller/get/invited-friends/:resellerId',
  resellerGetInvitedFriends,
)

export default router
