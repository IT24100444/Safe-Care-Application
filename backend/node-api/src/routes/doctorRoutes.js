import { Router } from 'express'
import { ROLES } from '../constants/roles.js'
import { doctorController, scheduleController } from '../controllers/doctorController.js'
import { authenticate } from '../middleware/authenticate.js'
import { authorizeRoles } from '../middleware/authorizeRoles.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { doctorService } from '../services/doctorService.js'
import { scheduleService } from '../services/scheduleService.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { doctorAvailabilityValidator, doctorCreateValidator, doctorFilterValidator, doctorIdValidator, doctorUpdateValidator, scheduleCreateValidator, scheduleFilterValidator, scheduleIdValidator, scheduleUpdateValidator } from '../validators/doctorValidators.js'

export function createDoctorRouters({ DoctorModel, ScheduleModel, FacilityModel, HealthServiceModel, UserModel, AppointmentModel }) {
  const doctors = doctorService(DoctorModel, FacilityModel, HealthServiceModel, UserModel); const schedules = scheduleService(ScheduleModel, DoctorModel, FacilityModel, AppointmentModel)
  const doctorHandlers = doctorController(doctors); const scheduleHandlers = scheduleController(schedules, doctors)
  const admin = [authenticate(UserModel), authorizeRoles(ROLES.ADMIN)]; const doctorOnly = [authenticate(UserModel), authorizeRoles(ROLES.DOCTOR)]
  const doctorRouter = Router()
  doctorRouter.get('/', doctorFilterValidator, validateRequest, asyncHandler(doctorHandlers.list))
  doctorRouter.get('/me', doctorOnly, asyncHandler(doctorHandlers.own))
  doctorRouter.get('/:doctorId/availability', doctorAvailabilityValidator, validateRequest, asyncHandler(scheduleHandlers.availability))
  doctorRouter.get('/:id', doctorIdValidator, validateRequest, asyncHandler(doctorHandlers.get))
  doctorRouter.post('/', admin, doctorCreateValidator, validateRequest, asyncHandler(doctorHandlers.create))
  doctorRouter.patch('/:id', admin, doctorIdValidator, doctorUpdateValidator, validateRequest, asyncHandler(doctorHandlers.update))
  doctorRouter.delete('/:id', admin, doctorIdValidator, validateRequest, asyncHandler(doctorHandlers.deactivate))
  const scheduleRouter = Router()
  scheduleRouter.get('/mine', doctorOnly, asyncHandler(scheduleHandlers.mine))
  scheduleRouter.get('/', admin, scheduleFilterValidator, validateRequest, asyncHandler(scheduleHandlers.list))
  scheduleRouter.get('/:id', admin, scheduleIdValidator, validateRequest, asyncHandler(scheduleHandlers.get))
  scheduleRouter.post('/', admin, scheduleCreateValidator, validateRequest, asyncHandler(scheduleHandlers.create))
  scheduleRouter.patch('/:id', admin, scheduleIdValidator, scheduleUpdateValidator, validateRequest, asyncHandler(scheduleHandlers.update))
  scheduleRouter.delete('/:id', admin, scheduleIdValidator, validateRequest, asyncHandler(scheduleHandlers.deactivate))
  return { doctorRouter, scheduleRouter }
}
