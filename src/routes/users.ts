import { Router } from 'express'
import multer from 'multer'

import multerConfig from '../config/multer/multer'
import {
  index,
  publicProfile,
  uploadProfilePicture,
  user,
} from '../controllers/users'

const router: Router = Router()

router.get('/all', index)

router.post('/user', user)

router.get('/public-profile/:username', publicProfile)

router.post(
  '/upload/profile-picture',
  multer(multerConfig).single('file'),
  uploadProfilePicture,
)

export default router
