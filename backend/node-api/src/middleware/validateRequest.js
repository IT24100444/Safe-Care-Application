import { validationResult } from 'express-validator'
import ApiError from '../utils/ApiError.js'

export function validateRequest(request, response, next) {
  const result = validationResult(request)
  if (result.isEmpty()) return next()
  const details = result.array().map(({ path, msg }) => ({ field: path, message: msg }))
  return next(new ApiError(422, 'VALIDATION_ERROR', 'Request validation failed', details))
}
