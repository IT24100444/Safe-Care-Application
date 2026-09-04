import { Router } from 'express'
import { controller } from '../controllers/resourceControllers.js'
import { ROLES } from '../constants/roles.js'
import { authenticate } from '../middleware/authenticate.js'
import { authorizeRoles } from '../middleware/authorizeRoles.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { facilityService, healthServiceService } from '../services/resourceServices.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { facilityCreateValidator, facilityFilterValidator, facilityUpdateValidator, idValidator, serviceCreateValidator, serviceFilterValidator, serviceUpdateValidator } from '../validators/resourceValidators.js'

function resourceRouter(service, { create, update, filters }, userModel) {
  const router = Router(); const handlers = controller(service); const admin = [authenticate(userModel), authorizeRoles(ROLES.ADMIN)]
  router.get('/', filters, validateRequest, asyncHandler(handlers.list)); router.get('/:id', idValidator, validateRequest, asyncHandler(handlers.get)); router.post('/', admin, create, validateRequest, asyncHandler(handlers.create)); router.patch('/:id', admin, idValidator, update, validateRequest, asyncHandler(handlers.update)); router.delete('/:id', admin, idValidator, validateRequest, asyncHandler(handlers.deactivate)); return router
}
export const serviceRoutes = (model, userModel) => resourceRouter(healthServiceService(model), { create: serviceCreateValidator, update: serviceUpdateValidator, filters: serviceFilterValidator }, userModel)
export const facilityRoutes = (model, services, userModel) => resourceRouter(facilityService(model, services), { create: facilityCreateValidator, update: facilityUpdateValidator, filters: facilityFilterValidator }, userModel)
