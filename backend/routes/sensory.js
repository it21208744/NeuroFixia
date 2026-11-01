const express = require('express')
const multer = require('multer')
const FormData = require('form-data')
const { SensorySession, SensoryTest } = require('../models')
const { client, mlError } = require('../services/ml')

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 250 * 1024 * 1024 } })

// Hypersensitivity test (was a direct browser call to http://localhost:5031/predict)
router.post('/predict', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Please record or choose a video first' })
  const form = new FormData()
  form.append('file', req.file.buffer, { filename: req.file.originalname || 'video.webm', contentType: req.file.mimetype })
  try {
    const { data } = await client().post('/sensory/predict', form, { headers: form.getHeaders() })
    await SensoryTest.create({ ...data, userId: req.user._id, age: Number(req.body.age) || undefined, noise: req.body.noise })
    return res.json(data)
  } catch (err) {
    return mlError(res, err, 'Video analysis failed')
  }
})

router.get('/tests', async (req, res) => {
  res.json(await SensoryTest.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean())
})

// Auditory-therapy sessions. userId now comes from the auth token (was hard-coded to "1").
router.post('/sessions', async (req, res) => {
  const { sound, volume, duration } = req.body || {}
  try {
    await SensorySession.create({ userId: req.user._id, sound, volume, duration })
    res.status(201).json({ message: 'Session logged' })
  } catch (err) {
    res.status(400).json({ message: 'Invalid session data', error: err.message })
  }
})

router.get('/sessions', async (req, res) => {
  const sessions = await SensorySession.find({ userId: req.user._id }).sort({ createdAt: 1 }).lean()
  res.json(sessions.map((s) => ({ ...s, timestamp: s.createdAt })))
})

module.exports = router
