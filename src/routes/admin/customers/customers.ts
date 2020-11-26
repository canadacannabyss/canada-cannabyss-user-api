import { Router } from 'express'
import { sendTrackingNumber } from '../../../controllers/admin/customers/customers'

const router = Router()

router.post('/send/tracking-number', sendTrackingNumber)

export default router
