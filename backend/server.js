require('dotenv').config()
const path = require('path')
const fs = require('fs')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const { connectDB } = require('./config/db')
const { protect } = require('./middleware/auth')
const { client: mlClient } = require('./services/ml')

function createApp() {
  const app = express()
  app.set('trust proxy', 1)
  // CSP is disabled because the SPA loads Google Fonts and WebGazer's face-mesh models from CDNs.
  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }))
  const origins = (process.env.CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean)
  app.use(cors(origins.length ? { origin: origins } : undefined))
  app.use(express.json({ limit: '2mb' }))
  if (process.env.NODE_ENV !== 'test') app.use(morgan('tiny'))

  app.get('/api/health', async (req, res) => {
    let ml = 'unavailable'
    try {
      const { data } = await mlClient().get('/health', { timeout: 3000 })
      ml = data.status
    } catch (e) {
      /* ML service still starting */
    }
    res.json({ status: 'ok', ml })
  })

  app.use('/api/users', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }), require('./routes/users'))
  app.use('/api/behavioral', protect, require('./routes/behavioral'))
  app.use('/api/sensory', protect, require('./routes/sensory'))
  app.use('/api/social', protect, require('./routes/social'))
  app.use('/api/cognitive', protect, require('./routes/cognitive'))
  app.use('/api/dashboard', protect, require('./routes/dashboard'))
  app.use('/api', (req, res) => res.status(404).json({ message: `No API route ${req.method} ${req.originalUrl}` }))

  // Serve the React build (single-container deployment)
  const build = process.env.FRONTEND_BUILD || path.join(__dirname, '..', 'frontend', 'build')
  if (fs.existsSync(path.join(build, 'index.html'))) {
    app.use(express.static(build, { maxAge: '7d', index: false }))
    app.get('*', (req, res) => res.sendFile(path.join(build, 'index.html')))
  }

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err)
    const status = err.status || (err.code === 'LIMIT_FILE_SIZE' ? 413 : 500)
    res.status(status).json({ message: err.message || 'Server error' })
  })
  return app
}

if (require.main === module) {
  const PORT = process.env.PORT || 5000
  connectDB()
    .then(() => createApp().listen(PORT, () => console.log(`[api] listening on :${PORT}`)))
    .catch((err) => {
      console.error('[db] connection failed:', err.message)
      process.exit(1)
    })
}

module.exports = { createApp }
