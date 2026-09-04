import ApiError from '../utils/ApiError.js'

export function notFound(request, response, next) {
  next(new ApiError(404, 'NOT_FOUND', 'Requested resource was not found'))
}
