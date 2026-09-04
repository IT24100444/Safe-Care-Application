import { body, param, query } from 'express-validator'
import { DISTRICTS, FACILITY_TYPES, LANGUAGES } from '../constants/domain.js'

export const idValidator = [param('id').isMongoId().withMessage('Resource ID must be a valid MongoDB ObjectId')]
const optionalWhen = (validation, partial) => partial ? validation.optional() : validation.exists().bail()
const serviceFields = (partial) => [optionalWhen(body('name'), partial).trim().isLength({ min: 2, max: 120 }), optionalWhen(body('category'), partial).trim().isLength({ min: 2, max: 80 }), body('description').optional().isString().isLength({ max: 1000 })]
export const serviceCreateValidator = serviceFields(false)
export const serviceUpdateValidator = serviceFields(true)
const facilityFields = (partial) => [optionalWhen(body('name'), partial).trim().isLength({ min: 2, max: 160 }), optionalWhen(body('facilityType'), partial).isIn(FACILITY_TYPES), optionalWhen(body('district'), partial).isIn(DISTRICTS), optionalWhen(body('address'), partial).trim().isLength({ min: 2, max: 300 }), body('contactNumber').optional().isString().matches(/^[+()\-\s\d]*$/).isLength({ max: 30 }), optionalWhen(body('supportedLanguages'), partial).isArray({ min: 1 }), body('supportedLanguages.*').optional().isIn(LANGUAGES), optionalWhen(body('healthServices'), partial).isArray(), body('healthServices.*').optional().isMongoId(), optionalWhen(body('emergencyAvailable'), partial).isBoolean({ strict: true }), body('description').optional().isString().isLength({ max: 1000 })]
export const facilityCreateValidator = facilityFields(false)
export const facilityUpdateValidator = facilityFields(true)
export const facilityFilterValidator = [query('district').optional().isIn(DISTRICTS), query('facilityType').optional().isIn(FACILITY_TYPES), query('language').optional().isIn(LANGUAGES), query('healthService').optional().isMongoId(), query('emergencyAvailable').optional().isBoolean()]
export const serviceFilterValidator = [query('category').optional().isString().isLength({ max: 80 }), query('search').optional().isString().isLength({ max: 80 })]
