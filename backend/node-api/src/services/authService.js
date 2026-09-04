import bcrypt from 'bcryptjs'
import { ROLES } from '../constants/roles.js'
import ApiError from '../utils/ApiError.js'
import { signAccessToken } from '../utils/token.js'

const HASH_COST = 12
const safeUser = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role, preferredLanguage: user.preferredLanguage, isActive: user.isActive, createdAt: user.createdAt })

export function createAuthService(UserModel) {
  return {
    async register(input) {
      const email = input.email.trim().toLowerCase()
      if (await UserModel.findOne({ email })) throw new ApiError(409, 'EMAIL_IN_USE', 'An account with this email already exists')
      const passwordHash = await bcrypt.hash(input.password, HASH_COST)
      try {
        const user = await UserModel.create({ name: input.name.trim(), email, passwordHash, role: ROLES.PATIENT, preferredLanguage: input.preferredLanguage })
        return { user: safeUser(user), token: signAccessToken(user) }
      } catch (error) {
        if (error?.code === 11000) throw new ApiError(409, 'EMAIL_IN_USE', 'An account with this email already exists')
        throw error
      }
    },
    async login(input) {
      const email = input.email.trim().toLowerCase()
      const user = await UserModel.findOne({ email }).select('+passwordHash')
      if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect')
      if (!user.isActive) throw new ApiError(403, 'ACCOUNT_INACTIVE', 'This account is inactive')
      return { user: safeUser(user), token: signAccessToken(user) }
    },
    safeUser,
  }
}
