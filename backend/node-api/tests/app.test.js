import request from 'supertest'
import app, { createApp } from '../src/app.js'
import ApiError from '../src/utils/ApiError.js'

describe('Node API foundation', () => {
  test('GET /api/v1/health returns the health contract', async () => {
    const response = await request(app).get('/api/v1/health')
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ success: true, data: { service: 'CareRoute LK Node API', status: 'healthy' } })
  })

  test('unknown routes return the common 404 contract', async () => {
    const response = await request(app).get('/api/v1/unknown')
    expect(response.status).toBe(404)
    expect(response.body).toEqual({ success: false, error: { code: 'NOT_FOUND', message: 'Requested resource was not found' } })
  })

  test('operational errors retain their safe contract', async () => {
    const testApp = createApp({ registerAdditionalRoutes: (instance) => instance.get('/test-error', () => { throw new ApiError(409, 'TEST_CONFLICT', 'Safe test conflict') }) })
    const response = await request(testApp).get('/test-error')
    expect(response.status).toBe(409)
    expect(response.body).toEqual({ success: false, error: { code: 'TEST_CONFLICT', message: 'Safe test conflict' } })
  })
})
