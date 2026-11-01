const express = require('express')
const multer = require('multer')
const FormData = require('form-data')
const { BehavioralResult, ExpressionGameScore } = require('../models')
const { client, mlError } = require('../services/ml')

const router = express.Router()
// Bug fix: uploads used to be written to ./uploads (which did not exist) and never forwarded -
// the Python API instead read whatever file happened to be in testFiles/video on the dev machine.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 250 * 1024 * 1024 } })

router.post(
  '/analyze',
  upload.fields([{ name: 'video', maxCount: 1 }, { name: 'scanpath', maxCount: 1 }, { name: 'image', maxCount: 1 }]),
  async (req, res) => {
    const form = new FormData()
    const video = req.files?.video?.[0]
    const scan = req.files?.scanpath?.[0] || req.files?.image?.[0]
    if (video) form.append('video', video.buffer, { filename: video.originalname || 'video.webm', contentType: video.mimetype })
    if (scan) form.append('scanpath', scan.buffer, { filename: scan.originalname || 'scanpath.png', contentType: scan.mimetype })
    let expressions = []
    try {
      expressions = req.body.expressions ? JSON.parse(req.body.expressions) : []
    } catch (e) {
      return res.status(400).json({ message: 'expressions must be a JSON array' })
    }
    if (expressions.length) form.append('expressions', JSON.stringify(expressions))
    if (!video && !scan && !expressions.length) return res.status(400).json({ message: 'Nothing to analyse' })

    try {
      const { data } = await client().post('/behavioral/analyze', form, { headers: form.getHeaders() })
      const saved = await BehavioralResult.create({
        ...data,
        userId: req.user._id,
        expressions,
        gazePoints: Number(req.body.gazePoints) || undefined,
      })
      return res.json({ ...data, _id: saved._id, createdAt: saved.createdAt })
    } catch (err) {
      return mlError(res, err, 'Behavioural analysis failed')
    }
  }
)

router.get('/predictions', async (req, res) => {
  const items = await BehavioralResult.find({ userId: req.user._id }).sort({ createdAt: 1 }).lean()
  res.json(items)
})

router.delete('/predictions/:id', async (req, res) => {
  await BehavioralResult.deleteOne({ _id: req.params.id, userId: req.user._id })
  res.json({ status: 'Deleted' })
})

router.post('/expression-game', async (req, res) => {
  const { correct, total, seconds } = req.body || {}
  const doc = await ExpressionGameScore.create({ userId: req.user._id, correct, total, seconds })
  res.status(201).json(doc)
})

router.get('/expression-game', async (req, res) => {
  res.json(await ExpressionGameScore.find({ userId: req.user._id }).sort({ createdAt: 1 }).lean())
})

module.exports = router
