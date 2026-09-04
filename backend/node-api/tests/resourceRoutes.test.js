import jwt from 'jsonwebtoken'
import request from 'supertest'
import { createApp } from '../src/app.js'

const objectId = '000000000000000000000001'
const query = (value) => ({ select: async () => value, then: (resolve, reject) => Promise.resolve(value).then(resolve, reject) })
function setup(role = 'ADMIN', active = true) {
  const user = { id: 'user-1', role, isActive: active }
  const users = { findById: async () => user, findOne: () => query(null) }
  const services = { find: async () => [], findOne: async () => ({ _id: objectId, name: 'General Medicine', category: 'General', isActive: true }), create: async (data) => ({ _id: objectId, ...data }), findOneAndUpdate: async (filter, data) => ({ _id: objectId, name: 'General Medicine', category: 'General', ...data }), countDocuments: async () => 1 }
  const facilities = { find: () => ({ populate: async () => [] }), findOne: () => ({ populate: async () => null }), create: async (data) => ({ _id: objectId, ...data }), findOneAndUpdate: async (filter, data) => ({ _id: objectId, name: 'Demo Clinic', facilityType: 'CLINIC', district: 'Colombo', address: 'Demo address', supportedLanguages: ['en'], healthServices: [], emergencyAvailable: false, ...data }) }
  const app = createApp({ userModel: users, healthServiceModel: services, facilityModel: facilities })
  const token = jwt.sign({ role }, process.env.JWT_SECRET, { subject: user.id, expiresIn: '1h' })
  return { app, token }
}
const serviceBody = { name: 'General Medicine', category: 'General' }
const facilityBody = { name: 'Demo Clinic', facilityType: 'CLINIC', district: 'Colombo', address: 'Demo address', supportedLanguages: ['en'], healthServices: [objectId], emergencyAvailable: false }

test.each(['PATIENT', 'DOCTOR'])('%s cannot mutate services or facilities', async (role) => { const { app, token } = setup(role); for (const [path, body] of [['/api/v1/health-services', serviceBody], ['/api/v1/facilities', facilityBody]]) expect((await request(app).post(path).set('Authorization', `Bearer ${token}`).send(body)).status).toBe(403) })
test('unauthenticated callers cannot mutate resources', async () => { const { app } = setup(); expect((await request(app).post('/api/v1/health-services').send(serviceBody)).status).toBe(401) })
test('inactive ADMIN cannot mutate resources', async () => { const { app, token } = setup('ADMIN', false); expect((await request(app).post('/api/v1/health-services').set('Authorization', `Bearer ${token}`).send(serviceBody)).status).toBe(403) })
test('ADMIN can create, update, and deactivate a service', async () => { const { app, token } = setup(); expect((await request(app).post('/api/v1/health-services').set('Authorization', `Bearer ${token}`).send(serviceBody)).status).toBe(201); expect((await request(app).patch(`/api/v1/health-services/${objectId}`).set('Authorization', `Bearer ${token}`).send({ name: 'Updated Service' })).status).toBe(200); expect((await request(app).delete(`/api/v1/health-services/${objectId}`).set('Authorization', `Bearer ${token}`)).status).toBe(200) })
test('ADMIN can create a facility', async () => { const { app, token } = setup(); expect((await request(app).post('/api/v1/facilities').set('Authorization', `Bearer ${token}`).send(facilityBody)).status).toBe(201) })
test.each([['/api/v1/health-services', { name: '', category: '' }], ['/api/v1/facilities', { ...facilityBody, district: 'Invalid' }], ['/api/v1/facilities', { ...facilityBody, facilityType: 'INVALID' }], ['/api/v1/facilities', { ...facilityBody, supportedLanguages: ['fourth'] }], ['/api/v1/facilities', { ...facilityBody, emergencyAvailable: 'yes' }]])('rejects invalid body for %s', async (path, body) => { const { app, token } = setup(); const response = await request(app).post(path).set('Authorization', `Bearer ${token}`).send(body); expect(response.status).toBe(422); expect(response.body.success).toBe(false) })
test('rejects malformed IDs and invalid filters safely', async () => { const { app } = setup(); expect((await request(app).get('/api/v1/facilities/bad')).status).toBe(422); expect((await request(app).get('/api/v1/facilities?district=Invalid')).status).toBe(422); expect((await request(app).get('/api/v1/facilities?healthService=bad')).status).toBe(422) })
test('public lists retain the common empty collection contract', async () => { const { app } = setup(); expect((await request(app).get('/api/v1/health-services')).body).toEqual({ success: true, data: { items: [], count: 0 } }); expect((await request(app).get('/api/v1/facilities')).body).toEqual({ success: true, data: { items: [], count: 0 } }) })
