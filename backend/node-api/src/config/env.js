import dotenv from 'dotenv'

dotenv.config({ quiet: true })
const validEnvironments = new Set(['development', 'test', 'production'])

export function getConfig({ requireDatabase = false, requireJwt = false } = {}) {
  const nodeEnv = process.env.NODE_ENV ?? 'development'
  if (!validEnvironments.has(nodeEnv)) throw new Error('NODE_ENV must be development, test, or production')
  const port = Number.parseInt(process.env.PORT ?? '5000', 10)
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be a valid TCP port')
  const mongoUri = process.env.MONGODB_URI?.trim()
  const jwtSecret = process.env.JWT_SECRET?.trim()
  if (requireDatabase && !mongoUri) throw new Error('MONGODB_URI is required to start the Node API')
  if (requireJwt && !jwtSecret) throw new Error('JWT_SECRET is required for authentication')
  if (requireJwt && jwtSecret.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters')
  return { nodeEnv, port, mongoUri, frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173', jwtSecret, jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h' }
}
