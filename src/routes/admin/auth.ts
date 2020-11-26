import { Router } from 'express'
import multer from 'multer'
import multerConfig from '../../config/multer/multer'

import { authenticateToken } from '../../middleware/jwt'

import {
  verifySU,
  verifyAdminUsername,
  registerResellerStart,
  registerMainResellerStart,
  register,
  login,
  decodeToken,
  resetPasswordSent,
  resetPasswordValidingToken,
  resetPassword,
  confirmationToken,
  uploadProfileImage,
  setGlobalVariable,
  deleteImage,
} from '../../controllers/admin/auth'

const router = Router()

router.post('/verify/su', verifySU)

router.get('/verify/admin/username/:username', verifyAdminUsername)

router.post('/register/reseller/start', registerResellerStart)

router.post('/register/main/reseller/start', registerMainResellerStart)

router.post('/register', register)

router.post('/login', login)

router.post('/decode/token', authenticateToken, decodeToken)

router.post('/reset-password/sent', resetPasswordSent)

router.get(
  '/reset-password/validating/token/:token',
  resetPasswordValidingToken,
)

router.post('/reset-password', resetPassword)

router.get('/confirmation/:token', confirmationToken)

router.post(
  '/upload/profile-image',
  multer(multerConfig).single('file'),
  uploadProfileImage,
)

router.post('/set/global-variable', setGlobalVariable)

router.delete('/delete/cover/:id', deleteImage)

export default router
