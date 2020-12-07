import { Router } from 'express'
import { authenticateToken } from '../../middleware/jwt'

import {
  verifyRegistration,
  verifyRegistrationMain,
  verifyUsername,
  register,
  referralRegister,
  mainRegister,
  login,
  confirmationToken,
  decodeToken,
  resetPasswordSent,
  resetPasswordValidatingToken,
  resetPassword,
} from '../../controllers/reseller/auth'

const router = Router()

router.get('/verify/registration/:token', verifyRegistration)

router.get('/verify/registration/main/:token', verifyRegistrationMain)

router.get('/verify/username/:username', verifyUsername)

router.post('/register', register)

router.post('/referral/register', referralRegister)

router.post('/main/register', mainRegister)

router.post('/login', login)

router.get('/confirmation/:token', confirmationToken)

router.post('/decode/token', authenticateToken, decodeToken)

router.post('/reset-password/sent', resetPasswordSent)

router.get(
  '/reset-password/validating/token/:token',
  resetPasswordValidatingToken,
)

router.post('/reset-password', resetPassword)

export default router
