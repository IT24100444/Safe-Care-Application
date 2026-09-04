import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import request from 'supertest'
import { createApp } from '../src/app.js'
import { ROLES } from '../src/constants/roles.js'
import { authenticate } from '../src/middleware/authenticate.js'
import { authorizeRoles } from '../src/middleware/authorizeRoles.js'

const password = 'Secure123'

function query(value) {
  return { select: async () => value, then: (resolve, reject) => Promise.resolve(value).then(resolve, reject) }
}

function createFakeUserModel() {
  const users = []
  let nextId = 1
  return {
    users,
    duplicateOnCreate: false,
    findOne({ email }) { return query(users.find((user) => user.email === email) ?? null) },
    async findById(id) { return users.find((user) => user.id === id) ?? null },
    async create(data) {
      if (this.duplicateOnCreate) { const error = new Error('duplicate'); error.code = 11000; throw error }
      const user = { id: String(nextId++), ...data, isActive: true, createdAt: new Date().toISOString() }
      users.push(user)
      return user
    },
  }
}

function setup() {
  const model = createFakeUserModel()
  const app = createApp({
    userModel: model,
    registerAdditionalRoutes(instance) {
      instance.get('/test/admin', authenticate(model), authorizeRoles(ROLES.ADMIN), (req, res) => res.json({ role: req.user.role }))
    },
  })
  return { app, model }
}

async function register(app, overrides = {}) {
  return request(app).post('/api/v1/auth/register').send({ name: 'Test Patient', email: 'patient@example.com', password, preferredLanguage: 'en', ...overrides })
}

describe('registration', () => {
  test('registers only a PATIENT, hashes password, returns token, and hides hash', async () => {
    const { app, model } = setup()
    const response = await register(app)
    expect(response.status).toBe(201)
    expect(response.body.data.user.role).toBe(ROLES.PATIENT)
    expect(response.body.data.user.passwordHash).toBeUndefined()
    expect(response.body.data.token).toEqual(expect.any(String))
    expect(model.users[0].passwordHash).not.toBe(password)
    expect(await bcrypt.compare(password, model.users[0].passwordHash)).toBe(true)
  })

  test('normalizes email and rejects application-level duplicates', async () => {
    const { app } = setup()
    await register(app, { email: ' Patient@Example.COM ' })
    const response = await register(app)
    expect(response.status).toBe(409)
    expect(response.body.error.code).toBe('EMAIL_IN_USE')
  })

  test('maps database duplicate errors safely', async () => {
    const { app, model } = setup()
    model.duplicateOnCreate = true
    const response = await register(app)
    expect(response.status).toBe(409)
    expect(response.body.error).toEqual({ code: 'EMAIL_IN_USE', message: 'An account with this email already exists' })
  })

  test.each([
    [{ email: 'bad' }, 'email'],
    [{ password: 'short' }, 'password'],
    [{ name: '' }, 'name'],
    [{ preferredLanguage: 'fourth' }, 'preferredLanguage'],
    [{ role: ROLES.ADMIN }, 'role'],
    [{ role: ROLES.DOCTOR }, 'role'],
  ])('rejects invalid registration input %#', async (overrides, field) => {
    const { app } = setup()
    const response = await register(app, overrides)
    expect(response.status).toBe(422)
    expect(response.body.success).toBe(false)
    expect(response.body.error.details.some((detail) => detail.field === field)).toBe(true)
  })
})

describe('login and current user', () => {
  test('logs in with valid credentials and excludes passwordHash', async () => {
    const { app } = setup()
    await register(app)
    const response = await request(app).post('/api/v1/auth/login').send({ email: 'PATIENT@example.com', password })
    expect(response.status).toBe(200)
    expect(response.body.data.user.passwordHash).toBeUndefined()
    expect(response.body.data.token).toEqual(expect.any(String))
  })

  test.each([['patient@example.com', 'Wrong123'], ['unknown@example.com', password]])('uses generic invalid credentials', async (email, attemptedPassword) => {
    const { app } = setup()
    await register(app)
    const response = await request(app).post('/api/v1/auth/login').send({ email, password: attemptedPassword })
    expect(response.status).toBe(401)
    expect(response.body.error).toEqual({ code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect' })
  })

  test('rejects inactive account login', async () => {
    const { app, model } = setup()
    await register(app)
    model.users[0].isActive = false
    const response = await request(app).post('/api/v1/auth/login').send({ email: 'patient@example.com', password })
    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('ACCOUNT_INACTIVE')
  })

  test('requires a token for /me', async () => {
    const { app } = setup()
    const response = await request(app).get('/api/v1/auth/me')
    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED')
  })

  test('returns the safe server-loaded user for a valid token', async () => {
    const { app } = setup()
    const registration = await register(app)
    const response = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${registration.body.data.token}`)
    expect(response.status).toBe(200)
    expect(response.body.data.user.email).toBe('patient@example.com')
    expect(response.body.data.user.passwordHash).toBeUndefined()
  })

  test('rejects malformed and expired tokens', async () => {
    const { app } = setup()
    const malformed = await request(app).get('/api/v1/auth/me').set('Authorization', 'Bearer malformed')
    const expiredToken = jwt.sign({ role: ROLES.PATIENT }, process.env.JWT_SECRET, { subject: '1', expiresIn: -1 })
    const expired = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${expiredToken}`)
    expect(malformed.status).toBe(401)
    expect(expired.status).toBe(401)
  })

  test('rejects inactive and nonexistent users represented by signed tokens', async () => {
    const { app, model } = setup()
    const registration = await register(app)
    model.users[0].isActive = false
    const inactive = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${registration.body.data.token}`)
    const missingToken = jwt.sign({ role: ROLES.ADMIN }, process.env.JWT_SECRET, { subject: 'missing', expiresIn: '1h' })
    const missing = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${missingToken}`)
    expect(inactive.status).toBe(403)
    expect(missing.status).toBe(401)
  })
})

describe('role authorization', () => {
  test.each([ROLES.PATIENT, ROLES.DOCTOR])('%s is denied ADMIN permission', async (role) => {
    const { app, model } = setup()
    const registration = await register(app)
    model.users[0].role = role
    const response = await request(app).get('/test/admin').query({ role: ROLES.ADMIN }).set('Authorization', `Bearer ${registration.body.data.token}`)
    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('FORBIDDEN')
  })

  test('ADMIN is allowed based on server-loaded role, not request role', async () => {
    const { app, model } = setup()
    await register(app)
    model.users[0].role = ROLES.ADMIN
    const token = jwt.sign({ role: ROLES.PATIENT }, process.env.JWT_SECRET, { subject: model.users[0].id, expiresIn: '1h' })
    const response = await request(app).get('/test/admin').query({ role: ROLES.PATIENT }).set('Authorization', `Bearer ${token}`)
    expect(response.status).toBe(200)
    expect(response.body.role).toBe(ROLES.ADMIN)
  })
})
