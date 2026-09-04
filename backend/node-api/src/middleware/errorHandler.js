import ApiError from '../utils/ApiError.js'

export function errorHandler(error, request, response, next) {
  if (response.headersSent) return next(error)
  const operational = error instanceof ApiError
  const statusCode = operational ? error.statusCode : 500
  const payload = { success: false, error: { code: operational ? error.code : 'INTERNAL_SERVER_ERROR', message: operational ? error.message : 'An unexpected error occurred' } }
  if (operational && error.details) payload.error.details = error.details
  if (process.env.NODE_ENV === 'development' && !operational) payload.error.stack = error.stack
  return response.status(statusCode).json(payload)
}
