import { Router } from 'express'
import { ROLES } from '../constants/roles.js'
import { appointmentController } from '../controllers/appointmentController.js'
import { authenticate } from '../middleware/authenticate.js'
import { authorizeRoles } from '../middleware/authorizeRoles.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { appointmentService } from '../services/appointmentService.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { appointmentAdminFilterValidator, appointmentCreateValidator, appointmentDoctorFilterValidator, appointmentIdValidator, appointmentMineFilterValidator, appointmentRescheduleValidator } from '../validators/appointmentValidators.js'

export function createAppointmentRouter({ AppointmentModel, DoctorModel, FacilityModel, ScheduleModel, UserModel }) {
  const router = Router(); const handlers = appointmentController(appointmentService(AppointmentModel, DoctorModel, FacilityModel, ScheduleModel)); const auth = authenticate(UserModel)
  router.post('/', auth, authorizeRoles(ROLES.PATIENT), appointmentCreateValidator, validateRequest, asyncHandler(handlers.book))
  router.get('/mine', auth, authorizeRoles(ROLES.PATIENT), appointmentMineFilterValidator, validateRequest, asyncHandler(handlers.mine))
  router.get('/doctor/mine', auth, authorizeRoles(ROLES.DOCTOR), appointmentDoctorFilterValidator, validateRequest, asyncHandler(handlers.doctorMine))
  router.get('/', auth, authorizeRoles(ROLES.ADMIN), appointmentAdminFilterValidator, validateRequest, asyncHandler(handlers.adminList))
  router.get('/:id', auth, authorizeRoles(ROLES.PATIENT, ROLES.DOCTOR, ROLES.ADMIN), appointmentIdValidator, validateRequest, asyncHandler(handlers.get))
  router.patch('/:id/cancel', auth, authorizeRoles(ROLES.PATIENT, ROLES.ADMIN), appointmentIdValidator, validateRequest, asyncHandler(handlers.cancel))
  router.patch('/:id/reschedule', auth, authorizeRoles(ROLES.PATIENT), appointmentIdValidator, appointmentRescheduleValidator, validateRequest, asyncHandler(handlers.reschedule))
  return router
}
