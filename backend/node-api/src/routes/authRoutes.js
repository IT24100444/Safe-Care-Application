import { Router } from 'express'
import { createAuthController } from '../controllers/authController.js'
import { authenticate } from '../middleware/authenticate.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { createAuthService } from '../services/authService.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { loginValidator, registerValidator } from '../validators/authValidator.js'

export function createAuthRouter(UserModel) {
  const router = Router()
  const controller = createAuthController(createAuthService(UserModel))
  router.post('/register', registerValidator, validateRequest, asyncHandler(controller.register))
  router.post('/login', loginValidator, validateRequest, asyncHandler(controller.login))
  router.get('/me', authenticate(UserModel), asyncHandler(controller.me))
  return router
}
