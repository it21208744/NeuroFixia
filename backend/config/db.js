const mongoose = require('mongoose')

let memoryServer = null

/**
 * Connects to MONGO_URI. When it is not set (local demo / free hosting without a database)
 * an embedded MongoDB is started instead so the app still works end-to-end.
 */
async function connectDB() {
  let uri = process.env.MONGO_URI
  if (!uri) {
    const { MongoMemoryServer } = require('mongodb-memory-server')
    memoryServer = await MongoMemoryServer.create({
      // MONGO_DATA_DIR lets a container with a persistent volume keep data between restarts
      instance: { dbName: 'neurofixia', dbPath: process.env.MONGO_DATA_DIR || undefined, storageEngine: 'wiredTiger' },
    })
    uri = memoryServer.getUri('neurofixia')
    console.warn('[db] MONGO_URI not set - using embedded MongoDB (data is not persisted across restarts)')
  }
  await mongoose.connect(uri)
  console.log(`[db] MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`)
}

async function disconnectDB() {
  await mongoose.disconnect()
  if (memoryServer) await memoryServer.stop()
}

module.exports = { connectDB, disconnectDB }
