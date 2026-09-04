import jwt from 'jsonwebtoken'
import { getConfig } from '../config/env.js'
import ApiError from './ApiError.js'

export function signAccessToken(user) {
  const { jwtSecret, jwtExpiresIn } = getConfig({ requireJwt: true })
  return jwt.sign({ role: user.role }, jwtSecret, { subject: user.id, expiresIn: jwtExpiresIn })
}

export function verifyAccessToken(token) {
  const { jwtSecret } = getConfig({ requireJwt: true })
  try { return jwt.verify(token, jwtSecret) } catch { throw new ApiError(401, 'INVALID_TOKEN', 'Authentication token is invalid or expired') }
}
