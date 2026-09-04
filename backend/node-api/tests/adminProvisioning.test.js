import bcrypt from 'bcryptjs'
import { provisionAdmin } from '../src/services/adminProvisioningService.js'

const input = { name: 'Test Admin', email: 'ADMIN@example.com', password: 'Secure123' }
test('provisions normalized ADMIN with hashed password', async () => { let stored; const model = { findOne: async () => null, create: async (data) => (stored = data) }; await provisionAdmin(model, input); expect(stored.role).toBe('ADMIN'); expect(stored.email).toBe('admin@example.com'); expect(stored.passwordHash).not.toBe(input.password); expect(await bcrypt.compare(input.password, stored.passwordHash)).toBe(true) })
test('rejects duplicate admin', async () => { await expect(provisionAdmin({ findOne: async () => ({}) }, input)).rejects.toMatchObject({ statusCode: 409 }) })
test.each([{ email: 'bad' }, { password: 'weak' }, { name: '' }])('rejects invalid provisioning input %#', async (override) => { await expect(provisionAdmin({}, { ...input, ...override })).rejects.toMatchObject({ statusCode: 422 }) })
