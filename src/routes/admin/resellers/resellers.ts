import { Router } from 'express'
import {
  deleteReseller,
  index,
  panel,
  update,
  username,
} from '../../../controllers/admin/resellers/resellers'

const router = Router()

router.get('', index)

router.get('/panel', panel)

router.get('/:username', username)

router.put('/update/:id', update)

router.delete('/delete/reseller/:resellerId', deleteReseller)

export default router
