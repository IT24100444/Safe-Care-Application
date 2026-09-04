import { body, param, query } from 'express-validator'
import { APPOINTMENT_STATUSES, LANGUAGES } from '../constants/domain.js'

export const appointmentIdValidator = [param('id').isMongoId()]
const schedulingFields = (includeDoctor, languageRequired) => [
  ...(includeDoctor ? [body('doctorId').isMongoId()] : [body('doctorId').not().exists().withMessage('Doctor cannot be changed during rescheduling')]),
  body('facilityId').isMongoId(), body('scheduleId').isMongoId(), body('appointmentDate').matches(/^\d{4}-\d{2}-\d{2}$/), body('appointmentTime').matches(/^([01]\d|2[0-3]):[0-5]\d$/), languageRequired ? body('preferredLanguage').isIn(LANGUAGES) : body('preferredLanguage').optional().isIn(LANGUAGES), body('patientId').not().exists().withMessage('Patient identity is taken from authentication'), body('status').not().exists(),
]
export const appointmentCreateValidator = schedulingFields(true, true)
export const appointmentRescheduleValidator = schedulingFields(false, false)
export const appointmentMineFilterValidator = [query('status').optional().isIn(APPOINTMENT_STATUSES), query('upcoming').optional().isBoolean()]
export const appointmentDoctorFilterValidator = [query('status').optional().isIn(APPOINTMENT_STATUSES), query('date').optional().matches(/^\d{4}-\d{2}-\d{2}$/)]
export const appointmentAdminFilterValidator = [query('status').optional().isIn(APPOINTMENT_STATUSES), query('date').optional().matches(/^\d{4}-\d{2}-\d{2}$/), query('doctor').optional().isMongoId(), query('facility').optional().isMongoId()]
