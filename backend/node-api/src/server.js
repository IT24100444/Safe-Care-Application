import http from 'node:http'
import app from './app.js'
import { connectDatabase, disconnectDatabase } from './config/database.js'
import { getConfig } from './config/env.js'

let server
let shuttingDown = false

async function shutdown(signal) {
  if (shuttingDown) return
  shuttingDown = true
  console.info(`${signal} received; shutting down`)
  if (server) await new Promise((resolve) => server.close(resolve))
  await disconnectDatabase()
}

async function start() {
  const config = getConfig({ requireDatabase: true, requireJwt: true })
  await connectDatabase(config.mongoUri)
  server = http.createServer(app)
  server.on('error', async (error) => { console.error('HTTP server failed to start:', error.message); await disconnectDatabase(); process.exitCode = 1 })
  server.listen(config.port, () => console.info(`CareRoute LK Node API listening on port ${config.port}`))
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { shutdown(signal).then(() => process.exit(0)).catch(() => process.exit(1)) })
}

start().catch((error) => { console.error(`Node API startup failed: ${error.message}`); process.exitCode = 1 })
