import { Router } from 'express'
import passport from 'passport'

import { authenticateToken } from '../../middleware/jwt'

import {
  facebookCallback,
  googleCallback,
  getAllUsers,
  register,
  registerReferral,
  token,
  login,
  decodeToken,
  confirmationToken,
  resetPasswordSent,
  validateCurrentPassword,
  accountResetPassword,
  resetPasswordValidatingToken,
  resetPassword,
  logout,
} from '../../controllers/customers/auth'

const router = Router()

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }))

router.get(
  '/facebook/callback',
  passport.authenticate('facebook'),
  facebookCallback,
)

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  }),
)

router.get('/google/callback', passport.authenticate('google'), googleCallback)

router.get('/users', authenticateToken, getAllUsers)

router.post('/register', register)

router.post('/register/referral', registerReferral)

router.post('/token', token)

router.post('/login', login)

router.post('/decode/token', authenticateToken, decodeToken)

router.get('/confirmation/:token', confirmationToken)

router.post('/reset-password/sent', resetPasswordSent)

router.post('/validate/current/password', validateCurrentPassword)

router.post('/account/reset-password', accountResetPassword)

router.get(
  '/reset-password/validating/token/:token',
  resetPasswordValidatingToken,
)

router.post('/reset-password', resetPassword)

// Logout
router.delete('/logout', authenticateToken, logout)

export default router
