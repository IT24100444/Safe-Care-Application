import mongoose from 'mongoose'

export async function connectDatabase(uri) {
  if (!uri) throw new Error('MongoDB configuration is missing')
  try { await mongoose.connect(uri) } catch { throw new Error('Unable to connect to MongoDB') }
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect()
}
