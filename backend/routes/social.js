const express = require('express')
const { SocialProfile, SocialResponse, SimonScore } = require('../models')
const { client, mlError } = require('../services/ml')

const router = express.Router()

// Initial details (was /Iroute/add on port 8070)
router.post('/profile', async (req, res) => {
  const { age, gender, lang } = req.body || {}
  if (!age || !gender || !lang) return res.status(400).json({ message: 'Age, gender and language are required' })
  const doc = await SocialProfile.findOneAndUpdate(
    { userId: req.user._id },
    { age, gender, lang },
    { upsert: true, new: true }
  )
  res.json(doc)
})

router.get('/profile', async (req, res) => {
  res.json(await SocialProfile.findOne({ userId: req.user._id }).lean())
})

// Questionnaire analysis (was /Sroute/analyze -> hard-coded http://192.168.1.5:5001)
router.post('/analyze', async (req, res) => {
  const b = req.body || {}
  const answers = [b.q1, b.q2, b.q3, b.q4, b.q5, b.q6, b.q7, b.q8]
  if (answers.some((a) => !a) || !b.q9 || !b.q10) return res.status(400).json({ message: 'Please answer all 10 questions' })
  try {
    const { data } = await client().post('/social/analyze', { answers, q9: b.q9, q10: b.q10 })
    const saved = await SocialResponse.create({
      userId: req.user._id,
      lang: b.lang,
      q1: b.q1, q2: b.q2, q3: b.q3, q4: b.q4, q5: b.q5, q6: b.q6, q7: b.q7, q8: b.q8, q9: b.q9, q10: b.q10,
      risk_prediction: data.risk_prediction === 1 ? 'Risk Detected' : 'No Risk Detected',
      risk_probability: data.risk_probability,
      sentiment_q9: data.sentiment_q9,
      sentiment_q10: data.sentiment_q10,
      important_negative_responses: data.important_negative_responses,
      importance_scores: data.importance_scores,
      top_3_features: data.top_3_features,
      date: new Date(),
    })
    return res.json({ ...data, _id: saved._id })
  } catch (err) {
    return mlError(res, err, 'Questionnaire analysis failed')
  }
})

router.get('/responses', async (req, res) => {
  res.json(await SocialResponse.find({ userId: req.user._id }).sort({ date: 1 }).lean())
})

router.delete('/responses/:id', async (req, res) => {
  const r = await SocialResponse.deleteOne({ _id: req.params.id, userId: req.user._id })
  if (!r.deletedCount) return res.status(404).json({ message: 'Not found' })
  res.json({ status: 'Deleted' })
})

// Simon-says improvement activity scores (Scoreroute existed but was never mounted)
router.post('/scores', async (req, res) => {
  const { finalScore, currentLevel } = req.body || {}
  res.status(201).json(await SimonScore.create({ userId: req.user._id, finalScore, currentLevel }))
})

router.get('/scores', async (req, res) => {
  res.json(await SimonScore.find({ userId: req.user._id }).sort({ createdAt: 1 }).lean())
})

module.exports = router
