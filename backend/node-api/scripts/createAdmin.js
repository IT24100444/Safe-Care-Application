import { connectDatabase, disconnectDatabase } from '../src/config/database.js'
import { getConfig } from '../src/config/env.js'
import User from '../src/models/User.js'
import { provisionAdmin } from '../src/services/adminProvisioningService.js'

async function run() {
  const { mongoUri } = getConfig({ requireDatabase: true })
  await connectDatabase(mongoUri)
  await provisionAdmin(User, { name: process.env.ADMIN_NAME, email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD })
  console.info('Administrator account created successfully')
}
run().catch((error) => { console.error(`Administrator provisioning failed: ${error.message}`); process.exitCode = 1 }).finally(disconnectDatabase)
