import { Router } from 'express'
import {
  index,
  indexPanel,
  getUsername,
  updateById,
  deleteReseller,
} from '../../controllers/reseller/index'

const router = Router()

router.get('', index)

router.get('/panel', indexPanel)

router.get('/:username', getUsername)

router.put('/update/:id', updateById)

router.delete('/delete/reseller/:resellerId', deleteReseller)

export default router
