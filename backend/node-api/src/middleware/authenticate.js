import ApiError from '../utils/ApiError.js'
import { verifyAccessToken } from '../utils/token.js'

export function authenticate(UserModel) {
  return async function authenticateRequest(request, response, next) {
    try {
      const [scheme, token] = (request.get('authorization') ?? '').split(' ')
      if (scheme !== 'Bearer' || !token) throw new ApiError(401, 'AUTHENTICATION_REQUIRED', 'A Bearer authentication token is required')
      const payload = verifyAccessToken(token)
      const user = await UserModel.findById(payload.sub)
      if (!user) throw new ApiError(401, 'INVALID_TOKEN', 'Authentication token is invalid or expired')
      if (!user.isActive) throw new ApiError(403, 'ACCOUNT_INACTIVE', 'This account is inactive')
      request.user = user
      next()
    } catch (error) { next(error) }
  }
}
