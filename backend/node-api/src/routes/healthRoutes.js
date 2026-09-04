import { Router } from 'express'
import { sendSuccess } from '../utils/apiResponse.js'

const router = Router()
router.get('/', (request, response) => sendSuccess(response, { service: 'CareRoute LK Node API', status: 'healthy' }))
export default router
