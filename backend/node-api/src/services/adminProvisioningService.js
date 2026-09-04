import bcrypt from 'bcryptjs'
import { ROLES } from '../constants/roles.js'
import ApiError from '../utils/ApiError.js'

export async function provisionAdmin(UserModel, input) {
  const name = input.name?.trim(); const email = input.email?.trim().toLowerCase(); const password = input.password
  if (!name || name.length < 2 || name.length > 100) throw new ApiError(422, 'INVALID_ADMIN_INPUT', 'Admin name must be between 2 and 100 characters')
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(422, 'INVALID_ADMIN_INPUT', 'A valid admin email is required')
  if (typeof password !== 'string' || password.length < 8 || password.length > 128 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) throw new ApiError(422, 'INVALID_ADMIN_INPUT', 'Admin password must be 8–128 characters and contain a letter and number')
  if (await UserModel.findOne({ email })) throw new ApiError(409, 'EMAIL_IN_USE', 'An account with this email already exists')
  return UserModel.create({ name, email, passwordHash: await bcrypt.hash(password, 12), role: ROLES.ADMIN, preferredLanguage: 'en', isActive: true })
}
