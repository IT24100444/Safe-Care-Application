import { body, param, query } from 'express-validator'
import { CONSULTATION_TYPES, LANGUAGES, SLOT_DURATIONS, SPECIALIZATIONS } from '../constants/domain.js'

const required = (validation, partial) => partial ? validation.optional() : validation.exists().bail()
const uniqueArray = (value) => Array.isArray(value) && new Set(value).size === value.length
const fields = (partial) => [
  required(body('name'), partial).trim().isLength({ min: 2, max: 120 }),
  required(body('specialization'), partial).isIn(SPECIALIZATIONS),
  body('qualification').optional().isString().trim().isLength({ max: 240 }),
  required(body('facilityIds'), partial).isArray(), body('facilityIds.*').optional().isMongoId(),
  required(body('healthServiceIds'), partial).isArray(), body('healthServiceIds.*').optional().isMongoId(),
  required(body('supportedLanguages'), partial).isArray({ min: 1 }).custom(uniqueArray).withMessage('Languages must not contain duplicates'), body('supportedLanguages.*').optional().isIn(LANGUAGES),
  body('consultationType').optional().isIn(CONSULTATION_TYPES), body('bio').optional().isString().trim().isLength({ max: 2000 }), body('userId').optional({ nullable: true }).isMongoId(),
]
export const doctorCreateValidator = fields(false)
export const doctorUpdateValidator = fields(true)
export const doctorIdValidator = [param('id').isMongoId()]
export const doctorAvailabilityValidator = [param('doctorId').isMongoId(), query('date').matches(/^\d{4}-\d{2}-\d{2}$/)]
export const doctorFilterValidator = [query('specialization').optional().isIn(SPECIALIZATIONS), query('facility').optional().isMongoId(), query('healthService').optional().isMongoId(), query('language').optional().isIn(LANGUAGES), query('name').optional().isString().trim().isLength({ min: 1, max: 80 })]
const scheduleFields = (partial) => [required(body('doctorId'), partial).isMongoId(), required(body('facilityId'), partial).isMongoId(), required(body('date'), partial).matches(/^\d{4}-\d{2}-\d{2}$/), required(body('startTime'), partial).matches(/^([01]\d|2[0-3]):[0-5]\d$/), required(body('endTime'), partial).matches(/^([01]\d|2[0-3]):[0-5]\d$/), required(body('slotDurationMinutes'), partial).isInt().isIn(SLOT_DURATIONS.map(String)).toInt()]
export const scheduleCreateValidator = scheduleFields(false)
export const scheduleUpdateValidator = scheduleFields(true)
export const scheduleIdValidator = [param('id').isMongoId()]
export const scheduleFilterValidator = [query('doctor').optional().isMongoId(), query('facility').optional().isMongoId(), query('date').optional().matches(/^\d{4}-\d{2}-\d{2}$/)]
